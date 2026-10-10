// Plans the sync of `hts_codes` rows (numbered lines + unnumbered group header rows) with an HTS edition,
// simulates the post-sync state in memory, and renders the forward + rollback SQL. Pure: no DB access —
// build-hts-lines-sync-sql.ts loads the current rows (read-only) and the edition, then calls these.
//
// Formats mirror the original per-chapter CSV ingest (`hts:import-chapter`, commit cca8b5131, since removed):
// - rows are kept in the published order; `sort_order` = 0-based position within the chapter;
// - a row's chapter is the chapter of its numbered line; an unnumbered header row belongs to the chapter
//   of the next numbered line (the per-chapter CSVs start with e.g. "I. CHEMICAL ELEMENTS" for chapter 28);
// - description trimmed; rate/quota/additional-duty cells trimmed, blank → NULL; units → TEXT[];
//   `hts_code_10` = the digits of a 10-digit line, else NULL;
// - `parent_id` = the most recent row whose indent is `indent - 1`, walking the chapter in order with an
//   indent stack that is cut back at every row (so a shallower row in between ends the candidate). Rows
//   with indent 0, and the chapter-leading section headers with no such row above them, get NULL.

import { createHash } from 'node:crypto';
import type { HtsJsonRow } from './hts-source';
import { chunk, compareCodes, sqlText, sqlTextArray } from './sql';

export interface EditionLine {
  chapter: number;
  /** 0-based position within the chapter = the post-sync sort_order. */
  pos: number;
  htsNumber: string | null;
  htsCode10: string | null;
  indent: number;
  description: string;
  units: string[];
  general: string | null;
  special: string | null;
  column2: string | null;
  quota: string | null;
  additional: string | null;
}

