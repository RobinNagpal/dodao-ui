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
  /** Set for a rate charged only on the units above a per-article threshold ("2.8¢/jewel over 7"); see `chargedQuantity`. */
  overThreshold?: ThresholdScale;
}

/**
 * "43¢ each + 2.8¢/jewel over 7 + 3.7% on the case" (9105.19.30, 9105.29.30; column 2 of those and 9105.99.40): the
 * jewel charge applies to the jewels above 7 in each movement. Priced from the shipment's total jewels (`unit`, the
 * existing jewels key) and its number of articles (`articleUnit`, the "each" quantity): jewels − 7 × movements, never
 * below 0. That equals the per-movement count when every movement has the same number of jewels (one entry line per
 * jewel count otherwise).
 */
export interface ThresholdScale {
  /** Units per article that are not charged, e.g. 7 jewels. */
  perArticle: number;
  /** The quantity that counts the articles (movements, clocks). */
  articleUnit: QuantityUnit;
}

/**
 * The quantity a per-unit charge applies to, from a lookup by unit key; null when a quantity it needs is missing.
 * A threshold charge needs both its own unit and the article count.
 */
export function chargedQuantity(charge: PerUnitCharge, qtyOf: (unitKey: string) => number | undefined): number | null {
  const valid = (q: number | undefined): q is number => q !== undefined && Number.isFinite(q) && q >= 0;
  const qty = qtyOf(charge.unit.key);
  if (!valid(qty)) return null;
  if (!charge.overThreshold) return qty;
  const articles = qtyOf(charge.overThreshold.articleUnit.key);
  if (!valid(articles)) return null;
  return Math.max(0, qty - charge.overThreshold.perArticle * articles);
}

/** Unit keys a charge needs a quantity for: its own, plus the article count of a threshold charge. */
export function chargeUnits(charge: PerUnitCharge): QuantityUnit[] {
  return charge.overThreshold ? [charge.unit, charge.overThreshold.articleUnit] : [charge.unit];
}

/** Units above the threshold per article on a nominal shipment (the generator and validator price "jewel over 7" at 7 + 10 per movement). */
export const NOMINAL_UNITS_OVER_THRESHOLD = 10;

/**
 * Quantities for a nominal shipment of `articles` articles that make every threshold part of the rate count: the
 * threshold unit gets articles × (threshold + NOMINAL_UNITS_OVER_THRESHOLD), the article unit gets `articles`. Keys go
 * through `keyOf` (identity for parser keys, `normalizeUom` for the engine's). Empty when the rate has no threshold part.
 */
export function thresholdNominalQuantities(rate: ParsedRate | null, articles: number, keyOf: (unitKey: string) => string = (k) => k): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of rate?.perUnit ?? []) {
    if (!c.overThreshold) continue;
    out[keyOf(c.overThreshold.articleUnit.key)] = articles;
    out[keyOf(c.unit.key)] = articles * (c.overThreshold.perArticle + NOMINAL_UNITS_OVER_THRESHOLD);
  }
  return out;
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
  // Counted things that aren't the goods themselves: "/jewel", "/pack", "for each other piece or part" (watch and clock
  // movements of 9110.90.40 / 9114.90.30: every piece or part other than the jewels).
  { pattern: /^(jewels?)$/, key: 'count:jewels' },
  { pattern: /^(packs?)$/, key: 'count:packs' },
  { pattern: /^(other pieces? or parts?)$/, key: 'count:other pieces or parts' },
  // Buttons of 9606.21.40 / 9606.29.20 / 9606.29.40: "0.3¢/line/ gross" is 0.3¢ per line of button size per gross, so the
  // quantity is the size in lines (1 line = 1/40 inch) × the number of gross — the HTS reporting unit "gr.lines".
  { pattern: /^(lines?\s*\/\s*gross|gr\.?\s?lines?)$/, key: 'gross:size in lines' },
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
// "0.2¢ for each other piece or part" (9110.90.40) reads like "0.2¢ per other piece or part".
const PER_UNIT_RE = new RegExp(
  `^(?:\\$\\s*${NUMBER}|${NUMBER}\\s*(?:¢|cents?\\b))\\s*(?:/\\s*|\\s+per\\s+|\\s+for\\s+each\\s+|\\s+)([a-z0-9][a-z0-9.,²³ /]*)$`,
  'i'
);

