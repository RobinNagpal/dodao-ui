/**
 * Generates prisma/data-sql/tariff-calculator/<YYYYMMDD>-<edition-slug>-hts-lines-sync.sql — one reviewed
 * transaction that brings the `hts_codes` ROWS (not just their rates) in line with an HTS edition: inserts
 * the numbered lines and unnumbered header rows the edition added, deletes the ones it dropped, and
 * re-sequences `sort_order` + re-points `parent_id` for every row of each affected chapter. Chapters with
 * no difference are not touched. Also writes a rollback SQL file (NOT committed — it holds a full copy of
 * the deleted rows and their candidate-code links) to --rollback-out.
 *
 *   DOTENV_CONFIG_PATH=<path to insights-ui/.env> pnpm tariff:build-hts-lines-sync-sql \
 *     --hts-file ~/Downloads/hts_2026_revision_21_json.json --rollback-out /tmp/hts-lines-sync-rollback.sql
 *
 * Unlike the other tariff-calculator generators this one READS the database (findMany only — it never
 * writes): which header rows / ids exist decides what the SQL does. The SQL starts with a guard that
 * aborts if any affected chapter changed since generation (so it cannot be applied twice).
 * Apply it with the "insights-ui: apply data SQL" GitHub workflow — dry run first.
 * See docs/insights-ui/tariffs/calculator-data-refresh.md ("Syncing hts_codes lines with a new HTS edition").
 */

import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prisma } from '@/prisma';
import { DATA_SQL_DIR, editionSlug, INSIGHTS_UI_ROOT, loadHtsSource, parseCliArgs, stringArg, yyyymmdd } from './lib/hts-source';
import {
  buildRollbackSql,
  buildSyncSql,
  checkIntegrity,
  editionByChapter,
  idsFingerprint,
  nearestPrecedingParents,
  planSync,
  simulate,
  stackParents,
  type CandidateLinkRow,
  type ChapterPlan,
  type CurrentRow,
} from './lib/hts-lines-sync';

const SPACE_ID = 'koala_gains';

function pad(s: string | number, n: number): string {
  return String(s).padStart(n);
}

