/**
 * Builds src/tariff-data/calculator/fta-quota-headings.json — every Chapter 98/99 heading that an HTS line's special
 * column points to instead of stating a rate ("0201.10.50 … See 9822.04.01-9822.04.03 (AU)"): the FTA tariff-rate
 * quotas and safeguards for beef, dairy, sugar, tobacco and similar goods (Chapter 98 subchapters XXII / XXIII,
 * Chapter 99 subchapters VIII, XVIII, XIX, XXI). For each heading: the SPI its rate is listed for, the rate text, the
 * kind (in-quota / safeguard / over-quota / unconditional), the U.S. note it cites, the countries and subheadings it is
 * limited to — parsed from the official USITC HTS JSON.
 *
 *   pnpm tariff:build-fta-quota --file ~/Downloads/hts_2026_revision_21_json.json
 *   pnpm tariff:build-fta-quota                               # newest revision on usitc.gov
 *   pnpm tariff:build-fta-quota --edition "2026 Revision 21" [--published 2026-10-07]
 *
 * The calculator bundles the JSON (no database rows): the line's own special column, already in hts_codes, names the
 * headings, and src/utils/tariff-calculator/fta-quota.ts prices them. After writing, every "See …" reference of every
 * HTS line is resolved for every country of its program and the result printed — fix any problem before committing.
 * Never touches a database.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { FtaQuotaHeading, FtaQuotaHeadingKind, FtaQuotaHeadingsFile, TariffMeasureSource } from '@/types/tariff-calculator-measures';
import { describeQuotaTiers, isQuotaReference, parseQuotaReference, resolveQuotaClaim } from '@/utils/tariff-calculator/fta-quota';
import { parseSpecialRates, SPECIAL_PROGRAMS } from '@/utils/tariff-calculator/measures-engine';
import { isKnownUnitKey, parseRate } from '@/utils/tariff-reports/shipment-duty';
import { INSIGHTS_UI_ROOT, loadHtsSource, parseCliArgs, stringArg } from './lib/hts-source';

export const FTA_QUOTA_HEADINGS_PATH = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator', 'fta-quota-headings.json');

// ---------------------------------------------------------------------------
// Reviewed facts the HTS JSON rows don't carry (re-check on every new HTS revision)
// ---------------------------------------------------------------------------

/** Heading groups → chapter and subchapter (for the U.S. note citations). */
const SUBCHAPTERS: Record<string, { chapter: string; subchapter: string }> = {
  '9822': { chapter: '98', subchapter: 'XXII' },
  '9823': { chapter: '98', subchapter: 'XXIII' },
  '9908': { chapter: '99', subchapter: 'VIII' },
  '9918': { chapter: '99', subchapter: 'XVIII' },
  '9919': { chapter: '99', subchapter: 'XIX' },
  '9921': { chapter: '99', subchapter: 'XXI' },
};

/**
 * Last day a subchapter's note 1 says its provisions apply (HTS 2026 Revision 21, Chapter 99): Israel agricultural
 * agreement, U.S. note 1 to subchapter VIII ("through the close of December 31, 2026"); Colombia TPA, note 1 to
 * subchapter XVIII (notes 3–9 and 9918.02.01–9918.24.11 "through the close of December 31, 2026"); Panama TPA, note 1
 * to subchapter XIX ("through the close of December 31, 2028").
 */
const EFFECTIVE_TO: Record<string, string> = { '9908': '2026-12-31', '9918': '2026-12-31', '9919': '2028-12-31' };

/**
 * Headings whose kind the description alone doesn't give. 9822.04.02 "Subject to the provisions of U.S. note 8(c)":
 * note 8(c) to subchapter XXII — "A safeguard measure shall apply to originating goods of Australia entered in excess
 * of the aggregate quantity …" (price-triggered, the rate of 9822.04.02 applies for the quarter).
 */
const KIND_OVERRIDES: Record<string, { kind: FtaQuotaHeadingKind; noteRef?: string; reason?: string }> = {
  '9822.04.02': { kind: 'safeguard', noteRef: '8(c)' },
  '9921.01.01': {
    kind: 'notModelled',
    reason:
      'the Japan rate on 8415.90.80 depends on whether the parts are of automotive air conditioners (9921.01.01, 1.4%) or other (9921.01.02, Free); the calculator does not ask that yet',
  },
  '9921.01.02': {
    kind: 'notModelled',
    reason:
      'the Japan rate on 8415.90.80 depends on whether the parts are of automotive air conditioners (9921.01.01, 1.4%) or other (9921.01.02, Free); the calculator does not ask that yet',
  },
};

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

