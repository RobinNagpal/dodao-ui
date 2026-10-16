// Adds the statistical reporting numbers that the HTS JSON does not print to an edition's rows (Chapter 91
// statistical note 1, see src/utils/tariff-calculator/statistical-suffixes.ts), so every consumer that mirrors the
// edition — the hts_codes lines sync, the base-rate SQL, rate-strings.json and program-coverage.json — sees the same
// rows: each listed 8-digit subheading keeps its row (and its rate) and gets its component rows below it, one indent
// deeper per level, with blank rates (inherited from the subheading, like any statistical row).
//
// Strict on purpose: a listed subheading that is missing, has no rate or already has 10-digit rows, or a rated 8-digit
// line of chapters 01–97 with no 10-digit row that no scheme lists, throws — a new HTS revision that changes them must
// be reviewed in statistical-suffixes.json first.

import { STATISTICAL_SUFFIXES, statisticalSuffixScheme } from '@/utils/tariff-calculator/statistical-suffixes';
import type { HtsJsonRow } from './hts-source';

function trimmed(v: string | null | undefined): string {
  return (v ?? '').trim();
}

/** Rated 8-digit lines of chapters 01–97 with no 10-digit row below them (the HTS JSON's unprinted statistical lines). */
export function eightDigitLeaves(rows: readonly HtsJsonRow[]): string[] {
  const numbers = rows.map((r) => trimmed(r.htsno)).filter((n) => n.length > 0);
  const tenDigitParents = new Set(numbers.filter((n) => n.replace(/\D/g, '').length === 10).map((n) => n.slice(0, 10)));
  const out: string[] = [];
  for (const r of rows) {
    const no = trimmed(r.htsno);
    if (no.replace(/\D/g, '').length !== 8 || Number(no.slice(0, 2)) > 97) continue;
    if (trimmed(r.general) && !tenDigitParents.has(no)) out.push(no);
  }
  return out;
}

/** The edition's rows plus the statistical-note component rows after each subheading the notes cover. */
export function withStatisticalSuffixRows(rows: readonly HtsJsonRow[]): HtsJsonRow[] {
  const leaves = new Set(eightDigitLeaves(rows));
  const problems: string[] = [];
  for (const leaf of Array.from(leaves))
    if (!statisticalSuffixScheme(leaf)) problems.push(`${leaf} is a rated 8-digit line with no 10-digit rows that no scheme lists`);
  const seen = new Set<string>();
  const out: HtsJsonRow[] = [];
  for (const r of rows) {
    out.push(r);
    const no = trimmed(r.htsno);
    if (no.replace(/\D/g, '').length !== 8) continue;
    const scheme = statisticalSuffixScheme(no);
    if (!scheme) continue;
    if (!leaves.has(no)) {
      problems.push(`${no} (note ${scheme.note}) ${trimmed(r.general) ? 'already has 10-digit rows' : 'states no general rate'} in this edition`);
      continue;
    }
    seen.add(no);
    const indent = parseInt(r.indent, 10);
    for (const row of scheme.rows) {
      out.push({
        htsno: row.suffix ? `${no}.${row.suffix}` : '',
        indent: String(indent + (row.depth ?? 1)),
        description: row.description,
        superior: null,
        units: row.suffix ? row.units ?? [] : [],
        general: '',
        special: '',
        other: '',
        footnotes: [],
        quotaQuantity: null,
        additionalDuties: null,
      });
    }
  }
  for (const scheme of STATISTICAL_SUFFIXES.schemes)
    for (const sub of scheme.subheadings)
      if (!seen.has(sub) && !problems.some((p) => p.startsWith(sub))) problems.push(`${sub} (note ${scheme.note}) is not in this edition`);
  if (problems.length > 0) {
    throw new Error(
      `src/tariff-data/calculator/statistical-suffixes.json (${STATISTICAL_SUFFIXES.htsEdition}) does not match this HTS edition — review it against the ` +
        `chapter's statistical notes:\n  ${problems.join('\n  ')}`
    );
  }
  return out;
}