function chapterSummary(plans: readonly ChapterPlan[]): string[] {
  const lines = [`chapter | +numbered | -numbered | +headers | -headers | re-indented | re-described | rows now (edition)`];
  for (const p of plans.filter((x) => x.affected)) {
    lines.push(
      `   ${pad(p.chapter, 2)}   | ${pad(p.newNumbered.length, 9)} | ${pad(p.removedNumbered.length, 9)} | ${pad(p.newHeaders.length, 8)} | ${pad(
        p.removedHeaders.length,
        8
      )} | ${pad(p.reindented, 11)} | ${pad(p.redescribed, 12)} | ${pad(p.current.length, 5)} → ${p.edition.length}`
    );
  }
  return lines;
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const source = await loadHtsSource({
    file: stringArg(args, 'hts-file') ?? stringArg(args, 'file'),
    url: stringArg(args, 'url'),
    edition: stringArg(args, 'edition'),
  });
  const edition = editionByChapter(source.rows);

  // ---- Read-only snapshot of the current rows ---------------------------------------------------
  const chapters = await prisma.tariffChapter.findMany({ where: { spaceId: SPACE_ID }, select: { id: true, number: true }, orderBy: { number: 'asc' } });
  const current: CurrentRow[] = await prisma.htsCode.findMany({ where: { spaceId: SPACE_ID }, orderBy: [{ chapterId: 'asc' }, { sortOrder: 'asc' }] });
  console.log(
    `Loaded ${current.length} hts_codes rows in ${chapters.length} chapters; edition ${source.edition}: ${source.rows.length} rows in ${edition.size} chapters`
  );

  // The parent rule must reproduce the parents the original ingest stored — otherwise the re-parenting
  // below would rewrite rows for no reason.
  let ingestParentMismatch = 0;
  for (const c of chapters) {
    const rows = current.filter((r) => r.chapterId === c.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const parents = stackParents(rows.map((r) => r.indent));
    rows.forEach((r, i) => {
      if (r.parentId !== (parents[i] === null ? null : rows[parents[i] as number].id)) ingestParentMismatch++;
    });
  }
  console.log(`Current rows whose parent_id differs from the indent-stack rule: ${ingestParentMismatch}`);
  if (ingestParentMismatch) throw new Error('the indent-stack rule does not reproduce the stored parents — fix the rule before generating SQL');
  let stackVsNearest = 0;
  for (const lines of edition.values()) {
    const indents = lines.map((e) => e.indent);
    const a = stackParents(indents);
    const b = nearestPrecedingParents(indents);
    a.forEach((v, i) => {
      if (v !== b[i]) stackVsNearest++;
    });
  }
  console.log(`Edition rows below an indent gap (no parent under the stack rule, as the original ingest stored them): ${stackVsNearest}`);

  const plans = planSync(current, chapters, edition);
  const affected = plans.filter((p) => p.affected);
  const deletedIds = affected.flatMap((p) => p.deleted.map((d) => d.id));
  const links: CandidateLinkRow[] = deletedIds.length ? await prisma.htsCodeCandidateCode.findMany({ where: { htsCodeId: { in: deletedIds } } }) : [];

  // ---- Simulate the post-sync state and assert the integrity rules on every chapter ---------------
  const before = checkIntegrity(simulate(current, chapters, []), edition);
  const after = checkIntegrity(simulate(current, chapters, plans), edition);
  console.log('\nIntegrity (before → after sync, simulated in memory):');
  let failed = 0;
  after.forEach((r, i) => {
    const ok = r.actual === r.expected;
    if (!ok) failed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.name}: ${before[i].actual} → ${r.actual} (expected ${r.expected})`);
  });
  if (failed) throw new Error(`${failed} integrity rule(s) fail on the simulated post-sync state — not writing SQL`);

  const sum = (f: (p: ChapterPlan) => number) => affected.reduce((s, p) => s + f(p), 0);
  const totals = {
    newNumbered: sum((p) => p.newNumbered.length),
    removedNumbered: sum((p) => p.removedNumbered.length),
    newHeaders: sum((p) => p.newHeaders.length),
    removedHeaders: sum((p) => p.removedHeaders.length),
    reindented: sum((p) => p.reindented),
    redescribed: sum((p) => p.redescribed),
  };
  const summary = chapterSummary(plans);
  console.log(`\n${affected.length} affected chapters:\n${summary.join('\n')}`);
  console.log(
    `Totals: +${totals.newNumbered} / -${totals.removedNumbered} numbered, +${totals.newHeaders} / -${totals.removedHeaders} header rows, ${totals.reindented} re-indented, ${totals.redescribed} re-described; ${links.length} candidate-code links cascade`
  );

  // ---- Forward SQL ----------------------------------------------------------------------------------
  const out = stringArg(args, 'out')
    ? path.resolve(stringArg(args, 'out') as string)
    : path.join(DATA_SQL_DIR, `${stringArg(args, 'date') ?? yyyymmdd()}-${editionSlug(source.edition)}-hts-lines-sync.sql`);
  const relOut = path.relative(INSIGHTS_UI_ROOT, out);
  const header = [
    `-- hts_codes lines → HTS ${source.edition}`,
    `--`,
    `-- Source:    ${source.sourceUrl}`,
    `-- Generated by src/scripts/tariff-calculator/build-hts-lines-sync-sql.ts from a read-only snapshot of`,
    `--            ${current.length} hts_codes rows (${chapters.length} chapters) and the edition's ${source.rows.length} rows.`,
    `--`,
    `-- What: the edition added and removed HTS lines that the base-rate refresh only reported. For the`,
    `-- ${affected.length} chapters that differ, this one transaction`,
    `--   0. aborts unless those chapters still hold exactly the snapshot's rows (ids + order) — so a stale`,
    `--      file, or a second run after it was applied, fails instead of doing damage;`,
    `--   1. stages the chapters' edition rows (position = sort_order, parent = nearest row above with indent-1,`,
    `--      by the original ingest's indent-stack rule) and resolves each to its existing row — numbered rows by`,
    `--      hts_number, unnumbered header rows by indent + description in order — or a new gen_random_uuid() id;`,
    `--   2. deletes the ${totals.removedNumbered} numbered + ${totals.removedHeaders} header rows the edition dropped (${links.length} hts_code_candidate_codes links cascade);`,
    `--   3. inserts the ${totals.newNumbered} numbered + ${totals.newHeaders} header rows it added (rates/units in the original ingest formats);`,
    `--   4. re-sequences sort_order and re-points parent_id (and syncs indent/description: ${totals.reindented} re-indented,`,
    `--      ${totals.redescribed} re-described) for every row of those chapters — only differing rows are written;`,
    `--   5. SELECTs integrity checks and aborts if any fails (counts per chapter, unique sort_order, parent one`,
    `--      indent up in the same chapter, no line outside the edition, overall numbered diff = 0 / 0).`,
    `-- Other chapters are untouched. Removed lines disappear from the /hts-codes/us/[section]/[chapter] pages and`,
    `-- from calculator search.`,
    `--`,
    `-- Apply (never by hand against production):`,
    `--   1. Review this file in the PR and merge.`,
    `--   2. GitHub Actions → "insights-ui: apply data SQL" → sql_file=insights-ui/${relOut}, dry_run=true`,
    `--      (runs everything, prints the checks, then ROLLBACK). Every check must show ok = t.`,
    `--   3. Re-run with dry_run=false to COMMIT.`,
    `-- Rollback: the generator also writes a rollback file (kept out of the repo) that restores the deleted rows,`,
    `-- their candidate-code links and every row's previous sort_order / parent_id / indent / description.`,
    `-- See docs/insights-ui/tariffs/calculator-data-refresh.md.`,
    `--`,
    `-- Affected chapters:`,
    ...summary.map((l) => `--   ${l}`),
    '',
  ];
  const sql = [...header, 'BEGIN;', buildSyncSql(plans, edition, SPACE_ID, links.length), 'COMMIT;', ''].join('\n');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql);
  console.log(`\nWrote ${relOut} (${(sql.length / 1024 / 1024).toFixed(2)} MB)`);

  // ---- Rollback SQL (not committed) ---------------------------------------------------------------
  const rollbackOut = stringArg(args, 'rollback-out');
  if (rollbackOut) {
    const rb = [
      `-- ROLLBACK for ${relOut} (hts_codes lines → HTS ${source.edition}). NOT for the repo: it holds a full copy of`,
      `-- the ${deletedIds.length} deleted hts_codes rows and their ${links.length} hts_code_candidate_codes links.`,
      `-- Run only after the sync was committed: deletes the rows it inserted, re-inserts the deleted rows (original`,
      `-- ids and columns) and links, restores sort_order / parent_id / indent / description / updated_at of every`,
      `-- pre-sync row of the ${affected.length} affected chapters, then checks each chapter's ids + order equal the pre-sync`,
      `-- snapshot (fingerprints: ${affected.map((p) => `${p.chapter}=${idsFingerprint(p.current).slice(0, 8)}`).join(' ')}).`,
      `-- Links are only restorable while their tariff_candidate_codes rows still exist.`,
      '',
      'BEGIN;',
      buildRollbackSql(plans, links, SPACE_ID),
      'COMMIT;',
      '',
    ].join('\n');
    mkdirSync(path.dirname(path.resolve(rollbackOut)), { recursive: true });
    writeFileSync(path.resolve(rollbackOut), rb);
    console.log(`Wrote rollback ${path.resolve(rollbackOut)} (${(rb.length / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.warn('WARN no --rollback-out given — no rollback file written');
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Fatal:', err instanceof Error ? err.message : err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