const QUOTA_WORDS = /quantitative limit|aggregate quantity|quantitative limitation/i;

function clean(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeNoteRef(raw: string): string {
  return raw.replace(/\s+/g, '');
}

/** The U.S. note a text cites for its quota ("…quantitative limits specified in U.S. note 6(b)…" → "6(b)"); general/statistical notes are skipped. */
export function noteRefIn(text: string): string | null {
  const t = clean(text);
  const quota = /quantit[^;]*?(?<!general |statistical )note\s+(\d+(?:\s*\([A-Za-z0-9]+\))*)/i.exec(t);
  if (quota) return normalizeNoteRef(quota[1]);
  const any = /(?<!general |statistical )note\s+(\d+(?:\s*\([A-Za-z0-9]+\))*)/i.exec(t);
  return any ? normalizeNoteRef(any[1]) : null;
}

/** "0406.10,18" / "0406.20. 48" / "2106.9026" → "0406.10.18" … (8-digit subheadings named in a description). */
export function subheadingsIn(text: string): string[] {
  const out = new Set<string>();
  const re = /(\d{4})\.\s?(\d{2})\s?[.,]\s?(\d{2})(?!\d)|(\d{4})\.(\d{2})(\d{2})(?!\d)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = m[1] ? `${m[1]}.${m[2]}.${m[3]}` : `${m[4]}.${m[5]}.${m[6]}`;
    if (!/^9[89]/.test(code)) out.add(code);
  }
  return Array.from(out);
}

function isOther(text: string): boolean {
  return /^Other\b/i.test(clean(text));
}

/**
 * Kind from the heading's own description and the indented text above it, nearest first: the first text that says
 * "Other" or "Goods provided for in note N(b)(2)" (over the quota) or names a quantitative limit (in quota) decides.
 * Nearest-first matters: the HTS JSON sometimes nests "Other:" under the in-quota text it is a sibling of (9919.04.13).
 */
function kindOf(description: string, context: string[]): FtaQuotaHeadingKind {
  for (const t of [description, ...context]) {
    if (isOther(t) || /note\s+\d+\s*\(b\)\s*\(2\)/i.test(t)) return 'overQuota';
    if (QUOTA_WORDS.test(t)) return 'inQuota';
  }
  return 'unconditional';
}

/** Countries a heading is for. USMCA (subchapter XXIII): note N(a) / "Goods of Mexico" → MX, note N(b) / "Goods of Canada" → CA. */
function countriesOf(spi: string, description: string, context: string[]): string[] {
  const program = SPECIAL_PROGRAMS[spi]?.countries ?? [];
  const texts = [description, ...context];
  if (spi === 'S+' || spi === 'S') {
    for (const t of texts) {
      if (/Goods of Mexico|note\s+\d+\s*\(a\)/i.test(t)) return ['MX'];
      if (/Goods of Canada|note\s+\d+\s*\([bB]\)/i.test(t)) return ['CA'];
    }
    return program;
  }
  if (spi === 'P+' || spi === 'P') {
    for (const t of texts) {
      if (/^Of Costa Rica:?$/i.test(clean(t))) return ['CR'];
    }
  }
  return program;
}

function releaseOf(edition: string): string {
  const m = /^(\d{4}) (?:Revision (\d+)|Basic Edition)$/i.exec(edition.trim());
  if (!m) throw new Error(`cannot parse HTS edition "${edition}"`);
  return m[2] ? `${m[1]}HTSRev${m[2]}` : `${m[1]}HTSBasic`;
}

/** The slice of the prettier v2 API used here (the repo has no @types/prettier). */
interface PrettierApi {
  resolveConfig(filePath: string): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): string;
}

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier';
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

interface LineRef {
  line: string;
  general: string | null;
  spi: string;
  rateText: string;
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const source = await loadHtsSource({ file: stringArg(args, 'file'), url: stringArg(args, 'url'), edition: stringArg(args, 'edition') });
  const out = stringArg(args, 'out') ? path.resolve(stringArg(args, 'out') as string) : FTA_QUOTA_HEADINGS_PATH;
  const published = stringArg(args, 'published') ?? (source.edition === '2026 Revision 21' ? '2026-10-07' : undefined);
  if (!published) throw new Error('pass --published YYYY-MM-DD (the date this HTS revision was published)');