/** One current `hts_codes` row, as loaded read-only from the DB. */
export interface CurrentRow {
  id: string;
  htsNumber: string | null;
  htsCode10: string | null;
  indent: number;
  description: string;
  unitOfQuantity: string[];
  generalRateOfDuty: string | null;
  specialRateOfDuty: string | null;
  column2RateOfDuty: string | null;
  quotaQuantity: string | null;
  additionalDuties: string | null;
  chapterId: string;
  parentId: string | null;
  sortOrder: number;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateLinkRow {
  id: string;
  htsCodeId: string;
  candidateCodeId: string;
  lastFetchedAt: Date;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterPlan {
  chapter: number;
  chapterId: string;
  edition: EditionLine[];
  /** Existing row id per edition position, or null for a row to insert. */
  ids: (string | null)[];
  /** Edition position of each row's parent (null = no parent). */
  parentPos: (number | null)[];
  /** Current rows of this chapter, in sort_order. */
  current: CurrentRow[];
  /** Current rows the edition no longer has. */
  deleted: CurrentRow[];
  newNumbered: string[];
  newHeaders: EditionLine[];
  removedNumbered: string[];
  removedHeaders: CurrentRow[];
  /** Kept rows whose indent / description / sort_order / parent change. */
  reindented: number;
  redescribed: number;
  resequenced: number;
  reparented: number;
  affected: boolean;
}

function nullIfEmpty(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function toHtsCode10(htsNumber: string | null): string | null {
  if (!htsNumber) return null;
  const digits = htsNumber.replace(/\./g, '');
  return digits.length === 10 ? digits : null;
}

/** Edition rows grouped by chapter, in published order. Header rows go to the chapter of the next numbered line. */
export function editionByChapter(rows: readonly HtsJsonRow[]): Map<number, EditionLine[]> {
  const out = new Map<number, EditionLine[]>();
  let pendingHeaders: HtsJsonRow[] = [];
  const push = (chapter: number, row: HtsJsonRow) => {
    const lines = out.get(chapter) ?? [];
    if (!out.has(chapter)) out.set(chapter, lines);
    const htsNumber = nullIfEmpty(row.htsno);
    const indent = parseInt(row.indent, 10);
    if (!Number.isFinite(indent) || indent < 0) throw new Error(`bad indent "${row.indent}" at ${htsNumber ?? row.description}`);
    lines.push({
      chapter,
      pos: lines.length,
      htsNumber,
      htsCode10: toHtsCode10(htsNumber),
      indent,
      description: (row.description ?? '').trim(),
      units: (row.units ?? []).map((u) => u.trim()).filter((u) => u.length > 0),
      general: nullIfEmpty(row.general),
      special: nullIfEmpty(row.special),
      column2: nullIfEmpty(row.other),
      quota: nullIfEmpty(row.quotaQuantity),
      additional: nullIfEmpty(row.additionalDuties),
    });
  };
  for (const row of rows) {
    const htsNumber = nullIfEmpty(row.htsno);
    if (!htsNumber) {
      pendingHeaders.push(row);
      continue;
    }
    const chapter = parseInt(htsNumber.slice(0, 2), 10);
    if (!/^\d{2}/.test(htsNumber) || chapter < 1 || chapter > 99) throw new Error(`cannot tell the chapter of HTS number "${htsNumber}"`);
    for (const h of pendingHeaders) push(chapter, h);
    pendingHeaders = [];
    push(chapter, row);
  }
  if (pendingHeaders.length) throw new Error(`${pendingHeaders.length} header row(s) after the last numbered line`);
  return out;
}

/** Parent position per row, exactly as the original ingest's indent stack assigned it. */
export function stackParents(indents: readonly number[]): (number | null)[] {
  const stack: (number | null)[] = [];
  return indents.map((indent, pos) => {
    const parent = indent === 0 ? null : stack[indent - 1] ?? null;
    stack[indent] = pos;
    stack.length = indent + 1;
    return parent;
  });
}

/**
 * Nearest preceding row with indent - 1 with no stack cut. Differs from `stackParents` only where the edition
 * skips an indent level (e.g. 2620.99.75 at indent 3 → 2620.99.75.20 at indent 5): the stack rule leaves those
 * rows without a parent, while this would attach them to an unrelated line further up. Reported, not used.
 */
export function nearestPrecedingParents(indents: readonly number[]): (number | null)[] {
  return indents.map((indent, pos) => {
    if (indent === 0) return null;
    for (let i = pos - 1; i >= 0; i--) if (indents[i] === indent - 1) return i;
    return null;
  });
}

export function normalizeDescription(description: string): string {
  return description.replace(/\s+/g, ' ').trim();
}

function rowKey(htsNumber: string | null, indent: number, description: string): string {
  return htsNumber ? `N|${htsNumber}` : `H|${indent}|${normalizeDescription(description)}`;
}

/** Longest common subsequence of two key sequences → pairs (a index, b index), in order. */
function lcsPairs(a: readonly string[], b: readonly string[]): [number, number][] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const table = new Uint16Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] = a[i] === b[j] ? table[(i + 1) * width + j + 1] + 1 : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * Plans one chapter: numbered rows match by hts_number; header rows match by (indent, normalized
 * description) in sequence order (an LCS over the chapter's row keys, numbered lines acting as anchors).
 */
export function planChapter(chapter: number, chapterId: string, current: CurrentRow[], edition: EditionLine[]): ChapterPlan {
  const cur = [...current].sort((x, y) => x.sortOrder - y.sortOrder || compareCodes(x.id, y.id));
  const ids: (string | null)[] = edition.map(() => null);
  const used = new Set<string>();
  const pairs = lcsPairs(
    cur.map((r) => rowKey(r.htsNumber, r.indent, r.description)),
    edition.map((e) => rowKey(e.htsNumber, e.indent, e.description))
  );
  for (const [ci, ei] of pairs) {
    ids[ei] = cur[ci].id;
    used.add(cur[ci].id);
  }
  // Numbered lines that moved (outside the LCS) still match by number.
  const byNumber = new Map(cur.filter((r) => r.htsNumber && !used.has(r.id)).map((r) => [r.htsNumber as string, r]));
  edition.forEach((e, pos) => {
    if (ids[pos] || !e.htsNumber) return;
    const r = byNumber.get(e.htsNumber);
    if (r) {
      ids[pos] = r.id;
      used.add(r.id);
    }
  });

  const parentPos = stackParents(edition.map((e) => e.indent));
  const deleted = cur.filter((r) => !used.has(r.id));
  const byId = new Map(cur.map((r) => [r.id, r]));
  let reindented = 0;
  let redescribed = 0;
  let resequenced = 0;
  let reparented = 0;
  edition.forEach((e, pos) => {
    const id = ids[pos];
    if (!id) return;
    const r = byId.get(id) as CurrentRow;
    if (r.indent !== e.indent) reindented++;
    if (r.description !== e.description) redescribed++;
    if (r.sortOrder !== pos) resequenced++;
    const pp = parentPos[pos];
    const expectedParent = pp === null ? null : ids[pp];
    if (r.parentId !== expectedParent || (pp !== null && expectedParent === null)) reparented++;
  });
  const newNumbered = edition.filter((e, pos) => !ids[pos] && e.htsNumber).map((e) => e.htsNumber as string);
  const newHeaders = edition.filter((e, pos) => !ids[pos] && !e.htsNumber);
  const removedNumbered = deleted.filter((r) => r.htsNumber).map((r) => r.htsNumber as string);
  const removedHeaders = deleted.filter((r) => !r.htsNumber);
  const affected = newNumbered.length + newHeaders.length + deleted.length + reindented + redescribed + resequenced + reparented > 0;
  return {
    chapter,
    chapterId,
    edition,
    ids,
    parentPos,
    current: cur,
    deleted,
    newNumbered,
    newHeaders,
    removedNumbered,
    removedHeaders,
    reindented,
    redescribed,
    resequenced,
    reparented,
    affected,
  };
}

export function planSync(
  currentRows: readonly CurrentRow[],
  chapters: readonly { id: string; number: number }[],
  edition: Map<number, EditionLine[]>
): ChapterPlan[] {
  const chapterIdByNumber = new Map(chapters.map((c) => [c.number, c.id]));
  const numberByChapterId = new Map(chapters.map((c) => [c.id, c.number]));
  const rowsByChapter = new Map<number, CurrentRow[]>();
  for (const r of currentRows) {
    const n = numberByChapterId.get(r.chapterId);
    if (n === undefined) throw new Error(`hts_codes row ${r.id} points at unknown chapter ${r.chapterId}`);
    const list = rowsByChapter.get(n) ?? [];
    if (!rowsByChapter.has(n)) rowsByChapter.set(n, list);
    list.push(r);
  }
  const numbers = [...new Set([...edition.keys(), ...rowsByChapter.keys()])].sort((a, b) => a - b);
  return numbers.map((n) => {
    const chapterId = chapterIdByNumber.get(n);
    if (!chapterId) throw new Error(`chapter ${n} is in the edition but not in tariff_chapters — seed the chapter first`);
    return planChapter(n, chapterId, rowsByChapter.get(n) ?? [], edition.get(n) ?? []);
  });
}

// ---------------------------------------------------------------------------------------------------
// In-memory simulation + integrity rules
// ---------------------------------------------------------------------------------------------------

export interface SimRow {
  id: string;
  chapter: number;
  htsNumber: string | null;
  indent: number;
  description: string;
  parentId: string | null;
  sortOrder: number;
}

/** Applies the plans to the current rows the way the SQL does: delete (parent SET NULL), insert, re-sequence + re-parent. */
export function simulate(currentRows: readonly CurrentRow[], chapters: readonly { id: string; number: number }[], plans: readonly ChapterPlan[]): SimRow[] {
  const numberByChapterId = new Map(chapters.map((c) => [c.id, c.number]));
  const rows = new Map<string, SimRow>(
    currentRows.map((r) => [
      r.id,
      {
        id: r.id,
        chapter: numberByChapterId.get(r.chapterId) as number,
        htsNumber: r.htsNumber,
        indent: r.indent,
        description: r.description,
        parentId: r.parentId,
        sortOrder: r.sortOrder,
      },
    ])
  );
  for (const plan of plans.filter((p) => p.affected)) {
    for (const d of plan.deleted) rows.delete(d.id);
    for (const r of rows.values()) if (r.parentId && !rows.has(r.parentId)) r.parentId = null; // ON DELETE SET NULL
    const finalIds = plan.edition.map((e, pos) => plan.ids[pos] ?? `new:${plan.chapter}:${pos}`);
    plan.edition.forEach((e, pos) => {
      if (!plan.ids[pos])
        rows.set(finalIds[pos], {
          id: finalIds[pos],
          chapter: plan.chapter,
          htsNumber: e.htsNumber,
          indent: e.indent,
          description: e.description,
          parentId: null,
          sortOrder: pos,
        });
    });
    plan.edition.forEach((e, pos) => {
      const r = rows.get(finalIds[pos]) as SimRow;
      const pp = plan.parentPos[pos];
      r.sortOrder = pos;
      r.indent = e.indent;
      r.description = e.description;
      r.parentId = pp === null ? null : finalIds[pp];
    });
  }
  return [...rows.values()];
}

export interface IntegrityResult {
  name: string;
  actual: number;
  expected: number;
}

/** The same rules the SQL asserts, checked on a (simulated) state for every chapter. */
export function checkIntegrity(rows: readonly SimRow[], edition: Map<number, EditionLine[]>): IntegrityResult[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const byChapter = new Map<number, SimRow[]>();
  for (const r of rows) {
    const list = byChapter.get(r.chapter) ?? [];
    if (!byChapter.has(r.chapter)) byChapter.set(r.chapter, list);
    list.push(r);
  }
  let countMismatch = 0;
  let dupSort = 0;
  let sequenceMismatch = 0;
  let badParent = 0;
  let parentNotStack = 0;
  let expectedOrphans = 0;
  let orphans = 0;
  for (const n of new Set([...edition.keys(), ...byChapter.keys()])) {
    const ed = edition.get(n) ?? [];
    const list = [...(byChapter.get(n) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    if (list.length !== ed.length) countMismatch++;
    dupSort += list.length - new Set(list.map((r) => r.sortOrder)).size;
    list.forEach((r, i) => {
      const e = ed[i];
      if (!e || r.htsNumber !== e.htsNumber || r.indent !== e.indent || normalizeDescription(r.description) !== normalizeDescription(e.description))
        sequenceMismatch++;
    });
    const stack = stackParents(list.map((r) => r.indent));
    list.forEach((r, i) => {
      const expectedParentId = stack[i] === null ? null : list[stack[i] as number].id;
      if (r.parentId !== expectedParentId) parentNotStack++;
      if (r.indent > 0 && stack[i] === null) expectedOrphans++;
      if (r.indent > 0 && r.parentId === null) orphans++;
      if (r.indent === 0 && r.parentId !== null) badParent++;
      if (r.parentId !== null) {
        const p = byId.get(r.parentId);
        if (!p || p.chapter !== r.chapter || p.indent !== r.indent - 1 || p.sortOrder >= r.sortOrder) badParent++;
      }
    });
  }
  const editionNumbers = new Set<string>();
  for (const lines of edition.values()) for (const e of lines) if (e.htsNumber) editionNumbers.add(e.htsNumber);
  const rowNumbers = rows.filter((r) => r.htsNumber).map((r) => r.htsNumber as string);
  const rowNumberSet = new Set(rowNumbers);
  return [
    { name: 'chapters whose row count differs from the edition', actual: countMismatch, expected: 0 },
    { name: 'duplicate sort_order within a chapter', actual: dupSort, expected: 0 },
    { name: 'rows (by sort_order) that differ from the edition row at that position', actual: sequenceMismatch, expected: 0 },
    { name: 'rows whose parent is not in the same chapter, one indent up, and above them', actual: badParent, expected: 0 },
    { name: 'rows whose parent_id differs from the indent-stack rule', actual: parentNotStack, expected: 0 },
    { name: 'indent>0 rows without a parent (chapter-leading section headers, indent gaps in the edition)', actual: orphans, expected: expectedOrphans },
    { name: 'duplicate hts_number', actual: rowNumbers.length - rowNumberSet.size, expected: 0 },
    { name: 'edition numbered lines missing from hts_codes', actual: [...editionNumbers].filter((h) => !rowNumberSet.has(h)).length, expected: 0 },
    { name: 'hts_codes numbered lines not in the edition', actual: [...rowNumberSet].filter((h) => !editionNumbers.has(h)).length, expected: 0 },
  ];
}

/** md5 of a chapter's row ids in sort_order — the SQL's drift guard computes the same with string_agg. */
export function idsFingerprint(rows: readonly { id: string; sortOrder: number }[]): string {
  const ids = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || compareCodes(a.id, b.id)).map((r) => r.id);
  return createHash('md5').update(ids.join(',')).digest('hex');
}

// ---------------------------------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------------------------------

function sqlInt(n: number | null): string {
  return n === null ? 'NULL' : String(n);
}

/** TIMESTAMP(3) literal for a Prisma DateTime (stored as UTC without time zone). */
function sqlTimestamp(d: Date): string {
  return `TIMESTAMP '${d.toISOString().replace('T', ' ').replace('Z', '')}'`;
}

function valuesInserts(table: string, columns: string, tuples: readonly string[], size = 500): string[] {
  const out: string[] = [];
  for (const part of chunk(tuples, size)) {
    out.push(`INSERT INTO ${table} (${columns}) VALUES`);
    out.push(part.map((t) => `  (${t})`).join(',\n') + ';');
  }
  return out;
}

/** Statement body of the forward sync (no BEGIN/COMMIT). */
export function buildSyncSql(plans: readonly ChapterPlan[], edition: Map<number, EditionLine[]>, spaceId: string, linksToCascade: number): string {
  const affected = plans.filter((p) => p.affected);
  const space = sqlText(spaceId);
  const chapterList = affected.map((p) => p.chapter).join(', ');
  const out: string[] = [];
  const section = (title: string) =>
    out.push(
      '',
      `-- ---------------------------------------------------------------------------`,
      `-- ${title}`,
      `-- ---------------------------------------------------------------------------`
    );

  section(`0. Guard: the affected chapters still hold exactly the rows this file was generated from`);
  out.push(`CREATE TEMP TABLE tmp_hts_sync_snapshot (chapter_number INT PRIMARY KEY, row_count INT NOT NULL, ids_md5 TEXT NOT NULL) ON COMMIT DROP;`);
  out.push(
    ...valuesInserts(
      'tmp_hts_sync_snapshot',
      'chapter_number, row_count, ids_md5',
      affected.map((p) => `${p.chapter}, ${p.current.length}, ${sqlText(idsFingerprint(p.current))}`)
    )
  );
  out.push(`DO $$ DECLARE drifted TEXT; BEGIN`);
  out.push(`  SELECT string_agg(s.chapter_number::text, ', ' ORDER BY s.chapter_number) INTO drifted`);
  out.push(`    FROM tmp_hts_sync_snapshot s`);
  out.push(`    LEFT JOIN tariff_chapters c ON c.space_id = ${space} AND c.number = s.chapter_number`);
  out.push(`    LEFT JOIN LATERAL (SELECT count(*)::int AS n, md5(coalesce(string_agg(h.id, ',' ORDER BY h.sort_order, h.id COLLATE "C"), '')) AS m`);
  out.push(`                         FROM hts_codes h WHERE h.chapter_id = c.id AND h.space_id = ${space}) cur ON true`);
  out.push(`   WHERE c.id IS NULL OR cur.n <> s.row_count OR cur.m <> s.ids_md5;`);
  out.push(
    `  IF drifted IS NOT NULL THEN RAISE EXCEPTION 'hts_codes changed since this file was generated (or it was already applied) in chapter(s) %. Regenerate it.', drifted; END IF; END $$;`
  );

  section(`1. Edition rows of the ${affected.length} affected chapters (position = new sort_order; parent_pos = parent's position)`);
  out.push(`CREATE TEMP TABLE tmp_hts_sync (`);
  out.push(`  chapter_number INT NOT NULL,`);
  out.push(`  pos INT NOT NULL,`);
  out.push(`  is_new BOOLEAN NOT NULL,`);
  out.push(`  header_id TEXT,            -- existing unnumbered header row this position keeps (matched by indent + description in order)`);
  out.push(`  hts_number TEXT,           -- existing numbered rows are matched on this`);
  out.push(`  hts_code_10 TEXT,`);
  out.push(`  indent INT NOT NULL,`);
  out.push(`  description TEXT NOT NULL,`);
  out.push(`  unit_of_quantity TEXT[],   -- rate / unit columns are only carried for new rows`);
  out.push(`  general_rate_of_duty TEXT,`);
  out.push(`  special_rate_of_duty TEXT,`);
  out.push(`  column2_rate_of_duty TEXT,`);
  out.push(`  quota_quantity TEXT,`);
  out.push(`  additional_duties TEXT,`);
  out.push(`  parent_pos INT,`);
  out.push(`  id TEXT,                   -- resolved below: existing id, or gen_random_uuid() for new rows`);
  out.push(`  PRIMARY KEY (chapter_number, pos)`);
  out.push(`) ON COMMIT DROP;`);
  const tuples: string[] = [];
  for (const p of affected) {
    p.edition.forEach((e, pos) => {
      const isNew = !p.ids[pos];
      const headerId = !isNew && !e.htsNumber ? p.ids[pos] : null;
      tuples.push(
        [
          p.chapter,
          pos,
          isNew ? 'true' : 'false',
          sqlText(headerId),
          sqlText(e.htsNumber),
          sqlText(isNew ? e.htsCode10 : null),
          e.indent,
          sqlText(e.description),
          isNew ? sqlTextArray(e.units) : 'NULL',
          sqlText(isNew ? e.general : null),
          sqlText(isNew ? e.special : null),
          sqlText(isNew ? e.column2 : null),
          sqlText(isNew ? e.quota : null),
          sqlText(isNew ? e.additional : null),
          sqlInt(p.parentPos[pos]),
        ].join(', ')
      );
    });
  }
  out.push(
    ...valuesInserts(
      'tmp_hts_sync',
      'chapter_number, pos, is_new, header_id, hts_number, hts_code_10, indent, description, unit_of_quantity, general_rate_of_duty, special_rate_of_duty, column2_rate_of_duty, quota_quantity, additional_duties, parent_pos',
      tuples
    )
  );
  out.push(`ANALYZE tmp_hts_sync;`);
  out.push('');
  out.push(`UPDATE tmp_hts_sync t SET id = h.id`);
  out.push(`  FROM hts_codes h`);
  out.push(` WHERE NOT t.is_new AND t.hts_number IS NOT NULL AND h.space_id = ${space} AND h.hts_number = t.hts_number;`);
  out.push(`UPDATE tmp_hts_sync SET id = header_id WHERE NOT is_new AND hts_number IS NULL;`);
  out.push(`UPDATE tmp_hts_sync SET id = gen_random_uuid()::text WHERE is_new;`);
  out.push(`DO $$ DECLARE bad INT; BEGIN`);
  out.push(`  SELECT count(*) INTO bad`);
  out.push(`    FROM tmp_hts_sync t`);
  out.push(`    JOIN tariff_chapters c ON c.space_id = ${space} AND c.number = t.chapter_number`);
  out.push(`    LEFT JOIN hts_codes h ON h.id = t.id`);
  out.push(`   WHERE t.id IS NULL`);
  out.push(`      OR (NOT t.is_new AND (h.id IS NULL OR h.chapter_id <> c.id OR h.hts_number IS DISTINCT FROM t.hts_number))`);
  out.push(
    `      OR (t.is_new AND t.hts_number IS NOT NULL AND EXISTS (SELECT 1 FROM hts_codes x WHERE x.space_id = ${space} AND x.hts_number = t.hts_number));`
  );
  out.push(
    `  IF bad > 0 THEN RAISE EXCEPTION '% edition row(s) could not be matched to the expected hts_codes row (or a new line already exists)', bad; END IF; END $$;`
  );

  const deleted = affected.flatMap((p) => p.deleted.map((d) => ({ chapter: p.chapter, row: d })));
  section(`2. Delete the ${deleted.length} rows the edition no longer has (${linksToCascade} hts_code_candidate_codes links cascade with them)`);
  out.push(`CREATE TEMP TABLE tmp_hts_sync_delete (chapter_number INT NOT NULL, hts_number TEXT, id TEXT) ON COMMIT DROP;`);
  out.push(`-- Numbered rows by hts_number; header rows (no number) by id.`);
  out.push(
    ...valuesInserts(
      'tmp_hts_sync_delete',
      'chapter_number, hts_number, id',
      deleted.map(({ chapter, row }) => `${chapter}, ${sqlText(row.htsNumber)}, ${row.htsNumber ? 'NULL' : sqlText(row.id)}`)
    )
  );
  out.push(`UPDATE tmp_hts_sync_delete d SET id = h.id`);
  out.push(`  FROM hts_codes h`);
  out.push(` WHERE d.hts_number IS NOT NULL AND h.space_id = ${space} AND h.hts_number = d.hts_number;`);
  out.push(`DO $$ DECLARE bad INT; BEGIN`);
  out.push(`  SELECT count(*) INTO bad`);
  out.push(`    FROM tmp_hts_sync_delete d`);
  out.push(`    JOIN tariff_chapters c ON c.space_id = ${space} AND c.number = d.chapter_number`);
  out.push(`    LEFT JOIN hts_codes h ON h.id = d.id`);
  out.push(
    `   WHERE h.id IS NULL OR h.chapter_id <> c.id OR h.hts_number IS DISTINCT FROM d.hts_number OR EXISTS (SELECT 1 FROM tmp_hts_sync t WHERE t.id = d.id);`
  );
  out.push(`  IF bad > 0 THEN RAISE EXCEPTION '% row(s) to delete are missing, in another chapter, or still in the edition', bad; END IF; END $$;`);
  out.push(`SELECT 'hts_code_candidate_codes links removed by cascade (expected ${linksToCascade})' AS step, count(*) AS rows`);
  out.push(`  FROM hts_code_candidate_codes l WHERE l.hts_code_id IN (SELECT id FROM tmp_hts_sync_delete);`);
  out.push(`WITH deleted AS (DELETE FROM hts_codes h USING tmp_hts_sync_delete d WHERE h.id = d.id RETURNING h.id)`);
  out.push(`SELECT 'hts_codes rows deleted (expected ${deleted.length})' AS step, count(*) AS rows FROM deleted;`);

  const inserted = affected.reduce((s, p) => s + p.ids.filter((id) => !id).length, 0);
  section(`3. Insert the ${inserted} rows the edition added (parent_id / sort_order are set in step 4)`);
  out.push(`WITH inserted AS (`);
  out.push(`  INSERT INTO hts_codes (id, hts_number, hts_code_10, indent, description, unit_of_quantity, general_rate_of_duty, special_rate_of_duty,`);
  out.push(
    `                         column2_rate_of_duty, quota_quantity, additional_duties, chapter_id, parent_id, sort_order, space_id, created_at, updated_at)`
  );
  out.push(`  SELECT t.id, t.hts_number, t.hts_code_10, t.indent, t.description, t.unit_of_quantity, t.general_rate_of_duty, t.special_rate_of_duty,`);
  out.push(`         t.column2_rate_of_duty, t.quota_quantity, t.additional_duties,`);
  out.push(`         (SELECT c.id FROM tariff_chapters c WHERE c.space_id = ${space} AND c.number = t.chapter_number), NULL, t.pos, ${space}, now(), now()`);
  out.push(`    FROM tmp_hts_sync t WHERE t.is_new ORDER BY t.chapter_number, t.pos`);
  out.push(`  RETURNING id`);
  out.push(`)`);
  out.push(`SELECT 'hts_codes rows inserted (expected ${inserted})' AS step, count(*) AS rows FROM inserted;`);

  section(`4. Re-sequence + re-parent every row of the affected chapters (only differing rows change)`);
  out.push(`WITH updated AS (`);
  out.push(`  UPDATE hts_codes h`);
  out.push(`     SET sort_order = t.pos, indent = t.indent, description = t.description, parent_id = p.id, updated_at = now()`);
  out.push(`    FROM tmp_hts_sync t`);
  out.push(`    LEFT JOIN tmp_hts_sync p ON p.chapter_number = t.chapter_number AND p.pos = t.parent_pos`);
  out.push(`   WHERE h.id = t.id`);
  out.push(`     AND (h.sort_order IS DISTINCT FROM t.pos OR h.indent IS DISTINCT FROM t.indent`);
  out.push(`       OR h.description IS DISTINCT FROM t.description OR h.parent_id IS DISTINCT FROM p.id)`);
  out.push(`  RETURNING h.id`);
  out.push(`)`);
  out.push(`SELECT 'hts_codes rows re-sequenced / re-parented / re-described' AS step, count(*) AS rows FROM updated;`);

  section(`5. Integrity checks (all must be 0 / equal; the DO block aborts the transaction otherwise)`);
  const editionNumbers = [...edition.values()]
    .flat()
    .filter((e) => e.htsNumber)
    .map((e) => e.htsNumber as string)
    .sort(compareCodes);
  out.push(`CREATE TEMP TABLE tmp_hts_edition_numbers (hts_number TEXT PRIMARY KEY) ON COMMIT DROP;`);
  out.push(`-- All ${editionNumbers.length} numbered lines of the edition, for the overall diff.`);
  out.push(
    ...valuesInserts(
      'tmp_hts_edition_numbers',
      'hts_number',
      editionNumbers.map((h) => sqlText(h)),
      2000
    )
  );
  out.push(`ANALYZE tmp_hts_edition_numbers;`);
  out.push(`CREATE TEMP TABLE tmp_hts_sync_checks (check_name TEXT PRIMARY KEY, actual BIGINT NOT NULL, expected BIGINT NOT NULL) ON COMMIT DROP;`);
  out.push(`CREATE TEMP TABLE tmp_hts_sync_rows ON COMMIT DROP AS`);
  out.push(`  SELECT h.id, h.hts_number, h.indent, h.parent_id, h.sort_order, h.chapter_id, c.number AS chapter_number`);
  out.push(`    FROM hts_codes h JOIN tariff_chapters c ON c.id = h.chapter_id`);
  out.push(`   WHERE h.space_id = ${space} AND c.space_id = ${space} AND c.number IN (${chapterList});`);
  out.push(`INSERT INTO tmp_hts_sync_checks (check_name, actual, expected)`);
  out.push(`SELECT 'affected chapters whose row count differs from the edition', count(*), 0`);
  out.push(`  FROM (SELECT t.chapter_number, count(*) AS n FROM tmp_hts_sync t GROUP BY 1) e`);
  out.push(`  LEFT JOIN (SELECT chapter_number, count(*) AS n FROM tmp_hts_sync_rows GROUP BY 1) r ON r.chapter_number = e.chapter_number`);
  out.push(` WHERE r.n IS DISTINCT FROM e.n`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'duplicate sort_order within an affected chapter', count(*), 0`);
  out.push(`  FROM (SELECT chapter_id, sort_order FROM tmp_hts_sync_rows GROUP BY 1, 2 HAVING count(*) > 1) d`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'rows not at their edition position (sort_order / indent / number)', count(*), 0`);
  out.push(`  FROM tmp_hts_sync t LEFT JOIN tmp_hts_sync_rows r ON r.id = t.id`);
  out.push(` WHERE r.id IS NULL OR r.sort_order <> t.pos OR r.indent <> t.indent OR r.hts_number IS DISTINCT FROM t.hts_number`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'rows whose parent is not in the same chapter, one indent up, and above them', count(*), 0`);
  out.push(`  FROM tmp_hts_sync_rows r LEFT JOIN hts_codes p ON p.id = r.parent_id`);
  out.push(` WHERE (r.indent = 0 AND r.parent_id IS NOT NULL)`);
  out.push(`    OR (r.parent_id IS NOT NULL AND (p.id IS NULL OR p.chapter_id <> r.chapter_id OR p.indent <> r.indent - 1 OR p.sort_order >= r.sort_order))`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'rows whose parent_id is not the nearest indent-1 row above them (indent-stack rule)', count(*), 0`);
  out.push(`  FROM tmp_hts_sync t`);
  out.push(`  JOIN tmp_hts_sync_rows r ON r.id = t.id`);
  out.push(`  LEFT JOIN tmp_hts_sync p ON p.chapter_number = t.chapter_number AND p.pos = t.parent_pos`);
  out.push(` WHERE r.parent_id IS DISTINCT FROM p.id`);
  out.push(`UNION ALL`);
  const orphans = affected.reduce((s, p) => s + p.edition.filter((e, pos) => e.indent > 0 && p.parentPos[pos] === null).length, 0);
  out.push(`SELECT 'indent>0 rows without a parent (chapter-leading section headers, indent gaps in the edition)', count(*), ${orphans}`);
  out.push(`  FROM tmp_hts_sync_rows r WHERE r.indent > 0 AND r.parent_id IS NULL`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'rows in affected chapters whose hts_number is not in the edition', count(*), 0`);
  out.push(`  FROM tmp_hts_sync_rows r`);
  out.push(` WHERE r.hts_number IS NOT NULL AND NOT EXISTS (SELECT 1 FROM tmp_hts_edition_numbers e WHERE e.hts_number = r.hts_number)`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'edition numbered lines missing from hts_codes (all chapters)', count(*), 0`);
  out.push(`  FROM tmp_hts_edition_numbers e`);
  out.push(` WHERE NOT EXISTS (SELECT 1 FROM hts_codes h WHERE h.space_id = ${space} AND h.hts_number = e.hts_number)`);
  out.push(`UNION ALL`);
  out.push(`SELECT 'hts_codes numbered lines not in the edition (all chapters)', count(*), 0`);
  out.push(`  FROM hts_codes h`);
  out.push(` WHERE h.space_id = ${space} AND h.hts_number IS NOT NULL`);
  out.push(`   AND NOT EXISTS (SELECT 1 FROM tmp_hts_edition_numbers e WHERE e.hts_number = h.hts_number);`);
  out.push('');
  out.push(`SELECT r.chapter_number, count(*) AS rows, e.n AS edition_rows, count(*) = e.n AS ok`);
  out.push(`  FROM tmp_hts_sync_rows r`);
  out.push(`  JOIN (SELECT chapter_number, count(*) AS n FROM tmp_hts_sync GROUP BY 1) e ON e.chapter_number = r.chapter_number`);
  out.push(` GROUP BY r.chapter_number, e.n ORDER BY r.chapter_number;`);
  out.push(`SELECT check_name, actual, expected, actual = expected AS ok FROM tmp_hts_sync_checks ORDER BY check_name;`);
  out.push(`DO $$ DECLARE failed TEXT; BEGIN`);
  out.push(`  SELECT string_agg(check_name || ' = ' || actual || ' (expected ' || expected || ')', '; ' ORDER BY check_name) INTO failed`);
  out.push(`    FROM tmp_hts_sync_checks WHERE actual <> expected;`);
  out.push(`  IF failed IS NOT NULL THEN RAISE EXCEPTION 'hts_codes integrity check failed: %', failed; END IF; END $$;`);
  out.push('');
  return out.join('\n');
}

/** Statement body that undoes the forward sync, from the read-only pre-sync export. */
export function buildRollbackSql(plans: readonly ChapterPlan[], links: readonly CandidateLinkRow[], spaceId: string): string {
  const affected = plans.filter((p) => p.affected);
  const space = sqlText(spaceId);
  const out: string[] = [];
  const section = (title: string) =>
    out.push(
      '',
      `-- ---------------------------------------------------------------------------`,
      `-- ${title}`,
      `-- ---------------------------------------------------------------------------`
    );

  section(`1. Delete the rows the sync inserted (numbered by hts_number; headers by chapter + post-sync sort_order + indent + description)`);
  out.push(
    `CREATE TEMP TABLE tmp_rb_inserted (chapter_number INT NOT NULL, hts_number TEXT, sort_order INT NOT NULL, indent INT NOT NULL, description TEXT NOT NULL) ON COMMIT DROP;`
  );
  const insertedTuples: string[] = [];
  for (const p of affected)
    p.edition.forEach((e, pos) => {
      if (!p.ids[pos]) insertedTuples.push(`${p.chapter}, ${sqlText(e.htsNumber)}, ${pos}, ${e.indent}, ${sqlText(e.description)}`);
    });
  out.push(...valuesInserts('tmp_rb_inserted', 'chapter_number, hts_number, sort_order, indent, description', insertedTuples));
  out.push(`WITH deleted AS (`);
  out.push(`  DELETE FROM hts_codes h`);
  out.push(`   USING tmp_rb_inserted i, tariff_chapters c`);
  out.push(`   WHERE c.space_id = ${space} AND c.number = i.chapter_number AND h.space_id = ${space} AND h.chapter_id = c.id`);
  out.push(`     AND ((i.hts_number IS NOT NULL AND h.hts_number = i.hts_number)`);
  out.push(
    `       OR (i.hts_number IS NULL AND h.hts_number IS NULL AND h.sort_order = i.sort_order AND h.indent = i.indent AND h.description = i.description))`
  );
  out.push(`  RETURNING h.id`);
  out.push(`)`);
  out.push(`SELECT 'inserted rows removed (expected ${insertedTuples.length})' AS step, count(*) AS rows FROM deleted;`);

  const deleted = affected.flatMap((p) => p.deleted);
  section(`2. Re-insert the ${deleted.length} deleted rows with all their original columns`);
  out.push(
    ...valuesInserts(
      'hts_codes',
      'id, hts_number, hts_code_10, indent, description, unit_of_quantity, general_rate_of_duty, special_rate_of_duty, column2_rate_of_duty, quota_quantity, additional_duties, chapter_id, parent_id, sort_order, space_id, created_at, updated_at',
      deleted.map((r) =>
        [
          sqlText(r.id),
          sqlText(r.htsNumber),
          sqlText(r.htsCode10),
          r.indent,
          sqlText(r.description),
          sqlTextArray(r.unitOfQuantity),
          sqlText(r.generalRateOfDuty),
          sqlText(r.specialRateOfDuty),
          sqlText(r.column2RateOfDuty),
          sqlText(r.quotaQuantity),
          sqlText(r.additionalDuties),
          sqlText(r.chapterId),
          'NULL',
          r.sortOrder,
          sqlText(r.spaceId),
          sqlTimestamp(r.createdAt),
          sqlTimestamp(r.updatedAt),
        ].join(', ')
      ),
      200
    )
  );

  section(`3. Re-insert their ${links.length} hts_code_candidate_codes links`);
  out.push(
    ...valuesInserts(
      'hts_code_candidate_codes',
      'id, hts_code_id, candidate_code_id, last_fetched_at, space_id, created_at, updated_at',
      [...links]
        .sort((a, b) => compareCodes(a.htsCodeId, b.htsCodeId) || compareCodes(a.id, b.id))
        .map((l) =>
          [
            sqlText(l.id),
            sqlText(l.htsCodeId),
            sqlText(l.candidateCodeId),
            sqlTimestamp(l.lastFetchedAt),
            sqlText(l.spaceId),
            sqlTimestamp(l.createdAt),
            sqlTimestamp(l.updatedAt),
          ].join(', ')
        ),
      1000
    )
  );

  const allCurrent = affected.flatMap((p) => p.current);
  section(`4. Restore sort_order / parent_id / indent / description / updated_at of all ${allCurrent.length} pre-sync rows of the affected chapters`);
  out.push(
    `CREATE TEMP TABLE tmp_rb_restore (id TEXT PRIMARY KEY, sort_order INT NOT NULL, parent_id TEXT, indent INT NOT NULL, description TEXT NOT NULL, updated_at TIMESTAMP(3) NOT NULL) ON COMMIT DROP;`
  );
  out.push(
    ...valuesInserts(
      'tmp_rb_restore',
      'id, sort_order, parent_id, indent, description, updated_at',
      allCurrent.map((r) => `${sqlText(r.id)}, ${r.sortOrder}, ${sqlText(r.parentId)}, ${r.indent}, ${sqlText(r.description)}, ${sqlTimestamp(r.updatedAt)}`)
    )
  );
  out.push(`UPDATE hts_codes h`);
  out.push(`   SET sort_order = r.sort_order, parent_id = r.parent_id, indent = r.indent, description = r.description, updated_at = r.updated_at`);
  out.push(`  FROM tmp_rb_restore r`);
  out.push(` WHERE h.id = r.id;`);

  section(`5. Check: every affected chapter is back to its pre-sync rows (same ids in the same order)`);
  out.push(`CREATE TEMP TABLE tmp_rb_snapshot (chapter_number INT PRIMARY KEY, row_count INT NOT NULL, ids_md5 TEXT NOT NULL) ON COMMIT DROP;`);
  out.push(
    ...valuesInserts(
      'tmp_rb_snapshot',
      'chapter_number, row_count, ids_md5',
      affected.map((p) => `${p.chapter}, ${p.current.length}, ${sqlText(idsFingerprint(p.current))}`)
    )
  );
  out.push(`DO $$ DECLARE drifted TEXT; BEGIN`);
  out.push(`  SELECT string_agg(s.chapter_number::text, ', ' ORDER BY s.chapter_number) INTO drifted`);
  out.push(`    FROM tmp_rb_snapshot s`);
  out.push(`    JOIN tariff_chapters c ON c.space_id = ${space} AND c.number = s.chapter_number`);
  out.push(`    LEFT JOIN LATERAL (SELECT count(*)::int AS n, md5(coalesce(string_agg(h.id, ',' ORDER BY h.sort_order, h.id COLLATE "C"), '')) AS m`);
  out.push(`                         FROM hts_codes h WHERE h.chapter_id = c.id AND h.space_id = ${space}) cur ON true`);
  out.push(`   WHERE cur.n <> s.row_count OR cur.m <> s.ids_md5;`);
  out.push(`  IF drifted IS NOT NULL THEN RAISE EXCEPTION 'rollback did not restore chapter(s) %', drifted; END IF; END $$;`);
  out.push('');
  return out.join('\n');
}