// "2.8¢/jewel over 7", "15¢/jewel over 7" (chapter 91 clocks and clock movements).
const OVER_THRESHOLD_RE = new RegExp(`^(?:\\$\\s*${NUMBER}|${NUMBER}\\s*(?:¢|cents?\\b))\\s*/\\s*(jewels?)\\s+over\\s+(\\d+)$`, 'i');

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

  // "2.8¢/jewel over 7": per jewel above 7 in each movement (the "each" count is the movements).
  const over = t.match(OVER_THRESHOLD_RE);
  if (over) {
    const amountUsd = Number((over[1] !== undefined ? Number(over[1]) : Number(over[2]) / 100).toPrecision(12));
    const perArticle = Number(over[4]);
    const unit = { key: 'count:jewels', label: `jewel over ${perArticle}` };
    const rate = { adValoremPct: 0, perUnit: [{ amountUsd, unit, overThreshold: { perArticle, articleUnit: { key: 'count', label: 'each' } } }] };
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

// ---------------------------------------------------------------------------
// Rates that need more than the customs value and quantities (issue #1812)
// ---------------------------------------------------------------------------
//
// Some HTS base rates are charged on the value of a named part of the goods ("2.5% on the value of the lead content",
// "4.7% on the value of the rifle + 20% on the value of the telescopic sight, if any", "5.3% on the battery"), point to
// the rate of another article ("The rate applicable to each garment in the ensemble if separately entered", "… the
// article of which it is a part or accessory"), bound the rate by another article's ("…, but in the case of embroidery
// in the piece not less than the rate which would apply to such product if not embroidered"), or are free only under a
// bond ("Free, under bond", wool for special uses, chapter 51 additional U.S. note 2(d)). `parseExtendedRate` reads
// them; `parseRate` / `parseRateRange` / `parseRateVariants` stay strict (null for these), so nothing that prices from
// the customs value and quantities alone — the chapter pages' "Your shipment" box — can price them by mistake.

/** An ad valorem part charged on the declared value of a named part of the goods, e.g. "2.5% on the value of the lead content". */
export interface ComponentCharge {
  pct: number;
  /** Lower-case component as the HTS names it: "lead content", "rifle", "telescopic sight", "battery", "strap, band or bracelet". */
  component: string;
  /** "…, if any": the part may be absent, so its value can be 0. */
  ifAny: boolean;
}

/**
 * How another article's rate enters a rate:
 *   whole — the rate IS that article's rate, on the full customs value (parts / accessories, sets, movement sets)
 *   each  — every article of the set at its own rate on its own value (garment ensembles, sets of 9608.50)
 *   floor — the line's own rate, but not less than that article's (embroidery in the piece, chapter 58 notes 1–5)
 *   cap   — the line's own rate, but not more than that article's (movement parts with a plate, 9110.90.40 / 9114.90.30)
 * A floor / cap applies only when its `conditionFact` (confirmation-facts.json) is answered yes.
 */
export type RateReferenceKind = 'whole' | 'each' | 'floor' | 'cap';

/** What the referenced article is; the calculator words its question from this. */
export type RateReferenceSubject = 'partOrAccessory' | 'accessory' | 'setHighestRate' | 'completeMovement' | 'garment' | 'setArticle' | 'notEmbroidered';

export interface RateReference {
  kind: RateReferenceKind;
  subject: RateReferenceSubject;
  /** The HTS wording, e.g. "The rate applicable to each garment in the ensemble if separately entered". */
  text: string;
  /** floor / cap: the confirmation fact that decides whether the bound applies. */
  conditionFact?: string;
}

/** A rate as `parseRate` reads it, plus value-of-component parts, a reference to another article's rate, or a bond. */
export interface ExtendedRate extends ParsedRate {
  components: ComponentCharge[];
  reference: RateReference | null;
  /** "Free, under bond": free at entry; the bond secures the regular duty if the goods aren't used as the note requires. */
  underBond: boolean;
}

/** Fact ids of the floor / cap clauses (confirmation-facts.json). */
export const EMBROIDERY_IN_THE_PIECE_FACT = 'embroideryInThePiece';
export const MOVEMENT_PARTS_INCLUDE_PLATE_FACT = 'movementPartsIncludePlate';

// Whole-rate references, matched against one "+"-separated term (line-break hyphens already joined by cleanRateText).
const REFERENCE_TERMS: { pattern: RegExp; kind: RateReferenceKind; subject: RateReferenceSubject }[] = [
  { pattern: /^the rate applicable to the article of which it is a part or accessory$/i, kind: 'whole', subject: 'partOrAccessory' },
  { pattern: /^the rate applicable to the article of which it is an accessory$/i, kind: 'whole', subject: 'accessory' },
  { pattern: /^the rate of duty applicable to that article in the set subject to the highest rate of duty$/i, kind: 'whole', subject: 'setHighestRate' },
  // 9110.11.00's column 2 cell is cut after "assembled" in the published HTS (PDF and JSON); the general rate of the same
  // line and 9110.90.20 read "… the complete, assembled movement", so both spellings are the same reference.
  { pattern: /^the rate applicable to the complete, assembled(?: movement)?$/i, kind: 'whole', subject: 'completeMovement' },
  // "in the in the ensemble" (6203.29.30 general) is a typo in the HTS for the same wording.
  {
    pattern: /^the rate applicable to each garment in the (?:in the )?ensemble if (?:separately entered|entered separately)$/i,
    kind: 'each',
    subject: 'garment',
  },
  { pattern: /^the rate applicable,? to each article in the absence of this subheading$/i, kind: 'each', subject: 'setArticle' },
];

// Bounds written after the line's own rate ("7.4%, but in the case of …"); removed from the text before the rest is read.
const REFERENCE_CLAUSES: { pattern: RegExp; kind: RateReferenceKind; subject: RateReferenceSubject; conditionFact: string }[] = [
  {
    pattern: /,?\s*but in the case of embroidery in the piece not less than the rate which would apply to such product if not embroidered/i,
    kind: 'floor',
    subject: 'notEmbroidered',
    conditionFact: EMBROIDERY_IN_THE_PIECE_FACT,
  },
  {
    pattern: /,?\s*but if consisting in part of a plate or a set of plates the total duty shall not exceed the duty for the complete movement/i,
    kind: 'cap',
    subject: 'completeMovement',
    conditionFact: MOVEMENT_PARTS_INCLUDE_PLATE_FACT,
  },
];

const UNDER_BOND_RE = /^free,?\s+under bond$/i;
// "2.5% on the value of the lead content", "20% on the value of the telescopic sight, if any", "5.3% on the battery",
// "6% on the strap, band or bracelet". ("6.5% on the entire set" is the customs value; PERCENT_RE reads it first.)
const COMPONENT_RE = new RegExp(
  `^${NUMBER}(?:\\s+(\\d+)/(\\d+))?\\s*%\\s+on\\s+(?:the\\s+)?(?:value\\s+of\\s+(?:the\\s+)?)?([a-z][a-z ,]*?)(\\s*,?\\s*if\\s+any)?$`,
  'i'
);

function parseComponentTerm(term: string): ComponentCharge | null {
  const m = term.match(COMPONENT_RE);
  if (!m) return null;
  const component = m[4].trim().toLowerCase().replace(/\s+/g, ' ');
  if (!component || /^(entire set|full value\b)/.test(component)) return null;
  const fraction = m[2] !== undefined && Number(m[3]) > 0 ? Number(m[2]) / Number(m[3]) : 0;
  return { pct: Number(m[1]) + fraction, component, ifAny: m[5] !== undefined };
}

/**
 * Parses a base rate, including value-of-component parts, references to another article's rate and "Free, under bond"
 * (see above). Null when any part is unreadable, a part is a range, or the text holds two references.
 */
export function parseExtendedRate(text: string): ExtendedRate | null {
  let cleaned = cleanRateText(text);
  if (!cleaned) return null;
  if (UNDER_BOND_RE.test(cleaned)) return { ...zeroRate(), components: [], reference: null, underBond: true };
  let reference: RateReference | null = null;
  for (const clause of REFERENCE_CLAUSES) {
    const m = cleaned.match(clause.pattern);
    if (!m) continue;
    cleaned = cleaned.replace(clause.pattern, '').trim();
    reference = { kind: clause.kind, subject: clause.subject, text: m[0].replace(/^,?\s*/, ''), conditionFact: clause.conditionFact };
    break;
  }
  if (!cleaned) return null;
  let rate = zeroRate();
  const components: ComponentCharge[] = [];
  for (const term of cleaned.split(/\s*\+\s*/).filter((t, i) => i > 0 || t !== '')) {
    const ref = REFERENCE_TERMS.find((r) => r.pattern.test(term));
    if (ref) {
      if (reference) return null;
      reference = { kind: ref.kind, subject: ref.subject, text: term };
      continue;
    }
    const component = parseComponentTerm(term);
    if (component) {
      components.push(component);
      continue;
    }
    const parsed = parseTerm(term);
    if (!parsed || !parsed.exact) return null;
    rate = addRates(rate, parsed.low);
  }
  return { ...rate, components, reference, underBond: false };
}

/**
 * Splits a floor / cap clause off a rate text: "7.4%, but in the case of embroidery in the piece …" → body "7.4%" and
 * clause "but in the case of embroidery in the piece …"; clause null when there is none.
 */
export function splitRateClause(text: string): { body: string; clause: string | null } {
  for (const c of REFERENCE_CLAUSES) {
    const m = text.match(c.pattern);
    if (m) return { body: text.replace(c.pattern, '').trim(), clause: m[0].replace(/^,?\s*/, '') };
  }
  return { body: text, clause: null };
}

/** True when a rate needs more than the customs value and quantities: component values, another article's rate, or a bond. */
export function isExtendedRate(rate: ExtendedRate): boolean {
  return rate.components.length > 0 || rate.reference !== null || rate.underBond;
}

/** "the lead content" → "Value of the lead content (USD)"; "telescopic sight" (if any) → "… (USD, 0 if none)". */
export function componentLabel(c: Pick<ComponentCharge, 'component' | 'ifAny'>): string {
  return `Value of the ${c.component} (USD${c.ifAny ? ', 0 if none' : ''})`;
}

/**
 * Dollars an extended rate costs, given the component values and the referenced article's duty in dollars (whole / each:
 * that duty is the base; floor / cap: the bound, applied as given — the caller decides whether the condition holds and
 * passes `referenceDutyUsd` only then). Null when a component value, the referenced duty or a quantity is missing.
 */
export function extendedRateDollars(
  rate: ExtendedRate,
  customsValueUsd: number,
  quantities: Record<string, number | undefined>,
  opts: { componentValuesUsd?: Record<string, number | undefined>; referenceDutyUsd?: number; polarityDegrees?: number } = {}
): number | null {
  const own = rateDollars(rate, customsValueUsd, quantities, opts.polarityDegrees);
  if (own === null) return null;
  let total = own;
  for (const c of rate.components) {
    const v = opts.componentValuesUsd?.[c.component];
    if (v === undefined || !Number.isFinite(v) || v < 0) return null;
    total += (c.pct / 100) * v;
  }
  if (!rate.reference) return total;
  const ref = opts.referenceDutyUsd;
  if (ref === undefined || !Number.isFinite(ref)) return null;
  switch (rate.reference.kind) {
    case 'whole':
    case 'each':
      return total + ref;
    case 'floor':
      return Math.max(total, ref);
    case 'cap':
      return Math.min(total, ref);
  }
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
  for (const rate of rates) for (const charge of rate.perUnit) for (const unit of chargeUnits(charge)) if (!seen.has(unit.key)) seen.set(unit.key, unit);
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
    const qty = chargedQuantity(charge, (key) => quantities[key]);
    if (qty === null) return null;
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
