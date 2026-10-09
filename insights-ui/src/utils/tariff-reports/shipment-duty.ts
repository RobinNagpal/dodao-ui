// "Your shipment" duty estimate for Approach-2 chapter pages (issue #1784).
//
// Works only from the chapter's own content file: the country x heading matrix
// cell (`industryAreas.countries[].cells[heading]`) and the breakdown row whose
// `lines` include the picked tariff line. Its `base` / `extra` / `preference` /
// `total` strings are parsed by a generic rate parser and priced against the
// shipment, so the number always matches what the page shows — even while the
// full calculator's data is behind. Entry fees (MPF/HMF) come from the
// calculator's duty engine.
//
// Anything the parser can't read is reported as unparsed, never guessed.

import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { entryFees, type TransportMode } from '@/utils/tariff-calculator/duty-engine';
import type { TariffMatrixCountry, TariffRateBreakdownRow, TariffRateTableRow } from '@/types/tariff-chapter-prototype';

// ---------------------------------------------------------------------------
// Rate parsing
// ---------------------------------------------------------------------------

/** A quantity a per-unit rate is charged on. `key` groups equivalent spellings ("head", "No.", "each"). */
export interface QuantityUnit {
  key: string;
  /** How the unit reads in the rate text, e.g. "kg", "head". */
  label: string;
}

export interface PerUnitCharge {
  /** Dollars per unit (cents are converted). */
  amountUsd: number;
  unit: QuantityUnit;
}

/** One exact rate: an ad valorem part plus any number of per-unit parts. */
export interface ParsedRate {
  adValoremPct: number;
  perUnit: PerUnitCharge[];
}

/** A rate that may be a range ("Free–37.5%"); `low` and `high` are equal for an exact rate. */
export interface RateRange {
  low: ParsedRate;
  high: ParsedRate;
  exact: boolean;
}

/** One alternative of a rate stated per product kind ("Free generic / 100% patented"). */
export interface RateVariant {
  /** e.g. "generic", "patented"; null when the rate has a single form. */
  label: string | null;
  range: RateRange;
}

const UNIT_ALIASES: { pattern: RegExp; key: string }[] = [
  { pattern: /^(kg|kgs|kilograms?)$/, key: 'kg' },
  { pattern: /^(g|grams?)$/, key: 'g' },
  { pattern: /^(t|tons?|tonnes?|metric tons?)$/, key: 't' },
  { pattern: /^(pf\.?\s?l\.?|proof liters?|proof litres?)$/, key: 'proof liter' },
  { pattern: /^(l|liters?|litres?)$/, key: 'liter' },
  { pattern: /^(head|each|no\.?|number|units?|pcs?\.?|pieces?|items?)$/, key: 'count' },
  { pattern: /^(doz\.?|dozens?)$/, key: 'dozen' },
  { pattern: /^(pr\.?|prs\.?|pairs?)$/, key: 'pair' },
  { pattern: /^(gross)$/, key: 'gross' },
  { pattern: /^(m2|m²|sq\.?\s?m|square meters?)$/, key: 'm2' },
  { pattern: /^(m3|m³|cubic meters?)$/, key: 'm3' },
  { pattern: /^(m|meters?|metres?)$/, key: 'm' },
];

function toUnit(raw: string): QuantityUnit {
  const label = raw.trim();
  const lower = label.toLowerCase();
  const alias = UNIT_ALIASES.find((a) => a.pattern.test(lower));
  return { key: alias ? alias.key : lower, label };
}

const NUMBER = '(\\d+(?:\\.\\d+)?)';
const PERCENT_RE = new RegExp(`^${NUMBER}\\s*%$`);
// "Free–37.5%", "6.8%–44.3%", "0–37.5%", "15–100%"
const PERCENT_RANGE_RE = new RegExp(`^(free|${NUMBER}\\s*%?)\\s*[–—-]\\s*${NUMBER}\\s*%$`, 'i');
// "1¢/kg", "68¢/head", "0.9¢ each", "$1.20/doz", "$1.20 per dozen", "1 cent/kg"
const PER_UNIT_RE = new RegExp(`^(?:\\$\\s*${NUMBER}|${NUMBER}\\s*(?:¢|cents?\\b))\\s*(?:/\\s*|\\s+per\\s+|\\s+)([a-z][a-z.²³0-9 ]*)$`, 'i');

