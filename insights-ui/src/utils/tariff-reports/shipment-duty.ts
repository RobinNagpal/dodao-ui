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
import { qualifiedKey, qualifierPhrase, splitQualifiedKey, splitUnitText } from '@/utils/tariff-calculator/rate-units';
import type { TariffMatrixCountry, TariffRateBreakdownRow, TariffRateTableRow } from '@/types/tariff-chapter-prototype';

// ---------------------------------------------------------------------------
// Rate parsing
// ---------------------------------------------------------------------------

/** A quantity a per-unit rate is charged on. `key` groups equivalent spellings ("head", "No.", "each"). */
export interface QuantityUnit {
  /**
   * "kg", "count", "liter", … — plus the qualifier when the rate charges on a qualified quantity:
   * "kg:molybdenum content", "kg:drained weight", "kg:gross weight" (see rate-units.ts).
   */
  key: string;
  /** How the unit reads, e.g. "kg", "head", "kg of molybdenum content", "1,000 units". */
  label: string;
}

export interface PerUnitCharge {
  /**
   * Dollars per unit (cents are converted; a rate per 1,000 units is divided by 1,000). For a sugar polarity rate
   * (`polarity` set) this is the amount at 100 degrees, the highest it can be.
   */
  amountUsd: number;
  unit: QuantityUnit;
  /** Set for a rate that falls with the sugar's polarity (heading 1701); price it with `chargeAmountUsd`. */
  polarity?: PolarityScale;
}

/**
 * A raw-sugar rate graded by polarity (heading 1701): "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees
 * (and fractions of a degree in proportion) but not less than 3.143854¢/kg". The charge per kg is
 * `amountUsd − lessPerDegreeUsd × (100 − degrees)`, never below `minUsd`.
 */
export interface PolarityScale {
  /** Dollars per kg taken off for each degree (and fraction of a degree) under 100. */
  lessPerDegreeUsd: number;
  /** The rate's floor in dollars per kg; null when the HTS states none. */
  minUsd: number | null;
}

/** Polarity in degrees a polarity rate is priced at when the importer doesn't give one: 100°, its highest amount. */
export const FULL_POLARITY_DEGREES = 100;

/** True when the polarity is a usable number of degrees (above 0, at most 100). */
export function isValidPolarity(degrees: number): boolean {
  return Number.isFinite(degrees) && degrees > 0 && degrees <= FULL_POLARITY_DEGREES;
}

/** Dollars one unit of a per-unit charge costs; a polarity rate is priced at `polarityDegrees` (default 100°). */
export function chargeAmountUsd(charge: PerUnitCharge, polarityDegrees?: number): number {
  if (!charge.polarity) return charge.amountUsd;
  const degrees = polarityDegrees === undefined ? FULL_POLARITY_DEGREES : polarityDegrees;
  const under = Math.max(0, FULL_POLARITY_DEGREES - degrees);
  const amount = charge.amountUsd - charge.polarity.lessPerDegreeUsd * under;
  const floored = charge.polarity.minUsd === null ? amount : Math.max(amount, charge.polarity.minUsd);
  return Number(Math.max(0, floored).toPrecision(12));
}

/** True when any per-unit part of the rate is graded by sugar polarity. */
export function rateHasPolarity(rate: ParsedRate | null | undefined): boolean {
  return !!rate && rate.perUnit.some((c) => !!c.polarity);
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
  { pattern: /^(clean\s?kg|clean\s?kilograms?)$/, key: 'clean kg' },
  { pattern: /^(kg|kgs|kilograms?)$/, key: 'kg' },
  { pattern: /^(g|grams?)$/, key: 'g' },
  { pattern: /^(t|tons?|tonnes?|metric tons?)$/, key: 't' },
  { pattern: /^(pf\.?\s?l\.?|pf\.?\s?lit(ers?|res?)|proof liters?|proof litres?)$/, key: 'proof liter' },
  { pattern: /^(l|liters?|litres?)$/, key: 'liter' },
  { pattern: /^(head|each|no\.?|number|units?|pcs?\.?|pieces?|items?|articles?)$/, key: 'count' },
  { pattern: /^(doz\.?|dozens?)$/, key: 'dozen' },
  { pattern: /^(pr\.?|prs\.?|pairs?)$/, key: 'pair' },
  { pattern: /^(gross)$/, key: 'gross' },
  { pattern: /^(m2|m²|sq\.?\s?m|square meters?)$/, key: 'm2' },
  { pattern: /^(m3|m³|cubic meters?)$/, key: 'm3' },
  { pattern: /^(m|meters?|metres?|lin\.?\s?m|linear meters?)$/, key: 'm' },
  { pattern: /^(bbl|barrels?)$/, key: 'barrel' },
  // Counted things that aren't the goods themselves: "/jewel", "/pack".
  { pattern: /^(jewels?)$/, key: 'count:jewels' },
  { pattern: /^(packs?)$/, key: 'count:packs' },
];

