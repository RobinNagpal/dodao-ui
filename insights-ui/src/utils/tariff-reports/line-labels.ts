import type { TariffIndustryAreasContent, TariffMatrixCellRates, TariffRateTableRow } from '@/types/tariff-chapter-prototype';

// Product labels for the rates in a "Rates by country" matrix cell (issue #1784, item 2).
//
// A cell such as UK × 0101 holds several totals ("10% · 16.8% · 14.5%"); each breakdown row of
// the cell lists the HTS lines it covers. This module names each breakdown row from the chapter's
// own rate table, so any chapter gets labels with no extra data:
//
// 1. Each line's path is its rate-table ancestors below the four-digit heading, plus its own
//    description (e.g. 0101.21.00.10 → ["Horses", "Purebred breeding animals", "Males"]).
// 2. A line is named by the shortest prefix of its path that no line of another breakdown row in
//    the same cell shares — the coarsest name that still tells the rows apart.
// 3. A generic step ("Other") borrows its nearest non-generic ancestor ("Other horses"); with
//    none, it falls back to the line's eight-digit HTS code.
// 4. Names are shortened (first clause, ≤ MAX_LABEL chars), deduped per row, and capped.

/** What the labeller needs from a rate-table row. */
interface LineInfo {
  description: string;
  /** Ancestor descriptions below the four-digit heading, outermost first. */
  path: string[];
}

export type RateLineIndex = Map<string, LineInfo>;

/**
 * Product names per breakdown row, in breakdown order, for each USMCA mode of a cell. A row's
 * names are deduped and in line order; an empty list means "nothing to tell apart" (one row).
 */
export interface CellBreakdownLabels {
  withUsmca: string[][];
  withoutUsmca: string[][];
}

/** Keyed by country, then four-digit heading — the same keys as `industryAreas.countries[].cells`. */
export type MatrixBreakdownLabels = Record<string, Record<string, CellBreakdownLabels>>;

/** One distinct total of a cell with the product names it covers. */
export interface LabelledTotal {
  total: string;
  names: string[];
}

const MAX_LABEL = 24;

function clean(description: string): string {
  return description.trim().replace(/[:;,.]+$/, '');
}

function isGeneric(description: string): boolean {
  return /^other$/i.test(clean(description));
}

/** Upper-cases the first letter only, so chemical and proper names keep their case. */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Lower-cases the first letter unless the word is an acronym ("Horses" → "horses", "DNA" stays). */
function lowerFirst(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

/**
 * First clause of a description, without parentheticals or a leading "Other, containing", with
 * weight / size comparisons abbreviated, cut to MAX_LABEL characters at a word boundary.
 */
export function shortenDescription(description: string): string {
  let text = clean(description)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/^other,\s*/i, '')
    .replace(/^containing\s+/i, '')
    .replace(/\bnot (?:more than|over|exceeding)\s+/gi, '≤ ')
    .replace(/\b(?:less than|under)\s+/gi, '< ')
    .replace(/\b(?:more than|over|exceeding)\s+/gi, '> ')
    .replace(/\s*percent\b/gi, '%');
  text = text.split(/[;:]|,\s/)[0].trim();
  if (text.length > MAX_LABEL) {
    const cut = text.slice(0, MAX_LABEL - 1);
    const space = cut.lastIndexOf(' ');
    text = `${(space > MAX_LABEL / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:-]+$/, '')}…`;
  }
  return capitalize(text);
}

/** Lookup from dotted HTS line (as used in the matrix breakdown) to its description and path. */
export function rateLineIndex(rows: TariffRateTableRow[]): RateLineIndex {
  const index: RateLineIndex = new Map();
  for (const row of rows) {
    if (!row.hts) continue;
    // ancestorPath starts at the four-digit heading, which every line of a cell shares.
    index.set(row.hts, { description: row.description, path: row.ancestorPath.slice(1) });
  }
  return index;
}

/** Fallback name: the line's eight-digit code, e.g. "HTS 0101.90.40". */
function eightDigit(hts: string): string {
  return `HTS ${hts.split('.').slice(0, 3).join('.')}`;
}

/**
 * Name of one line from the first `depth` steps of its path. A generic last step ("Other")
 * becomes "Other <nearest non-generic ancestor>", else "Other <first non-generic step below>",
 * else the line's eight-digit HTS code.
 */