/** Removes parenthetical notes ("(9903.05.39)", "(232 list)") and "in place of base" wording. */
function cleanRateText(text: string): string {
  return text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bin place of (the )?base( rate)?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type TermRange = { low: ParsedRate; high: ParsedRate; exact: boolean };

function zeroRate(): ParsedRate {
  return { adValoremPct: 0, perUnit: [] };
}

function parseTerm(term: string): TermRange | null {
  const t = term.replace(/^\+\s*/, '').trim();
  if (/^(free|none|0)$/i.test(t)) return { low: zeroRate(), high: zeroRate(), exact: true };

  const pct = t.match(PERCENT_RE);
  if (pct) {
    const rate = { adValoremPct: Number(pct[1]), perUnit: [] };
    return { low: rate, high: rate, exact: true };
  }

  const range = t.match(PERCENT_RANGE_RE);
  if (range) {
    const low = /^free$/i.test(range[1]) ? 0 : Number(range[2]);
    const high = Number(range[3]);
    if (!(high >= low)) return null;
    return { low: { adValoremPct: low, perUnit: [] }, high: { adValoremPct: high, perUnit: [] }, exact: low === high };
  }

  const perUnit = t.match(PER_UNIT_RE);
  if (perUnit) {
    const amountUsd = perUnit[1] !== undefined ? Number(perUnit[1]) : Number(perUnit[2]) / 100;
    const rate = { adValoremPct: 0, perUnit: [{ amountUsd, unit: toUnit(perUnit[3]) }] };
    return { low: rate, high: rate, exact: true };
  }
  return null;
}

function addRates(a: ParsedRate, b: ParsedRate): ParsedRate {
  return { adValoremPct: a.adValoremPct + b.adValoremPct, perUnit: [...a.perUnit, ...b.perUnit] };
}

/** Parses a rate that may contain a range, e.g. "1¢/kg + 0–37.5%". Null when any part is unreadable. */
export function parseRateRange(text: string): RateRange | null {
  const cleaned = cleanRateText(text);
  if (!cleaned) return null;
  const terms = cleaned.split(/\s+\+\s+/);
  let low = zeroRate();
  let high = zeroRate();
  let exact = true;
  for (const term of terms) {
    const parsed = parseTerm(term);
    if (!parsed) return null;
    low = addRates(low, parsed.low);
    high = addRates(high, parsed.high);
    exact = exact && parsed.exact;
  }
  return { low, high, exact };
}

/**
 * Parses an exact rate string — "Free", "10%", "1¢/kg", "68¢/head", "1¢/kg + 10%",
 * "15% (in place of base)", "$1.20/doz + 5%", "0.9¢ each + 12.5%". Null for a
 * range or anything unreadable.
 */
export function parseRate(text: string): ParsedRate | null {
  const range = parseRateRange(text);
  return range && range.exact ? range.low : null;
}

/**
 * Parses a total that may be stated per product kind ("Free generic / 100% patented",
 * "Free generic / 15–100% patented"); a plain rate gives one unlabelled variant.
 */
export function parseRateVariants(text: string): RateVariant[] | null {
  const parts = text.split(/\s+\/\s+/);
  if (parts.length === 1) {
    const range = parseRateRange(text);
    return range ? [{ label: null, range }] : null;
  }
  const variants: RateVariant[] = [];
  for (const part of parts) {
    const m = part.trim().match(/^(.*\S)\s+([a-z][a-z -]*)$/i);
    if (!m) return null;
    const range = parseRateRange(m[1]);
    if (!range) return null;
    variants.push({ label: m[2].trim(), range });
  }
  return variants;
}

/** Distinct per-unit quantities a set of rates needs, in first-seen order. */
export function quantityUnits(rates: ParsedRate[]): QuantityUnit[] {
  const seen = new Map<string, QuantityUnit>();
  for (const rate of rates) for (const charge of rate.perUnit) if (!seen.has(charge.unit.key)) seen.set(charge.unit.key, charge.unit);
  return Array.from(seen.values());
}

/** Dollars a parsed rate costs on a shipment. Null when a per-unit quantity is missing. */
export function rateDollars(rate: ParsedRate, customsValueUsd: number, quantities: Record<string, number | undefined>): number | null {
  let total = (rate.adValoremPct / 100) * customsValueUsd;
  for (const charge of rate.perUnit) {
    const qty = quantities[charge.unit.key];
    if (qty === undefined || !Number.isFinite(qty) || qty < 0) return null;
    total += charge.amountUsd * qty;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Product lines
// ---------------------------------------------------------------------------

/** A pickable tariff line: the slim slice of a rate-table row the shipment box needs. */
export interface ShipmentLine {
  /** Dotted HTS, e.g. "0101.21.00.10" — the form breakdown rows list. */
  hts: string;
  htsCode10: string;
  /** Nearest ancestors + own description, e.g. "Horses › Purebred breeding animals › Males". */
  label: string;
  searchText: string;
}

/** The 10-digit lines of a chapter rate table, for the line picker. */
export function shipmentLines(rows: TariffRateTableRow[]): ShipmentLine[] {
  const lines: ShipmentLine[] = [];
  for (const row of rows) {
    if (!row.hts || !row.htsCode10) continue;
    lines.push({ hts: row.hts, htsCode10: row.htsCode10, label: [...row.ancestorPath.slice(-2), row.description].join(' › '), searchText: row.searchText });
  }
  return lines;
}

/** Lines matching a free-text query (every word must match the description path or the code). */
export function searchShipmentLines(lines: ShipmentLine[], query: string, limit: number): { matches: ShipmentLine[]; count: number } {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { matches: [], count: 0 };
  const all = lines.filter((line) => {
    const haystack = `${line.searchText} ${line.hts} ${line.htsCode10}`;
    return words.every((w) => haystack.includes(w) || haystack.includes(w.replace(/\./g, '')));
  });
  return { matches: all.slice(0, limit), count: all.length };
}

// ---------------------------------------------------------------------------
// Matrix lookup
// ---------------------------------------------------------------------------

export interface ShipmentRule {
  country: TariffMatrixCountry;
  heading: string;
  row: TariffRateBreakdownRow;
  /** Which side of the matrix the row came from. */
  usmcaClaimed: boolean;
}

/** The matrix cell breakdown row for one line (dotted HTS, e.g. "0101.21.00.10") from one country. */
export function findShipmentRule(countries: TariffMatrixCountry[], countryName: string, hts: string, usmcaClaimed: boolean): ShipmentRule | null {
  const country = countries.find((c) => c.country === countryName);
  if (!country) return null;
  const claimed = country.rule.kind === 'usmca' && usmcaClaimed;
  for (const [heading, cell] of Object.entries(country.cells)) {
    const rates = claimed ? cell.withUsmca : cell.withoutUsmca;
    const row = rates.breakdown.find((r) => r.lines.includes(hts));
    if (row) return { country, heading, row, usmcaClaimed: claimed };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Shipment computation
// ---------------------------------------------------------------------------

export interface ShipmentInputs {
  customsValueUsd: number;
  /** Quantity per unit key (see `QuantityUnit.key`). */
  quantities: Record<string, number | undefined>;
  modeOfTransport: TransportMode;
}

/** A dollar amount that is a range when the rule is ("depends on country"). */
export interface DollarRange {
  low: number;
  high: number;
}

export type BaseDutyNote = 'replaced' | 'preference' | null;

export type ShipmentDutyResult =
  | {
      status: 'ok';
      variant: string | null;
      /** Null when the base rate text can't be read, so only the total duty is known. */
      baseDuty: DollarRange | null;
      extraDuty: DollarRange | null;
      /** Why the base duty is $0 even though the base rate isn't Free. */
      baseNote: BaseDutyNote;
      duty: DollarRange;
      mpf: number;
      hmf: number;
      total: DollarRange;
      exact: boolean;
    }
  | { status: 'needs-quantity'; units: QuantityUnit[] }
  | { status: 'unparsed'; text: string };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function noPreference(preference: string): boolean {
  return /^(none|depends on country)$/i.test(preference.trim());
}

/** The variant labels a breakdown row's total offers ("generic", "patented"); empty for a single rate. */
export function rowVariantLabels(row: TariffRateBreakdownRow): string[] {
  const variants = parseRateVariants(row.total);
  if (!variants || variants.length < 2) return [];
  return variants.map((v) => v.label ?? '');
}

/** Per-unit quantities a breakdown row's total needs (one variant, or all when `variantLabel` is undefined). */
export function rowQuantityUnits(row: TariffRateBreakdownRow, variantLabel?: string | null): QuantityUnit[] {
  const rates: ParsedRate[] = [];
  for (const v of parseRateVariants(row.total) ?? []) if (variantLabel === undefined || v.label === variantLabel) rates.push(v.range.low, v.range.high);
  return quantityUnits(rates);
}

/**
 * Prices one breakdown row on a shipment. The total string is authoritative;
 * the base rate is priced separately to split the total into base + extra. The
 * base counts as $0 when the extra duty replaces it ("in place of base") or a
 * preference (USMCA, an FTA, AGOA) makes it Free.
 */
export function computeShipmentDuty(row: TariffRateBreakdownRow, inputs: ShipmentInputs, variantLabel?: string | null): ShipmentDutyResult {
  const variants = parseRateVariants(row.total);
  if (!variants || variants.length === 0) return { status: 'unparsed', text: row.total };
  const variant = variants.find((v) => v.label === variantLabel) ?? variants[0];

  const missing = quantityUnits([variant.range.low, variant.range.high]).filter((u) => {
    const q = inputs.quantities[u.key];
    return q === undefined || !Number.isFinite(q) || q < 0;
  });
  if (missing.length > 0) return { status: 'needs-quantity', units: missing };

  const value = inputs.customsValueUsd;
  const dutyLow = rateDollars(variant.range.low, value, inputs.quantities);
  const dutyHigh = rateDollars(variant.range.high, value, inputs.quantities);
  if (dutyLow === null || dutyHigh === null) return { status: 'needs-quantity', units: missing };
  const duty = { low: round2(dutyLow), high: round2(dutyHigh) };

  let baseNote: BaseDutyNote = null;
  let baseDuty: DollarRange | null = null;
  let extraDuty: DollarRange | null = null;
  const baseRate = parseRate(row.base);
  const baseIsFree = baseRate !== null && baseRate.adValoremPct === 0 && baseRate.perUnit.length === 0;
  if (!baseIsFree && /in place of (the )?base/i.test(row.extra)) baseNote = 'replaced';
  else if (!baseIsFree && !noPreference(row.preference)) baseNote = 'preference';
  const baseDollars = baseNote ? 0 : baseRate ? rateDollars(baseRate, value, inputs.quantities) : null;
  if (baseDollars !== null) {
    const base = round2(baseDollars);
    const extraLow = round2(duty.low - base);
    const extraHigh = round2(duty.high - base);
    // A negative extra means the strings disagree; show only the total then.
    if (extraLow >= 0 && extraHigh >= 0) {
      baseDuty = { low: base, high: base };
      extraDuty = { low: extraLow, high: extraHigh };
    }
  }
  if (!baseDuty) baseNote = null;

  const fees = entryFees(value, inputs.modeOfTransport);
  const mpf = round2(fees.mpf);
  const hmf = round2(fees.hmf);
  return {
    status: 'ok',
    variant: variant.label,
    baseDuty,
    extraDuty,
    baseNote,
    duty,
    mpf,
    hmf,
    total: { low: round2(duty.low + mpf + hmf), high: round2(duty.high + mpf + hmf) },
    exact: variant.range.exact,
  };
}

// ---------------------------------------------------------------------------
// Calculator deep link
// ---------------------------------------------------------------------------

function squash(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

/** ISO alpha-2 code for a matrix country name ("Viet Nam" -> "VN"); null for "Any other country". */
export function countryCodeForName(name: string): string | null {
  const target = squash(name);
  return COUNTRY_OPTIONS.find((c) => squash(c.name) === target)?.code ?? null;
}

/** Link to the full tariff calculator, pre-filled with this shipment. */
export function calculatorHref(htsCode10: string, countryName: string | null, valueUsd: number | null, qty: number | null): string {
  const params = new URLSearchParams({ hts: htsCode10 });
  const code = countryName ? countryCodeForName(countryName) : null;
  if (code) params.set('country', code);
  if (valueUsd !== null && valueUsd > 0) params.set('value', String(valueUsd));
  if (qty !== null && qty >= 0) params.set('qty', String(qty));
  return `/tariff-calculator?${params.toString()}`;
}