/** Unit keys the parser understands (a qualified key is known when its base is). Others are kept as written, lower-cased. */
export const KNOWN_UNIT_KEYS: readonly string[] = Array.from(new Set(UNIT_ALIASES.map((a) => a.key.split(':')[0])));

/** True when a parsed unit key is one the calculator can ask a quantity for. */
export function isKnownUnitKey(key: string): boolean {
  return KNOWN_UNIT_KEYS.includes(splitQualifiedKey(key).base);
}

// "1000", "1,000", "thousand", "1,000 pins": a rate per 1,000 units, charged per unit (see rate-units.ts).
const PER_THOUSAND = /^(?:1,?000|thousand)(?:\s+(.+))?$/;

/** The unit a rate text names, and the factor its amount is multiplied by to price one such unit. */
function toUnit(raw: string): { unit: QuantityUnit; factor: number } {
  const label = raw.trim().replace(/\s+/g, ' ');
  const thousand = label.toLowerCase().match(PER_THOUSAND);
  if (thousand) {
    const what = thousand[1]?.trim() ?? null;
    return { unit: { key: what ? `count:${what}` : 'count', label: `1,000 ${what ?? 'units'}` }, factor: 1 / 1000 };
  }
  const { base, qualifier } = splitUnitText(label);
  const alias = UNIT_ALIASES.find((a) => a.pattern.test(base));
  if (!alias) return { unit: { key: label.toLowerCase(), label }, factor: 1 };
  const aliasKey = splitQualifiedKey(alias.key);
  if (!qualifier) return { unit: { key: alias.key, label }, factor: 1 };
  return { unit: { key: qualifiedKey(aliasKey.base, qualifier), label: `${base}${qualifierPhrase(qualifier)}` }, factor: 1 };
}

const NUMBER = '(\\d+(?:\\.\\d+)?)';
// "10%", "33 1/3%", "6.5% on the entire set" (the set's value is the customs value)
const PERCENT_RE = new RegExp(`^${NUMBER}(?:\\s+(\\d+)/(\\d+))?\\s*%(?:\\s+on the entire set)?$`, 'i');
// "Free–37.5%", "6.8%–44.3%", "0–37.5%", "15–100%"
const PERCENT_RANGE_RE = new RegExp(`^(free|${NUMBER}\\s*%?)\\s*[–—-]\\s*${NUMBER}\\s*%$`, 'i');
// "1¢/kg", "68¢/head", "0.9¢ each", "$1.20/doz", "$1.20 per dozen", "1 cent/kg", "89.6¢/1000",
// "$1.32/t, including weight of container", "12.8¢/kg on molybdenum content"
const PER_UNIT_RE = new RegExp(`^(?:\\$\\s*${NUMBER}|${NUMBER}\\s*(?:¢|cents?\\b))\\s*(?:/\\s*|\\s+per\\s+|\\s+)([a-z0-9][a-z0-9.,²³ /]*)$`, 'i');

/**
 * Removes parenthetical notes ("(9903.05.39)", "(232 list)"), "in place of base" wording and
 * line-break hyphens from the published text ("thou- sand" → "thousand").
 */
function cleanRateText(text: string): string {
  return (
    text
      // The polarity display form's floor, "(min 3.143854¢/kg)", is part of the rate.
      .replace(/\(\s*(min(?:imum)?\s+[^)]*)\)/gi, ', $1')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\bin place of (the )?base( rate)?\b/gi, ' ')
      .replace(/([a-z])- ([a-z])/gi, '$1$2')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