  // 1. Every "See 98xx/99xx" reference in the special column of chapters 01–97 (rates sit on 8- or 10-digit rows).
  const refs: LineRef[] = [];
  let lastGeneral: string | null = null;
  for (const row of source.rows) {
    const code = clean(row.htsno);
    if (!code || /^9[89]/.test(code)) continue;
    if (clean(row.general)) lastGeneral = clean(row.general);
    for (const e of parseSpecialRates(row.special)) {
      if (!isQuotaReference(e.rateText)) continue;
      for (const spi of e.programs) refs.push({ line: code, general: clean(row.general) || lastGeneral, spi, rateText: e.rateText });
    }
  }

  // 2. Chapter 98/99 numbered rows with the indented text above them.
  const parents: string[] = [];
  const rows98: { code: string; description: string; context: string[]; special: string }[] = [];
  for (const row of source.rows) {
    const indent = Number(row.indent) || 0;
    parents.length = indent;
    const code = clean(row.htsno);
    if (/^9[89]\d{2}\.\d{2}\.\d{2}$/.test(code)) {
      rows98.push({ code, description: clean(row.description), context: parents.slice(0, indent).filter(Boolean).reverse(), special: clean(row.special) });
    }
    parents[indent] = clean(row.description);
  }
  const byCode = new Map(rows98.map((r) => [r.code, r]));

  // 3. The referenced headings.
  const wanted = new Set<string>();
  const unparsedRefs: string[] = [];
  for (const r of refs) {
    const parts = parseQuotaReference(r.rateText);
    if (!parts) {
      unparsedRefs.push(`${r.line} (${r.spi}): "${r.rateText}"`);
      continue;
    }
    for (const p of parts) for (const row of rows98) if (row.code >= p.from && row.code <= p.to) wanted.add(row.code);
  }