function nameAt(full: string[], depth: number, hts: string): string {
  const step = full[depth - 1];
  if (!isGeneric(step)) return shortenDescription(step);
  const above = full.slice(0, depth - 1).reverse();
  const below = full.slice(depth);
  const context = above.find((s) => !isGeneric(s)) ?? below.find((s) => !isGeneric(s));
  return context ? shortenDescription(`Other ${lowerFirst(shortenDescription(context).replace(/…$/, ''))}`) : eightDigit(hts);
}

/**
 * Product names for each breakdown row of one cell, in breakdown order. Each line is named by the
 * shortest prefix of its path that no other row's line shares; lines missing from the rate table
 * fall back to their HTS code. A cell with a single row gets no names (nothing to tell apart).
 */
export function breakdownNames(rates: TariffMatrixCellRates, index: RateLineIndex): string[][] {
  const { breakdown } = rates;
  if (breakdown.length <= 1) return breakdown.map(() => []);

  const keyOf = (full: string[], depth: number): string => full.slice(0, depth).join('\u0000');
  // Owner row of every path prefix, or -1 once two rows share it.
  const prefixOwner = new Map<string, number>();
  const paths = breakdown.map((row, r) =>
    row.lines.map((hts) => {
      const info = index.get(hts);
      const full = info ? [...info.path, info.description] : null;
      for (let d = 1; full && d <= full.length; d++) {
        const owner = prefixOwner.get(keyOf(full, d));
        prefixOwner.set(keyOf(full, d), owner === undefined || owner === r ? r : -1);
      }
      return { hts, full };
    })
  );

  return paths.map((lines) => {
    const names: string[] = [];
    for (const { hts, full } of lines) {
      const depth = full ? full.findIndex((_, i) => prefixOwner.get(keyOf(full, i + 1)) !== -1) + 1 : 0;
      const name = full && depth > 0 ? nameAt(full, depth, hts) : eightDigit(hts);
      if (!names.includes(name)) names.push(name);
    }
    return names;
  });
}

/** Names for every cell of the matrix — computed on the server, so the page ships strings, not the rate table. */
export function matrixBreakdownLabels(areas: TariffIndustryAreasContent, rows: TariffRateTableRow[]): MatrixBreakdownLabels {
  const index = rateLineIndex(rows);
  const out: MatrixBreakdownLabels = {};
  for (const country of areas.countries) {
    const cells: Record<string, CellBreakdownLabels> = {};
    for (const [heading, cell] of Object.entries(country.cells)) {
      cells[heading] = { withUsmca: breakdownNames(cell.withUsmca, index), withoutUsmca: breakdownNames(cell.withoutUsmca, index) };
    }
    out[country.country] = cells;
  }
  return out;
}

/**
 * The cell's distinct totals (in `totals` order) with the product names each covers; breakdown
 * rows sharing a total merge their names. Null when there's nothing to label (one total, no
 * names) or when `totals` summarises the rows rather than listing their totals (e.g. "Free" +
 * "15% if patented" for a "Free generic / 15% patented" row) — the cell then stays unlabelled.
 */
export function labelledTotals(rates: TariffMatrixCellRates, names: string[][] | undefined): LabelledTotal[] | null {
  if (!names || rates.totals.length <= 1) return null;
  const rowTotals = new Set(rates.breakdown.map((row) => row.total));
  if (rowTotals.size !== rates.totals.length || !rates.totals.every((t) => rowTotals.has(t))) return null;
  return rates.totals.map((total) => {
    const merged: string[] = [];
    rates.breakdown.forEach((row, i) => {
      if (row.total !== total) return;
      for (const name of names[i] ?? []) if (!merged.includes(name)) merged.push(name);
    });
    return { total, names: merged };
  });
}

/** Compact name for a matrix cell: the first product, with "etc." when the rate covers more. */
export function compactNames(names: string[]): string {
  if (names.length === 0) return '';
  return names.length === 1 ? names[0] : `${names[0]} etc.`;
}

/** Fuller name for the detail view: up to `max` products, then "and N more". */
export function listNames(names: string[], max = 3): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} and ${names.length - max} more`;
}