type TermRange = { low: ParsedRate; high: ParsedRate; exact: boolean };

// A dollars-or-cents amount per kg: "3.6606¢/kg", "0.0622005¢ /kg", "$0.04/kg".
const PER_KG_AMOUNT = `(\\$\\s*${NUMBER}|${NUMBER}\\s*(?:¢|cents?\\b))\\s*/\\s*kg`;
// HTS wording (parentheticals already removed): "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees but not
// less than 3.143854¢/kg" (column 2 sometimes drops the "than").
const POLARITY_HTS_RE = new RegExp(
  `^${PER_KG_AMOUNT}\\s+less\\s+${PER_KG_AMOUNT}\\s+for\\s+each\\s+degree\\s+under\\s+100\\s+degrees(?:\\s*,?\\s*but\\s+not\\s+less(?:\\s+than)?\\s+${PER_KG_AMOUNT})?$`,
  'i'
);
// Display wording (formatPolarityRate): "3.6606¢/kg at 100° polarity, 0.020668¢/kg less per degree under 100, min 3.143854¢/kg".
const POLARITY_DISPLAY_RE = new RegExp(
  `^${PER_KG_AMOUNT}\\s+at\\s+100\\s*°?\\s+polarity\\s*,\\s*${PER_KG_AMOUNT}\\s+less\\s+per\\s+degree\\s+under\\s+100\\s*°?(?:\\s*,\\s*min(?:imum)?\\s+${PER_KG_AMOUNT})?$`,
  'i'
);

/** Dollars from a PER_KG_AMOUNT match's (dollars, cents) capture pair. */
function perKgUsd(dollars: string | undefined, cents: string | undefined): number | null {
  if (dollars !== undefined) return Number(dollars);
  if (cents !== undefined) return Number((Number(cents) / 100).toPrecision(12));
  return null;
}

/** A sugar polarity term ("… less …¢/kg for each degree under 100 degrees …"), in HTS or display wording; null otherwise. */
function parsePolarityTerm(term: string): PerUnitCharge | null {
  const m = term.match(POLARITY_HTS_RE) ?? term.match(POLARITY_DISPLAY_RE);
  if (!m) return null;
  // Each PER_KG_AMOUNT contributes 3 groups: the whole amount, its dollars, its cents.
  const full = perKgUsd(m[2], m[3]);
  const less = perKgUsd(m[5], m[6]);
  const min = m[7] !== undefined ? perKgUsd(m[8], m[9]) : null;
  if (full === null || less === null || !(less > 0)) return null;
  return { amountUsd: full, unit: { key: 'kg', label: 'kg' }, polarity: { lessPerDegreeUsd: less, minUsd: min } };
}

function centsText(usd: number): string {
  return `${Number((usd * 100).toPrecision(10))}¢/kg`;
}

/**
 * The plain-English form of a sugar polarity rate: "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and
 * fractions of a degree in proportion) but not less than 3.143854¢/kg" → "3.6606¢/kg at 100° polarity, 0.020668¢/kg
 * less per degree under 100 (min 3.143854¢/kg)". Other terms of the rate are kept; null when it has no polarity term.
 * The result parses back to the same rate.
 */
export function formatPolarityRate(text: string): string | null {
  let changed = false;
  const terms = text.split(/\s*\+\s*/).map((raw) => {
    const charge = parsePolarityTerm(cleanRateText(raw));
    if (!charge?.polarity) return raw.trim();
    changed = true;
    const { lessPerDegreeUsd, minUsd } = charge.polarity;
    const min = minUsd === null ? '' : ` (min ${centsText(minUsd)})`;
    return `${centsText(charge.amountUsd)} at 100° polarity, ${centsText(lessPerDegreeUsd)} less per degree under 100${min}`;
  });
  return changed ? terms.join(' + ') : null;
}

function zeroRate(): ParsedRate {
  return { adValoremPct: 0, perUnit: [] };
}