  const headings: FtaQuotaHeading[] = [];
  for (const code of Array.from(wanted).sort()) {
    const row = byCode.get(code);
    if (!row) continue;
    const group = SUBCHAPTERS[code.slice(0, 4)];
    if (!group) throw new Error(`${code}: no subchapter mapping — add its 4-digit group to SUBCHAPTERS`);
    const entry = parseSpecialRates(row.special)[0];
    if (!entry) {
      console.warn(`WARN ${code}: special column "${row.special}" names no program — skipped`);
      continue;
    }
    const spi = entry.programs[0];
    const override = KIND_OVERRIDES[code];
    let kind: FtaQuotaHeadingKind = override?.kind ?? kindOf(row.description, row.context);
    let reason = override?.reason;
    const parsed = parseRate(entry.rateText);
    if (kind !== 'notModelled' && (!parsed || parsed.perUnit.some((c) => !isKnownUnitKey(c.unit.key)))) {
      kind = 'notModelled';
      reason = `its rate "${entry.rateText}" is not a rate the calculator can price`;
    }
    const noteRef = override?.noteRef ?? noteRefIn(row.description) ?? row.context.map(noteRefIn).find((n) => n !== null) ?? null;
    headings.push({
      code,
      spi,
      rateText: entry.rateText,
      kind,
      noteRef,
      chapter: group.chapter,
      subchapter: group.subchapter,
      countries: countriesOf(spi, row.description, row.context),
      subheadings: /subheading/i.test(row.description) ? subheadingsIn(row.description) : [],
      description: row.description,
      context: row.context,
      ...(EFFECTIVE_TO[code.slice(0, 4)] ? { effectiveTo: EFFECTIVE_TO[code.slice(0, 4)] } : {}),
      ...(reason ? { reason } : {}),
    });
  }
  // Over-quota / safeguard headings that cite no note ("Other") take the note of the in-quota heading before them.
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    if (h.noteRef || (h.kind !== 'overQuota' && h.kind !== 'safeguard')) continue;
    for (let j = i - 1; j >= 0; j--) {
      if (headings[j].code.slice(0, 7) === h.code.slice(0, 7) && headings[j].kind === 'inQuota' && headings[j].noteRef) {
        h.noteRef = headings[j].noteRef;
        break;
      }
    }
  }

  const release = releaseOf(source.edition);
  const noteSources: TariffMeasureSource[] = ['98', '99'].map((ch) => ({
    citation: `HTSUS ${source.edition}, Chapter ${ch} (U.S. notes to the FTA subchapters)`,
    url: `https://hts.usitc.gov/reststop/file?release=${release}&filename=Chapter%20${ch}`,
    published,
  }));
  const file: FtaQuotaHeadingsFile = { htsEdition: source.edition, sourceUrl: source.sourceUrl, generatedAt: new Date().toISOString(), noteSources, headings };
  mkdirSync(path.dirname(out), { recursive: true });
  const prettier = await loadPrettier();
  const prettierOptions = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, prettier.format(JSON.stringify(file, null, 2), { ...prettierOptions, filepath: out }));

  // ---- report
  console.log(`\n${source.edition} (${source.sourceUrl})`);
  console.log(`Wrote ${headings.length} FTA quota headings → ${path.relative(process.cwd(), out)}`);
  const byKind = new Map<string, number>();
  for (const h of headings) byKind.set(h.kind, (byKind.get(h.kind) ?? 0) + 1);
  console.log(
    `kind: ${Array.from(byKind)
      .map(([k, n]) => `${k}=${n}`)
      .join(', ')}`
  );
  for (const h of headings.filter((x) => x.kind === 'notModelled')) console.log(`  notModelled ${h.code} (${h.spi}): ${h.reason}`);
  if (unparsedRefs.length) console.log(`\nUnreadable references (${unparsedRefs.length}):\n  ${unparsedRefs.join('\n  ')}`);

  // Resolve every reference of every line for every country of its program.
  const summary = new Map<string, { lines: number; text: Map<string, string> }>();
  const problems = new Map<string, string[]>();
  const unpricedTiers = new Map<string, string[]>();
  for (const r of refs) {
    // The countries the referenced headings are for (P+ 9822.05.15 is for Costa Rica only; the other CAFTA-DR partners
    // claim P on those lines).
    const named = (parseQuotaReference(r.rateText) ?? []).flatMap((p) => headings.filter((h) => h.code >= p.from && h.code <= p.to && h.spi === r.spi));
    const countries = Array.from(new Set(named.flatMap((h) => h.countries)));
    const key = `${r.spi}\t${r.rateText}`;
    const s = summary.get(key) ?? { lines: 0, text: new Map<string, string>() };
    s.lines++;
    summary.set(key, s);
    for (const country of countries) {
      const res = resolveQuotaClaim({ hts10: r.line, general: r.general }, r.spi, r.rateText, country, undefined, file);
      if (!res.ok) {
        const list = problems.get(key) ?? [];
        list.push(`${r.line} ${country}: ${res.error}`);
        problems.set(key, list);
        continue;
      }
      for (const t of res.resolution.tiers) {
        const parsed = parseRate(t.rateText);
        if (!parsed || parsed.perUnit.some((c) => !isKnownUnitKey(c.unit.key))) {
          const list = unpricedTiers.get(key) ?? [];
          list.push(`${r.line} ${country} ${t.key}: "${t.rateText}"`);
          unpricedTiers.set(key, list);
        }
      }
      if (!s.text.has(country)) s.text.set(country, describeQuotaTiers(res.resolution));
    }
  }
  console.log(`\nReferences (${summary.size} distinct, ${refs.length} line × program pairs):`);
  for (const [key, s] of Array.from(summary).sort()) {
    const [spi, text] = key.split('\t');
    const parts = Array.from(s.text).map(([c, t]) => `${c}: ${t}`);
    console.log(`  ${spi.padEnd(3)} ${text} — ${s.lines} line(s)${parts.length ? `\n        ${parts.join('\n        ')}` : ''}`);
  }
  printUnpriced(unpricedTiers);
  if (problems.size > 0) {
    console.log(`\nNot priceable (${problems.size} references):`);
    for (const [key, list] of Array.from(problems)) {
      console.log(`  ${key.replace('\t', ' ')} (${list.length}): ${list.slice(0, 2).join(' | ')}${list.length > 2 ? ` | +${list.length - 2} more` : ''}`);
    }
  }
}

function printUnpriced(unpricedTiers: Map<string, string[]>): void {
  if (unpricedTiers.size === 0) return;
  console.log(`\nTiers whose rate the parser can't price (an answer that picks them is an engine error):`);
  for (const [key, list] of Array.from(unpricedTiers)) {
    console.log(`  ${key.replace('\t', ' ')} (${list.length}): ${list.slice(0, 2).join(' | ')}${list.length > 2 ? ` | +${list.length - 2} more` : ''}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