function parseTerm(term: string): TermRange | null {
  const t = term.replace(/^\+\s*/, '').trim();
  if (/^(free|none|0)$/i.test(t)) return { low: zeroRate(), high: zeroRate(), exact: true };

  const pct = t.match(PERCENT_RE);
  if (pct) {
    const fraction = pct[2] !== undefined && Number(pct[3]) > 0 ? Number(pct[2]) / Number(pct[3]) : 0;
    const rate = { adValoremPct: Number(pct[1]) + fraction, perUnit: [] };
    return { low: rate, high: rate, exact: true };
  }

  const range = t.match(PERCENT_RANGE_RE);
  if (range) {
    const low = /^free$/i.test(range[1]) ? 0 : Number(range[2]);
    const high = Number(range[3]);
    if (!(high >= low)) return null;
    return { low: { adValoremPct: low, perUnit: [] }, high: { adValoremPct: high, perUnit: [] }, exact: low === high };
  }

  const polarity = parsePolarityTerm(t);
  if (polarity) {
    const rate = { adValoremPct: 0, perUnit: [polarity] };
    return { low: rate, high: rate, exact: true };
  }

  const perUnit = t.match(PER_UNIT_RE);
  if (perUnit) {
    const { unit, factor } = toUnit(perUnit[3]);
    // toPrecision drops float noise from the cents and per-1,000 conversions (89.6¢/1000 → 0.000896).
    const amountUsd = Number(((perUnit[1] !== undefined ? Number(perUnit[1]) : Number(perUnit[2]) / 100) * factor).toPrecision(12));
    const rate = { adValoremPct: 0, perUnit: [{ amountUsd, unit }] };
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
  // "15.4¢/kg +59%", "27.6¢/liter+ 17.5%": the HTS doesn't always space the "+".
  const terms = cleaned.split(/\s*\+\s*/).filter((t, i) => i > 0 || t !== '');
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
    // "<rate> <label>": the shortest leading run of words that reads as a rate, the rest a lowercase label
    // ("17.1% safeguard applies", "35.74¢/kg + 10% above quota", "Free within quota or above quota").
    const words = part.trim().split(/\s+/);
    let found: RateVariant | null = null;
    for (let i = 1; i < words.length && !found; i++) {
      const label = words.slice(i).join(' ');
      if (!/^[a-z][a-z ,-]*$/.test(label)) continue;
      const range = parseRateRange(words.slice(0, i).join(' '));
      if (range) found = { label, range };
    }
    if (!found) return null;
    variants.push(found);
  }
  return variants;
}

/** Distinct per-unit quantities a set of rates needs, in first-seen order. */
export function quantityUnits(rates: ParsedRate[]): QuantityUnit[] {
  const seen = new Map<string, QuantityUnit>();
  for (const rate of rates) for (const charge of rate.perUnit) if (!seen.has(charge.unit.key)) seen.set(charge.unit.key, charge.unit);
  return Array.from(seen.values());
}

/**
 * Dollars a parsed rate costs on a shipment. Null when a per-unit quantity is missing. A sugar polarity rate is priced at
 * `polarityDegrees` (default 100°, its highest amount).
 */
export function rateDollars(
  rate: ParsedRate,
  customsValueUsd: number,
  quantities: Record<string, number | undefined>,
  polarityDegrees?: number
): number | null {
  let total = (rate.adValoremPct / 100) * customsValueUsd;
  for (const charge of rate.perUnit) {
    const qty = quantities[charge.unit.key];
    if (qty === undefined || !Number.isFinite(qty) || qty < 0) return null;
    total += chargeAmountUsd(charge, polarityDegrees) * qty;
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
  /** The line's own description, e.g. "Males" — what tells it apart from its siblings. */
  description: string;
  /** Its nearest ancestors, e.g. "Horses › Purebred breeding animals"; empty at the top level. */
  context: string;
  searchText: string;
}

/** The 10-digit lines of a chapter rate table, for the line picker. */
export function shipmentLines(rows: TariffRateTableRow[]): ShipmentLine[] {
  const lines: ShipmentLine[] = [];
  for (const row of rows) {
    if (!row.hts || !row.htsCode10) continue;
    const context = row.ancestorPath.slice(-2).join(' › ');
    lines.push({
      hts: row.hts,
      htsCode10: row.htsCode10,
      label: context ? `${context} › ${row.description}` : row.description,
      description: row.description,
      context,
      searchText: row.searchText,
    });
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
