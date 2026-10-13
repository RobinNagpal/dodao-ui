// Official-measures duty engine (issue #1785).
//
// Prices one HTS 10-digit line for one shipment from official data only:
//   1. Base line — the HTS `general` rate (or `column2` for column 2 countries), or the
//      special-program rate when the importer claims a trade deal listed in the line's
//      `special` column ("Free (A+,AU,…,S,SG)", "Free (A,AU,…) 6.6% (JP)").
//   2. Extra duties — reviewed `TariffMeasureRecord`s (Chapter 99 headings with their
//      coverage, countries, conditions and effective dates), resolved in this order:
//        a. in scope   = the line is in `coverageInclude` (empty = every line) and the
//                        country passes `countriesInclude` / `countriesExclude`
//        b. applicable = in effect on the entry date, line not in `coverageExclude`,
//                        and every condition matches (usmcaQualifying ⇔ SPI "S"/"S+"
//                        claimed; productTypes; spiClaimed; and the shipment facts the
//                        importer confirmed — endUse, productDescriptionIds,
//                        companyProgram, usOriginIngredient (issue #1790): unconfirmed = skipped, so a
//                        conditional relief never applies on a guess)
//        c. replaces   = each applicable measure still in play drops every measure whose
//                        Chapter 99 code is in its `replacesCodes` (relief measures walk
//                        first; a measure already dropped cannot drop others)
//        d. priced     = additive: + pct × value on top of the base
//                        inPlaceOfBase: pct × value and the base is not charged
//                        floor: max(base, pct × value), replacing the base
//                        relief: no amount (it only cancels what it replaces)
//                        where value = the full customs value, or — for a measure with a
//                        `contentBasis` (issue #1796) — only the declared content value:
//                        steel / aluminum / copper → `contentValuesUsd[basis]` (Section 232
//                        derivatives, notes 16 / 19); nonUsContent → customs value − the
//                        U.S.-content value, floored at 0 (Section 232 autos/parts for
//                        USMCA-qualifying goods, note 33). A floor measure with a content basis
//                        compares the base (on the full value) with pct × the content value.
//                        Only the ad valorem part is re-based; the base line's per-unit parts
//                        are unaffected. A missing content value is an `error` that names the
//                        content and the measure; a content value above the customs value is
//                        an `error` too.
// In-scope measures that are not charged are returned in `skipped` with the reason.
// A per-unit rate without a quantity for its unit, an unreadable rate, or a claim the
// line does not offer is an `error` — never a silent $0.
//
// Rate text is parsed by the shared parser in src/utils/tariff-reports/shipment-duty.ts.
// Pure (no DB, no Date.now) so the golden-scenario tests run it directly.

import type {
  CalculateWithMeasures,
  TariffConfirmationFact,
  TariffContentBasis,
  TariffImportBan,
  TariffImportProhibition,
  TariffShipmentConfirmations,
  MeasureEngineDutyLine,
  MeasureEngineInput,
  MeasureEngineLine,
  MeasureEngineResult,
  TariffCompanyProgram,
  TariffConfirmationQuestion,
  TariffEndUse,
  TariffMeasureRecord,
  TariffMeasureSource,
  TariffProductDescription,
  TariffProductType,
} from '@/types/tariff-calculator-measures';
import { loadConfirmationFacts } from '@/utils/tariff-calculator/confirmation-facts';
import {
  describeQuotaTiers,
  isQuotaReference,
  priceQuotaClaim,
  quotaQuestionEffect,
  quotaQuestionPrompt,
  resolveQuotaClaim,
  type QuotaAnswers,
  type QuotaResolution,
} from '@/utils/tariff-calculator/fta-quota';
import { loadImportBans } from '@/utils/tariff-calculator/import-bans';
import { describeUom, KNOWN_UOMS, qualifiedKey, splitQualifiedKey, splitUnitText } from '@/utils/tariff-calculator/rate-units';
import { chargeAmountUsd, FULL_POLARITY_DEGREES, isValidPolarity, parseRate, rateHasPolarity, type ParsedRate } from '@/utils/tariff-reports/shipment-duty';

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

// Spellings (HTS "Unit of Quantity" cells, rate-text units, the shared parser's unit
// keys) → the calculator's unit codes (see `describeUom` in duty-engine.ts).
const UOM_ALIASES: { pattern: RegExp; uom: string }[] = [
  { pattern: /^(pf\.?\s?l\.?|pfl|proof\s?(liters?|litres?))$/, uom: 'PF.L' },
  { pattern: /^(clean\s?kg|ckg|clean\s?kilograms?)$/, uom: 'CKG' },
  { pattern: /^(kg|kgs|kilograms?)$/, uom: 'KG' },
  { pattern: /^(g|gm|grams?)$/, uom: 'G' },
  { pattern: /^(t|tons?|tonnes?|metric\s?tons?)$/, uom: 'T' },
  { pattern: /^(l|liters?|litres?|liter)$/, uom: 'L' },
  { pattern: /^(no\.?|number|count|head|each|units?|pcs?\.?|pieces?|items?)$/, uom: 'NO' },
  { pattern: /^(doz\.?\s?prs?\.?|dpr|dozen\s?pairs?)$/, uom: 'DPR' },
  { pattern: /^(doz\.?|dozens?)$/, uom: 'DOZ' },
  { pattern: /^(prs?\.?|pairs?)$/, uom: 'PRS' },
  { pattern: /^(gross)$/, uom: 'GROSS' },
  { pattern: /^(m2|m²|sq\.?\s?m|square\s?met(er|re)s?)$/, uom: 'M2' },
  { pattern: /^(m3|m³|cubic\s?met(er|re)s?)$/, uom: 'M3' },
  { pattern: /^(m|met(er|re)s?)$/, uom: 'M' },
  { pattern: /^(ths|thousands?|1,?000)$/, uom: 'THS' },
  { pattern: /^(bbl|barrels?)$/, uom: 'BBL' },
];

const METAL_CONTENT: Record<string, string> = {
  mo: 'molybdenum',
  w: 'tungsten',
  cu: 'copper',
  pb: 'lead',
  zn: 'zinc',
  mg: 'magnesium',
  mn: 'manganese',
  si: 'silicon',
};

function normalizePlainUom(raw: string): string {
  const lower = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const alias = UOM_ALIASES.find((a) => a.pattern.test(lower));
  return alias ? alias.uom : raw.trim().toUpperCase();
}

/**
 * Normalizes a unit spelling ("No.", "kg", "liters", "doz.", "PFL", "count") to the calculator's unit code ("NO", "KG",
 * "L", "DOZ", "PF.L"). A qualified quantity keeps its qualifier (rate-units.ts): "kg:copper content", "KG:copper content"
 * and the rate text's own "kg on copper content" all give "KG:copper content"; "kg on contents and container" gives
 * "KG:gross weight". Unknown units are upper-cased.
 */
export function normalizeUom(raw: string): string {
  // HTS reporting units for metal content ("Mo kg", "W kg", "Cu kg") are the qualified quantity the rate charges on.
  const metal = /^(mo|w|cu|pb|zn|mg|mn|si)\s?kg$/i.exec(raw.trim());
  if (metal) return qualifiedKey('KG', `${METAL_CONTENT[metal[1].toLowerCase()]} content`);
  const keyed = splitQualifiedKey(raw.trim());
  if (keyed.qualifier) return qualifiedKey(normalizePlainUom(keyed.base), keyed.qualifier.toLowerCase().replace(/\s+/g, ' '));
  const plain = normalizePlainUom(raw);
  if (plain !== raw.trim().toUpperCase()) return plain;
  const { base, qualifier } = splitUnitText(raw);
  if (!qualifier) return normalizePlainUom(base);
  const baseUom = normalizePlainUom(base);
  // Only a known base takes a qualifier; anything else stays as written (upper-cased), as before.
  return KNOWN_UOMS.includes(baseUom) ? qualifiedKey(baseUom, qualifier) : plain;
}

function normalizeQuantities(quantities: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(quantities)) out[normalizeUom(k)] = v;
  return out;
}

// ---------------------------------------------------------------------------
// Special programs (SPI)
// ---------------------------------------------------------------------------

/** One "rate (programs)" group of an HTS special column. */
export interface SpecialRateEntry {
  rateText: string;
  /** Program codes as listed, without spaces ("A+", "AU", "S"). */
  programs: string[];
}

/** Splits an HTS special column, e.g. "Free (A,AU,BH) 6.6% (JP)" → [{Free,[A,AU,BH]},{6.6%,[JP]}]. */
export function parseSpecialRates(special: string | null | undefined): SpecialRateEntry[] {
  if (!special) return [];
  const entries: SpecialRateEntry[] = [];
  const re = /([^()]*?)\s*\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(special)) !== null) {
    const rateText = m[1].trim();
    const programs = m[2]
      .split(',')
      .map((p) => p.replace(/\s+/g, ''))
      .filter(Boolean);
    if (rateText && programs.length > 0) entries.push({ rateText, programs });
  }
  return entries;
}

function samePrograms(a: string, b: string): boolean {
  // "A*" (GSP with some countries excluded) is still program "A".
  return a.replace(/\*$/, '') === b.replace(/\*$/, '');
}

/** The special rate text the line gives a claimed program; null when the line does not list it. */
export function specialRateFor(line: Pick<MeasureEngineLine, 'special'>, claimedSpi: string): string | null {
  const entry = parseSpecialRates(line.special).find((e) => e.programs.some((p) => samePrograms(p, claimedSpi)));
  return entry ? entry.rateText : null;
}

export const USMCA_SPI_CODES = ['S', 'S+'];

export interface SpecialProgramInfo {
  /** Plain-English name. */
  name: string;
  /** ISO2 countries the program is for; absent = not tied to one country list (product-based or many beneficiaries). */
  countries?: string[];
  /** True when the program is no longer in force, so the calculator does not offer it. */
  lapsed?: boolean;
}

// HTS General Note 3(c)(i) program codes.
export const SPECIAL_PROGRAMS: Record<string, SpecialProgramInfo> = {
  A: { name: 'GSP (Generalized System of Preferences)', lapsed: true },
  'A+': { name: 'GSP, least-developed countries', lapsed: true },
  'A*': { name: 'GSP (some countries excluded)', lapsed: true },
  AU: { name: 'US–Australia Free Trade Agreement', countries: ['AU'] },
  B: { name: 'Automotive Products Trade Act' },
  BH: { name: 'US–Bahrain Free Trade Agreement', countries: ['BH'] },
  C: { name: 'Agreement on Trade in Civil Aircraft' },
  CA: { name: 'NAFTA (Canada), replaced by USMCA', countries: ['CA'], lapsed: true },
  CL: { name: 'US–Chile Free Trade Agreement', countries: ['CL'] },
  CO: { name: 'US–Colombia Trade Promotion Agreement', countries: ['CO'] },
  D: { name: 'AGOA (African Growth and Opportunity Act)' },
  E: { name: 'Caribbean Basin Initiative (CBERA)' },
  'E*': { name: 'Caribbean Basin Initiative (some countries excluded)' },
  IL: { name: 'US–Israel Free Trade Agreement', countries: ['IL'] },
  J: { name: 'Andean Trade Preference Act', lapsed: true },
  'J*': { name: 'Andean Trade Preference Act', lapsed: true },
  'J+': { name: 'Andean Trade Promotion and Drug Eradication Act', lapsed: true },
  JO: { name: 'US–Jordan Free Trade Agreement', countries: ['JO'] },
  JP: { name: 'US–Japan Trade Agreement', countries: ['JP'] },
  K: { name: 'Agreement on Trade in Pharmaceutical Products' },
  KR: { name: 'US–Korea Free Trade Agreement (KORUS)', countries: ['KR'] },
  L: { name: 'Uruguay Round concessions on intermediate chemicals for dyes' },
  MA: { name: 'US–Morocco Free Trade Agreement', countries: ['MA'] },
  MX: { name: 'NAFTA (Mexico), replaced by USMCA', countries: ['MX'], lapsed: true },
  N: { name: 'Nepal Preference Program', countries: ['NP'] },
  OM: { name: 'US–Oman Free Trade Agreement', countries: ['OM'] },
  P: { name: 'CAFTA-DR (Central America–Dominican Republic)', countries: ['CR', 'DO', 'SV', 'GT', 'HN', 'NI'] },
  'P+': { name: 'CAFTA-DR (Central America–Dominican Republic)', countries: ['CR', 'DO', 'SV', 'GT', 'HN', 'NI'] },
  PA: { name: 'US–Panama Trade Promotion Agreement', countries: ['PA'] },
  PE: { name: 'US–Peru Trade Promotion Agreement', countries: ['PE'] },
  R: { name: 'Caribbean Basin Trade Partnership Act' },
  S: { name: 'USMCA (Canada/Mexico)', countries: ['CA', 'MX'] },
  'S+': { name: 'USMCA (Canada/Mexico)', countries: ['CA', 'MX'] },
  SG: { name: 'US–Singapore Free Trade Agreement', countries: ['SG'] },
};

export interface ClaimableProgram {
  code: string;
  name: string;
  /** Rate the line gives this program, e.g. "Free" — or, for a Chapter 98/99 quota reference, the tiers in words. */
  rateText: string;
  /** Every rate text the claim can be charged at (one, or each quota tier's), for the quantities to ask for. */
  rateTexts: string[];
  /** Empty = any country. */
  countries: string[];
}

/**
 * A special-column entry that points to Chapter 98/99 FTA quota headings ("See 9823.01.01-9823.01.07 (S+)"), resolved
 * per country of origin and grouped by the same tiers: e.g. USMCA → Mexico "Free (9823.01.01)", Canada "Free within the
 * quota (9823.01.02); 77.2¢/liter above the quota (9823.01.03)". Countries the headings make no provision for are left out.
 */
function quotaClaimOffers(line: { hts10: string; general: string | null }, code: string, rateText: string): ClaimableProgram[] {
  const info = SPECIAL_PROGRAMS[code];
  const candidates = info?.countries ?? [];
  const groups = new Map<string, ClaimableProgram>();
  for (const country of candidates) {
    const res = resolveQuotaClaim(line, code, rateText, country);
    if (!res.ok) continue;
    const text = describeQuotaTiers(res.resolution);
    const existing = groups.get(text);
    if (existing) existing.countries.push(country);
    else
      groups.set(text, {
        code,
        name: info?.name ?? `Program ${code}`,
        rateText: text,
        rateTexts: Array.from(new Set(res.resolution.tiers.map((t) => t.rateText))),
        countries: [country],
      });
  }
  return Array.from(groups.values());
}

/**
 * Programs a line's special column offers that an importer can claim today (lapsed programs left
 * out), one per program code. On a line whose general rate is already Free, `conditionPrograms`
 * (programs the line's extra duties depend on, see `conditionProgramsForLine`) are offered too,
 * at "Free": the claim changes no base rate but does change which extra duties apply.
 * A program whose entry points to Chapter 98/99 FTA quota headings ("See 9822.04.01-9822.04.03 (AU)") is offered when
 * the headings can be priced (`line.hts10` given), one entry per group of countries with the same tiers; rates the
 * parser can't price and references it can't resolve are not offered.
 */
export function claimablePrograms(
  line: Pick<MeasureEngineLine, 'special' | 'general'> & { hts10?: string },
  conditionPrograms: string[] = []
): ClaimableProgram[] {
  const out: ClaimableProgram[] = [];
  const seen = new Set<string>();
  if (isFree(line.general)) {
    for (const code of conditionPrograms) {
      const info = SPECIAL_PROGRAMS[code];
      if (seen.has(code) || info?.lapsed || specialRateFor(line, code) !== null) continue;
      seen.add(code);
      out.push({ code, name: info?.name ?? `Program ${code}`, rateText: 'Free', rateTexts: ['Free'], countries: info?.countries ?? [] });
    }
  }
  for (const entry of parseSpecialRates(line.special)) {
    for (const code of entry.programs) {
      const info = SPECIAL_PROGRAMS[code];
      if (seen.has(code) || info?.lapsed) continue;
      if (isQuotaReference(entry.rateText)) {
        if (!line.hts10) continue;
        const offers = quotaClaimOffers({ hts10: line.hts10, general: line.general }, code, entry.rateText);
        if (offers.length === 0) continue;
        seen.add(code);
        out.push(...offers);
        continue;
      }
      // Rates the parser can't price are not offered.
      if (!parseRate(entry.rateText)) continue;
      seen.add(code);
      out.push({ code, name: info?.name ?? `Program ${code}`, rateText: entry.rateText, rateTexts: [entry.rateText], countries: info?.countries ?? [] });
    }
  }
  return out;
}

// Countries whose goods pay the column 2 rate: Cuba, North Korea, and (since 2022,
// Suspending Normal Trade Relations with Russia and Belarus Act) Russia and Belarus.
export const COLUMN2_COUNTRIES = ['CU', 'KP', 'RU', 'BY'];

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

type Priced = { ok: true; amount: number } | { ok: false; missingUoms: string[] };

function priceRate(rate: ParsedRate, valueUsd: number, quantities: Record<string, number>, polarityDegrees?: number): Priced {
  let amount = (rate.adValoremPct / 100) * valueUsd;
  const missing: string[] = [];
  for (const charge of rate.perUnit) {
    const uom = normalizeUom(charge.unit.key);
    const qty = quantities[uom];
    if (qty === undefined || !Number.isFinite(qty) || qty < 0) missing.push(uom);
    else amount += chargeAmountUsd(charge, polarityDegrees) * qty;
  }
  return missing.length > 0 ? { ok: false, missingUoms: Array.from(new Set(missing)) } : { ok: true, amount };
}

/** True when a rate text has a part graded by sugar polarity (heading 1701), so the calculator should ask for the polarity. */
export function rateNeedsPolarity(rateText: string | null | undefined): boolean {
  return !!rateText && rateHasPolarity(parseRate(rateText));
}

/** Start of the base-line note when no polarity was given for a polarity-graded rate (scripts match on it). */
export const POLARITY_ASSUMED = 'Polarity not given';

function centsPerKg(usd: number): string {
  return `${Number((usd * 100).toFixed(6))}¢/kg`;
}

/**
 * The base line's note for a polarity-graded rate: which polarity it was priced at, and — when the importer gave none —
 * that 100° (the rate's highest amount) was assumed.
 */
function polarityNote(rate: ParsedRate, polarityDegrees: number | undefined): string | null {
  const charge = rate.perUnit.find((c) => c.polarity);
  if (!charge) return null;
  const perKg = centsPerKg(chargeAmountUsd(charge, polarityDegrees));
  if (polarityDegrees === undefined) {
    return `${POLARITY_ASSUMED}: priced at ${FULL_POLARITY_DEGREES}° (${perKg}), the highest this rate can be. The rate falls for each degree under 100, so enter the polarity from the sugar's polariscope test for the exact duty (CBP takes estimated duties on raw sugar at no less than 96° unless the invoice shows a lower grade, 19 CFR 151.22; the final duty uses the tested polarity).`;
  }
  const min = charge.polarity?.minUsd ?? null;
  const atMin = min !== null && chargeAmountUsd(charge, polarityDegrees) <= min;
  return `Priced at ${polarityDegrees}° polarity: ${perKg}${atMin ? ', the minimum this rate allows' : ''}.`;
}

/** Units the per-unit parts of a rate text are charged in (normalized codes); empty for an ad valorem or unreadable rate. */
export function rateUoms(rateText: string | null | undefined): string[] {
  const parsed = rateText ? parseRate(rateText) : null;
  return parsed ? Array.from(new Set(parsed.perUnit.map((c) => normalizeUom(c.unit.key)))) : [];
}

function isFree(text: string | null | undefined): boolean {
  return !!text && /^\s*free\s*$/i.test(text);
}

// ---------------------------------------------------------------------------
// Content values (issue #1796)
// ---------------------------------------------------------------------------

/** A content value the importer declares: a metal content, or the U.S.-content value. */
export type TariffContentInputKind = 'steel' | 'aluminum' | 'copper' | 'usContent';

export const CONTENT_INPUT_KINDS: TariffContentInputKind[] = ['steel', 'aluminum', 'copper', 'usContent'];

/** Plain labels for the calculator's content-value inputs. */
export const CONTENT_INPUT_LABELS: Record<TariffContentInputKind, string> = {
  steel: 'Value of the steel content (USD)',
  aluminum: 'Value of the aluminum content (USD)',
  copper: 'Value of the copper content (USD)',
  usContent: 'U.S.-content value (USD) — USMCA-qualifying vehicles/parts only',
};

/** Which declared value a content basis is charged on. */
export function contentInputKindFor(basis: TariffContentBasis): TariffContentInputKind {
  return basis === 'nonUsContent' ? 'usContent' : basis;
}

/** "the value of the steel content" / "the non-U.S. content value" (completes "charged on …"). */
const CONTENT_BASIS_PHRASES: Record<TariffContentBasis, string> = {
  steel: 'the value of the steel content',
  aluminum: 'the value of the aluminum content',
  copper: 'the value of the copper content',
  nonUsContent: 'the non-U.S. content value (customs value minus the U.S.-content value)',
};

/** What a content-based measure is charged on, e.g. "the value of the steel content"; a capped nonUsContent measure names the cap. */
function basisPhrase(m: Pick<TariffMeasureRecord, 'contentBasis' | 'usContentDeductionCapPct'>): string {
  if (!m.contentBasis) return 'the customs value';
  if (m.contentBasis === 'nonUsContent' && m.usContentDeductionCapPct !== undefined && m.usContentDeductionCapPct !== null) {
    return `the non-U.S. content value plus any U.S. content above ${m.usContentDeductionCapPct}% of the customs value`;
  }
  return CONTENT_BASIS_PHRASES[m.contentBasis];
}

/** U.S.-content input label when no USMCA-only measure asks for it (e.g. note 16(j) metals with U.S. content). */
const US_CONTENT_GENERIC_LABEL = 'U.S.-content value (USD)';

const CONTENT_INPUT_EXPLANATIONS: Record<TariffContentInputKind, string> = {
  steel: 'Section 232 duties on steel derivative products are charged only on the value of the steel content, not on the full customs value.',
  aluminum: 'Section 232 duties on aluminum derivative products are charged only on the value of the aluminum content, not on the full customs value.',
  copper: 'Section 232 duties on copper derivative products are charged only on the value of the copper content, not on the full customs value.',
  usContent:
    'For USMCA-qualifying vehicles and parts, the Section 232 duty is charged only on the non-U.S. content: the customs value minus the value of the U.S. content.',
};

/** A content value the calculator should ask for on a line, and why. */
export interface TariffContentInput {
  kind: TariffContentInputKind;
  /** Input label, e.g. "Value of the steel content (USD)". */
  label: string;
  /** One-sentence plain-language explanation. */
  explanation: string;
  /** Chapter 99 codes charged on this content value. */
  ch99Codes: string[];
  sources: TariffMeasureSource[];
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Start of the engine error for an unanswered must-answer confirmation fact (scripts match on it). */
export const FACT_ANSWER_REQUIRED = 'Answer required';

/** Start of the engine error for a missing content value (scripts match on it). */
export const CONTENT_VALUE_REQUIRED = 'Content value required';

type ContentValue = { ok: true; value: number } | { ok: false; kind: TariffContentInputKind };

/** The value a content-based measure is charged on, or which declared content value is missing. */
function contentValueFor(basis: TariffContentBasis, input: MeasureEngineInput, capPct?: number): ContentValue {
  const kind = contentInputKindFor(basis);
  const declared = input.contentValuesUsd?.[kind];
  if (declared === undefined || declared === null || !Number.isFinite(declared)) return { ok: false, kind };
  if (basis !== 'nonUsContent') return { ok: true, value: declared };
  return { ok: true, value: Math.max(0, input.customsValueUsd - usContentDeduction(declared, input.customsValueUsd, capPct)) };
}

/** The U.S.-content value deducted from the customs value: all of it, or at most `capPct`% of the customs value (note 16(j)). */
function usContentDeduction(usContent: number, customsValueUsd: number, capPct: number | undefined): number {
  return capPct === undefined || capPct === null ? usContent : Math.min(usContent, (capPct / 100) * customsValueUsd);
}

/** Error text for content values that are negative or above the customs value; null when they are all valid. */
function contentValuesError(input: MeasureEngineInput): string | null {
  for (const kind of CONTENT_INPUT_KINDS) {
    const v = input.contentValuesUsd?.[kind];
    if (v === undefined || v === null) continue;
    const what = (kind === 'usContent' ? US_CONTENT_GENERIC_LABEL : CONTENT_INPUT_LABELS[kind]).replace(/ \(USD\).*$/, '');
    if (!Number.isFinite(v) || v < 0) return `${what} must be a number of zero or more (got ${v}).`;
    if (v > input.customsValueUsd + 1e-9) return `${what} (${formatUsd(v)}) can't be more than the customs value (${formatUsd(input.customsValueUsd)}).`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Measure filters
// ---------------------------------------------------------------------------

function digits(code: string): string {
  return code.replace(/\D/g, '');
}

function coverageMatches(prefixes: string[], hts10: string): boolean {
  return prefixes.some((p) => {
    const d = digits(p);
    return d.length > 0 && hts10.startsWith(d);
  });
}

/** True when a measure's coverage includes the line (empty include = every line); ignores `coverageExclude`. */
export function measureCoversLine(m: Pick<TariffMeasureRecord, 'coverageInclude'>, hts10: string): boolean {
  return m.coverageInclude.length === 0 || coverageMatches(m.coverageInclude, hts10);
}

function countryMatches(m: TariffMeasureRecord, country: string): boolean {
  if (m.countriesInclude.length > 0 && !m.countriesInclude.includes(country)) return false;
  return !m.countriesExclude.includes(country);
}

function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

function dateReason(m: TariffMeasureRecord, entryDay: string): string | null {
  const from = isoDay(m.effectiveFrom);
  // `effectiveTo` is the last day the measure is in effect (inclusive).
  const to = m.effectiveTo ? isoDay(m.effectiveTo) : null;
  if (entryDay < from) return `Not in effect yet on ${entryDay} (starts ${from})`;
  if (to && entryDay > to) return `No longer in effect on ${entryDay} (ended ${to})`;
  return null;
}

const PRODUCT_TYPE_LABELS: Record<TariffProductType, string> = { patented: 'patented', generic: 'generic', specialty: 'specialty', other: 'other' };

/** Plain-English phrase for each end use (completes "Not confirmed: …" and the question). */
export const END_USE_LABELS: Record<TariffEndUse, string> = {
  pharmaceutical: 'for use in pharmaceutical applications',
  research: 'solely for clinical trials, research and development, or other non-commercial use',
};

/** Plain-English phrase for each company program, completing "manufacturer …". */
export const COMPANY_PROGRAM_LABELS: Record<TariffCompanyProgram, string> = {
  onshoring: 'covered by a Commerce-approved onshoring plan',
  mfnPricing: 'covered by a most-favored-nation pricing agreement with Commerce',
  annexCompany: 'named in Annex III of Proclamation 11020 (Section 232 duty from July 31, 2026)',
};

export const US_ORIGIN_INGREDIENT_LABEL = 'the active ingredient is of U.S. origin, made into dosage form abroad';

type ConditionCheck =
  | { ok: true }
  | { ok: false; reason: string }
  | { ok: false; needsProductType: TariffProductType[] }
  | { ok: false; needsFacts: string[] }
  | { ok: false; unknownFacts: string[] };

/** Registry facts by id (see confirmation-facts.ts). */
type FactRegistry = Map<string, TariffConfirmationFact>;

function factRegistry(facts: TariffConfirmationFact[]): FactRegistry {
  return new Map(facts.map((f) => [f.id, f]));
}

/** Fact ids a measure's conditions reference (factsTrue then factsFalse). */
function measureFactIds(m: TariffMeasureRecord): string[] {
  return [...(m.conditions?.factsTrue ?? []), ...(m.conditions?.factsFalse ?? [])];
}

/** The answer the engine uses for a fact: the importer's, else the registry default; undefined = must be answered and wasn't. */
function factAnswer(fact: TariffConfirmationFact, input: MeasureEngineInput): boolean | undefined {
  const answered = input.confirmations?.facts?.[fact.id];
  if (answered === true || answered === false) return answered;
  return fact.defaultWhenUnanswered === null ? undefined : fact.defaultWhenUnanswered;
}

/**
 * Registry-fact conditions (issue #1796): `factsTrue` = applies only when every fact is answered yes, `factsFalse` = only
 * when every fact is answered no. Unanswered facts take the registry default; a must-answer fact (default null) that is
 * unanswered → needsFacts; a fact id missing from the registry → unknownFacts (an engine error, never silently skipped).
 */
function factsCheck(m: TariffMeasureRecord, input: MeasureEngineInput, registry: FactRegistry): ConditionCheck {
  const c = m.conditions ?? {};
  const unknown = measureFactIds(m).filter((id) => !registry.has(id));
  if (unknown.length > 0) return { ok: false, unknownFacts: unknown };
  const needs: string[] = [];
  for (const [ids, wanted] of [
    [c.factsTrue ?? [], true],
    [c.factsFalse ?? [], false],
  ] as const) {
    for (const id of ids) {
      const fact = registry.get(id) as TariffConfirmationFact;
      const answer = factAnswer(fact, input);
      if (answer === undefined) needs.push(id);
      else if (answer !== wanted) {
        const how =
          input.confirmations?.facts?.[id] === undefined ? `not answered, so "${answer ? 'yes' : 'no'}" is assumed` : `answered "${answer ? 'yes' : 'no'}"`;
        return { ok: false, reason: `Only when the answer is "${wanted ? 'yes' : 'no'}" to: ${fact.prompt} (${how})` };
      }
    }
  }
  return needs.length > 0 ? { ok: false, needsFacts: needs } : { ok: true };
}

/**
 * `usmcaDutiable`: USMCA is claimed but the goods enter above a USMCA quota at a dutiable rate (9823.xx over-quota
 * headings). USMCA conditions then count as not met: the Canada / Mexico Section 301 reliefs cover only products
 * "entered free of duty under the United States-Mexico-Canada Agreement, including any treatment set forth in
 * subchapter XXIII of chapter 98" (U.S. notes 52(g) / 52(h) to subchapter III of chapter 99).
 */
function conditionCheck(m: TariffMeasureRecord, input: MeasureEngineInput, registry: FactRegistry, usmcaDutiable = false): ConditionCheck {
  const c = m.conditions ?? {};
  const usmcaClaimed = !!input.claimedSpi && USMCA_SPI_CODES.includes(input.claimedSpi) && !usmcaDutiable;
  if (c.usmcaQualifying === true && !usmcaClaimed) {
    return {
      ok: false,
      reason: usmcaDutiable
        ? 'Only for goods entered free of duty under USMCA (claimed above the USMCA quota at a dutiable rate)'
        : 'Only for USMCA-qualifying goods (USMCA not claimed)',
    };
  }
  if (c.usmcaQualifying === false && usmcaClaimed) return { ok: false, reason: 'Not charged on USMCA-qualifying goods (USMCA claimed)' };
  if (c.spiClaimed && c.spiClaimed.length > 0) {
    if (!input.claimedSpi || !c.spiClaimed.some((p) => samePrograms(p, input.claimedSpi as string))) {
      return { ok: false, reason: `Only when ${c.spiClaimed.join(' / ')} is claimed` };
    }
  }
  if (c.spiNotClaimed && c.spiNotClaimed.length > 0 && input.claimedSpi) {
    const claimed = input.claimedSpi;
    if (c.spiNotClaimed.includes('*')) return { ok: false, reason: `Only for goods entered at the general rate (${claimed} claimed)` };
    if (c.spiNotClaimed.some((p) => samePrograms(p, claimed))) return { ok: false, reason: `Not charged when ${claimed} is claimed` };
  }
  // Shipment facts the importer confirms (issue #1790). Checked before the product type so an
  // unconfirmed conditional measure is skipped instead of forcing a product-type question.
  const confirmed = input.confirmations ?? {};
  if (c.endUse && confirmed.endUse !== c.endUse) {
    return { ok: false, reason: `Not confirmed: ${END_USE_LABELS[c.endUse]}` };
  }
  if (c.productDescriptionIds && c.productDescriptionIds.length > 0) {
    const ids = confirmed.productDescriptionIds ?? [];
    if (!c.productDescriptionIds.some((id) => ids.includes(id))) {
      return { ok: false, reason: `Not confirmed: the product matches the description named in the note (${c.productDescriptionIds.join(', ')})` };
    }
  }
  if (c.companyProgram && confirmed.companyProgram !== c.companyProgram) {
    const chosen = confirmed.companyProgram ? ` (${COMPANY_PROGRAM_LABELS[confirmed.companyProgram]} confirmed instead)` : '';
    return { ok: false, reason: `Not confirmed: manufacturer ${COMPANY_PROGRAM_LABELS[c.companyProgram]}${chosen}` };
  }
  if (c.usOriginIngredient === true && confirmed.usOriginIngredient !== true) {
    return { ok: false, reason: `Not confirmed: ${US_ORIGIN_INGREDIENT_LABEL}` };
  }
  if (c.usOriginIngredient === false && confirmed.usOriginIngredient === true) {
    return { ok: false, reason: `Not charged when ${US_ORIGIN_INGREDIENT_LABEL} (confirmed)` };
  }
  const facts = factsCheck(m, input, registry);
  if (!facts.ok) return facts;
  if (c.productTypes && c.productTypes.length > 0) {
    if (!input.productType) return { ok: false, needsProductType: c.productTypes };
    if (!c.productTypes.includes(input.productType)) {
      return {
        ok: false,
        reason: `Only for ${c.productTypes.map((t) => PRODUCT_TYPE_LABELS[t]).join(' / ')} products (${PRODUCT_TYPE_LABELS[input.productType]} chosen)`,
      };
    }
  }
  return { ok: true };
}

/** Product types the in-scope measures for a line/country are conditioned on (drives the "Product type" choice). */
export function productTypesForLine(hts10: string, measures: TariffMeasureRecord[], country?: string): TariffProductType[] {
  const types = new Set<TariffProductType>();
  for (const m of measures) {
    if (!measureCoversLine(m, hts10) || coverageMatches(m.coverageExclude, hts10)) continue;
    if (country && !countryMatches(m, country)) continue;
    for (const t of m.conditions?.productTypes ?? []) types.add(t);
  }
  return Array.from(types);
}

/** SPI codes the in-scope extra duties for a line are conditioned on (a USMCA condition → "S"; `spiClaimed` codes). */
export function conditionProgramsForLine(hts10: string, measures: TariffMeasureRecord[]): string[] {
  const codes = new Set<string>();
  for (const m of measures) {
    if (!measureCoversLine(m, hts10) || coverageMatches(m.coverageExclude, hts10)) continue;
    if (m.conditions?.usmcaQualifying !== undefined) codes.add(USMCA_SPI_CODES[0]);
    for (const c of m.conditions?.spiClaimed ?? []) codes.add(c);
    for (const c of m.conditions?.spiNotClaimed ?? []) if (c !== '*') codes.add(c);
  }
  return Array.from(codes);
}

function measureRateText(m: TariffMeasureRecord, contentValue?: number): string {
  const pct = m.ratePct ?? 0;
  // "+50% of the value of the steel content ($40,000.00) on top of the base rate"
  const of = m.contentBasis ? `of ${basisPhrase(m)}${contentValue !== undefined ? ` (${formatUsd(contentValue)})` : ''} ` : '';
  switch (m.rateKind) {
    case 'additive':
      return `+${pct}% ${of}on top of the base rate`;
    case 'inPlaceOfBase':
      return `${pct}% ${of}in place of the base rate`;
    case 'floor':
      return `${pct}% ${of}or the base rate, whichever is higher`;
    case 'relief':
      return m.replacesCodes.length > 0 ? `No extra duty (replaces ${m.replacesCodes.join(', ')})` : 'No extra duty';
  }
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Answers to the quota facts a resolved FTA quota claim depends on: the importer's, else the registry default (a fact
 * missing from the registry counts as "no"). A must-answer fact (registry default null) left unanswered is an error.
 */
function quotaAnswers(
  resolution: QuotaResolution,
  input: MeasureEngineInput,
  registry: FactRegistry
): { ok: true; answers: QuotaAnswers } | { ok: false; error: string } {
  const answers: QuotaAnswers = {};
  const missing: string[] = [];
  for (const id of resolution.facts) {
    const fact = registry.get(id);
    const answer = fact ? factAnswer(fact, input) : input.confirmations?.facts?.[id] ?? false;
    if (answer === undefined) missing.push(fact?.prompt ?? id);
    else answers[id] = answer;
  }
  if (missing.length > 0) {
    return {
      ok: false,
      error: `${FACT_ANSWER_REQUIRED} — answer to calculate: ${missing.map((p) => `"${p}"`).join('; ')}. The trade-deal rate depends on it.`,
    };
  }
  return { ok: true, answers };
}

function fail(error: string, skipped: MeasureEngineResult['skipped'] = []): MeasureEngineResult {
  return { lines: [], totalDutyUsd: 0, skipped, error };
}

/** The engine with the bundled confirmation-facts registry (src/tariff-data/calculator/confirmation-facts.json). */
export const calculateWithMeasures: CalculateWithMeasures = (input, line, measures) =>
  calculateWithMeasuresAndFacts(input, line, measures, loadConfirmationFacts());

/** The engine with an explicit confirmation-facts registry (tests and fixtures). */
export function calculateWithMeasuresAndFacts(
  input: MeasureEngineInput,
  line: MeasureEngineLine,
  measures: TariffMeasureRecord[],
  facts: TariffConfirmationFact[]
): MeasureEngineResult {
  const registry = factRegistry(facts);
  const hts10 = digits(input.hts10);
  const entryDay = isoDay(input.entryDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDay)) return fail(`Invalid entry date: ${input.entryDate}`);
  const value = input.customsValueUsd;
  const quantities = normalizeQuantities(input.quantities);
  const contentError = contentValuesError(input);
  if (contentError) return fail(contentError);
  if (input.polarityDegrees !== undefined && !isValidPolarity(input.polarityDegrees)) {
    return fail(`Polarity must be a number of degrees above 0 and at most ${FULL_POLARITY_DEGREES} (got ${input.polarityDegrees}).`);
  }

  // 1. Base rate: column 2, a claimed special program, or general.
  let baseLabel = 'Base rate (HTS general rate)';
  let baseText: string | null = line.general;
  if (COLUMN2_COUNTRIES.includes(input.countryOfOrigin) && line.column2) {
    baseLabel = 'Base rate (HTS column 2 rate)';
    baseText = line.column2;
  }
  let baseNotes: string[] = [];
  let baseSources: TariffMeasureSource[] = [];
  // The claim as measure conditions see it: above an FTA quota with no over-quota rate the goods enter at the
  // general rate, i.e. without the preference (e.g. Nicaragua's 9903.89.01 then applies, note 29(a)).
  let conditionInput: MeasureEngineInput = input;
  let usmcaDutiable = false;
  if (input.claimedSpi) {
    const special = specialRateFor(line, input.claimedSpi);
    const info = SPECIAL_PROGRAMS[input.claimedSpi];
    const programName = info?.name ?? input.claimedSpi;
    if (special !== null && isQuotaReference(special)) {
      // "See 9822.04.01-9822.04.03 (AU)": the rate is the Chapter 98/99 FTA quota heading the shipment enters under.
      const resolved = resolveQuotaClaim(line, input.claimedSpi, special, input.countryOfOrigin, entryDay);
      if (!resolved.ok) return fail(resolved.error);
      const answers = quotaAnswers(resolved.resolution, input, registry);
      if (!answers.ok) return fail(answers.error);
      const priced = priceQuotaClaim(resolved.resolution, programName, answers.answers, input.confirmations?.facts ?? {});
      baseLabel = priced.usesGeneralRate ? `Base rate (HTS general rate; ${priced.labelSuffix})` : `Trade-deal rate (${programName}; ${priced.labelSuffix})`;
      baseText = priced.tier.rateText;
      baseNotes = priced.notes;
      baseSources = priced.sources;
      if (priced.usesGeneralRate) conditionInput = { ...input, claimedSpi: undefined };
      usmcaDutiable = USMCA_SPI_CODES.includes(input.claimedSpi) && !isFree(priced.tier.rateText);
    } else if (special !== null) {
      baseLabel = `Trade-deal rate (${programName})`;
      baseText = special;
    } else if (isFree(baseText)) {
      // The base is already Free, so the claim costs nothing on the base line (the HTS lists no
      // special programs then). It still counts as made for measure conditions — e.g. a USMCA
      // claim skips the non-USMCA extra duties.
      baseLabel = `${baseLabel}; ${programName} claimed`;
    } else {
      return fail(`This HTS line does not offer a special rate under program ${input.claimedSpi}.`);
    }
  }
  if (!baseText || !baseText.trim()) return fail(`The HTS does not state a base rate for ${hts10}.`);
  const baseRate = parseRate(baseText);
  if (!baseRate) return fail(`Can't read the base rate "${baseText}" for ${hts10}.`);

  // 2. Measures in scope (coverage + country), then applicable.
  const skipped: MeasureEngineResult['skipped'] = [];
  const applicable: TariffMeasureRecord[] = [];
  const productTypesNeeded = new Set<TariffProductType>();
  const factsNeeded = new Set<string>();
  const unknownFacts = new Set<string>();
  for (const m of measures) {
    if (!measureCoversLine(m, hts10) || !countryMatches(m, input.countryOfOrigin)) continue;
    if (coverageMatches(m.coverageExclude, hts10)) {
      skipped.push({ ch99Code: m.ch99Code, reason: 'This HTS line is excluded from the measure' });
      continue;
    }
    const dr = dateReason(m, entryDay);
    if (dr) {
      skipped.push({ ch99Code: m.ch99Code, reason: dr });
      continue;
    }
    const cond = conditionCheck(m, conditionInput, registry, usmcaDutiable);
    if (!cond.ok) {
      if ('needsProductType' in cond) cond.needsProductType.forEach((t) => productTypesNeeded.add(t));
      else if ('needsFacts' in cond) cond.needsFacts.forEach((id) => factsNeeded.add(id));
      else if ('unknownFacts' in cond) cond.unknownFacts.forEach((id) => unknownFacts.add(`${id} (${m.measureKey})`));
      else skipped.push({ ch99Code: m.ch99Code, reason: cond.reason });
      continue;
    }
    applicable.push(m);
  }
  if (unknownFacts.size > 0) {
    return fail(`Measure data error: unknown confirmation fact ${Array.from(unknownFacts).join(', ')} — not in confirmation-facts.json.`, skipped);
  }
  if (factsNeeded.size > 0) {
    const prompts = Array.from(factsNeeded).map((id) => `"${(registry.get(id) as TariffConfirmationFact).prompt}"`);
    return fail(
      `${FACT_ANSWER_REQUIRED} — answer ${prompts.length > 1 ? 'these questions' : 'this question'} to calculate: ${prompts.join(
        '; '
      )}. An extra duty on this line depends on it.`,
      skipped
    );
  }
  if (productTypesNeeded.size > 0) {
    return fail(
      `Choose a product type: an extra duty on this line depends on whether the product is ${Array.from(productTypesNeeded)
        .map((t) => PRODUCT_TYPE_LABELS[t])
        .join(' or ')}.`,
      skipped
    );
  }

  // 3. replacesCodes — relief measures walk first; a dropped measure can't drop others.
  const removedCodes = new Map<string, string>(); // ch99Code -> replaced by
  const walk = [...applicable.filter((m) => m.rateKind === 'relief'), ...applicable.filter((m) => m.rateKind !== 'relief')];
  for (const m of walk) {
    if (removedCodes.has(m.ch99Code)) continue;
    for (const code of m.replacesCodes) if (code !== m.ch99Code && !removedCodes.has(code)) removedCodes.set(code, m.ch99Code);
  }
  const charged: TariffMeasureRecord[] = [];
  for (const m of applicable) {
    const by = removedCodes.get(m.ch99Code);
    if (by) skipped.push({ ch99Code: m.ch99Code, reason: `Replaced by ${by}` });
    else charged.push(m);
  }

  // 4. Price the base and each measure.
  const missingUoms = new Set<string>();
  const basePriced = priceRate(baseRate, value, quantities, input.polarityDegrees);
  const baseLineNote = polarityNote(baseRate, input.polarityDegrees);
  if (baseLineNote) baseNotes = [...baseNotes, baseLineNote];
  if (!basePriced.ok) basePriced.missingUoms.forEach((u) => missingUoms.add(u));
  if (missingUoms.size > 0) {
    const uoms = Array.from(missingUoms);
    return fail(
      `Quantity required: the base rate "${baseText}" is charged per unit. Enter the shipment quantity in ${uoms.map(describeUom).join(' and ')}.`,
      skipped
    );
  }
  const baseAmount = basePriced.ok ? basePriced.amount : 0;

  // Content-based measures (issue #1796): the value each one is charged on; a missing declared value is an error.
  const chargedOn = new Map<TariffMeasureRecord, number>();
  const missingKinds = new Set<TariffContentInputKind>();
  const missingParts: string[] = [];
  for (const m of charged) {
    if (!m.contentBasis || m.rateKind === 'relief') continue;
    const cv = contentValueFor(m.contentBasis, input, m.usContentDeductionCapPct);
    if (cv.ok) chargedOn.set(m, cv.value);
    else {
      missingKinds.add(cv.kind);
      missingParts.push(`${m.ch99Code} (${m.program}) is charged on ${basisPhrase(m)}`);
    }
  }
  if (missingKinds.size > 0) {
    const asks = Array.from(missingKinds).map(
      (k) => `the ${(k === 'usContent' ? US_CONTENT_GENERIC_LABEL : CONTENT_INPUT_LABELS[k]).replace(/^Value/, 'value')}`
    );
    return fail(`${CONTENT_VALUE_REQUIRED}: ${missingParts.join('; ')}. Enter ${asks.join(' and ')}.`, skipped);
  }

  const baseReplacedBy = charged.filter((m) => m.rateKind === 'inPlaceOfBase' || m.rateKind === 'floor').map((m) => m.ch99Code);
  const lines: MeasureEngineDutyLine[] = [
    {
      code: 'base',
      label: baseLabel,
      rateText: baseReplacedBy.length > 0 && !isFree(baseText) ? `${baseText} (not charged: replaced by ${baseReplacedBy.join(', ')})` : baseText,
      amountUsd: baseReplacedBy.length > 0 ? 0 : round2(baseAmount),
      sources: baseSources,
      ...(baseNotes.length > 0 ? { notes: baseNotes } : {}),
    },
  ];
  for (const m of charged) {
    const contentValue = chargedOn.get(m);
    const pctAmount = ((m.ratePct ?? 0) / 100) * (contentValue ?? value);
    let amount = 0;
    if (m.rateKind === 'additive' || m.rateKind === 'inPlaceOfBase') amount = pctAmount;
    else if (m.rateKind === 'floor') amount = Math.max(baseAmount, pctAmount);
    if (m.rateKind !== 'relief' && (m.ratePct === null || !Number.isFinite(m.ratePct)))
      return fail(`Measure ${m.measureKey} (${m.ch99Code}) has no rate.`, skipped);
    lines.push({ code: m.ch99Code, label: m.program, rateText: measureRateText(m, contentValue), amountUsd: round2(amount), sources: m.sources });
  }

  const totalDutyUsd = round2(lines.reduce((sum, l) => sum + l.amountUsd, 0));
  return { lines, totalDutyUsd, skipped };
}

/** Per-unit quantities one rate text needs, as normalized unit codes with the rate text that needs them; empty for an ad valorem rate. */
export function rateQuantityRequirements(rateText: string | null | undefined): { uom: string; rateDescription: string }[] {
  return rateUoms(rateText).map((uom) => ({ uom, rateDescription: rateText as string }));
}

// ---------------------------------------------------------------------------
// Confirmation questions (issue #1790)
// ---------------------------------------------------------------------------

const QUESTION_CAVEATS: Record<TariffConfirmationQuestion['kind'], string> = {
  endUse:
    'Answer yes only if the importer can support the end-use claim to CBP (for example, with an end-use certificate or records showing how the goods are used).',
  productDescription: 'The goods must match the description in the Chapter 99 note exactly; CBP can ask for product specifications to support the claim.',
  companyProgram: 'Self-declared here: CBP requires proof that the manufacturer is covered (for example, the Commerce approval or agreement) at entry.',
  usOriginIngredient: 'Answer yes only if the importer can document the U.S. origin of the active ingredient to CBP.',
  fact: 'Answer only what the importer can support to CBP with records.',
};

function questionPrompt(kind: 'endUse' | 'companyProgram', value: string): string {
  if (kind === 'endUse') {
    switch (value as TariffEndUse) {
      case 'pharmaceutical':
        return 'Will these goods be used in pharmaceutical applications?';
      case 'research':
        return 'Are these goods solely for clinical trials, research and development, or other non-commercial use?';
      default:
        return `Will these goods be used for ${value}?`;
    }
  }
  switch (value as TariffCompanyProgram) {
    case 'onshoring':
      return 'Is the manufacturer covered by a Commerce-approved onshoring plan?';
    case 'mfnPricing':
      return 'Is the manufacturer covered by a most-favored-nation pricing agreement with Commerce?';
    case 'annexCompany':
      return 'Is the manufacturer named in Annex II/III of Proclamation 11020?';
    default:
      return `Is the manufacturer covered by the "${value}" company program?`;
  }
}

/** "the 12.5% Section 301 duty (9903.05.89)" — or just the code when the measure has no rate. */
function describeCharge(m: TariffMeasureRecord): string {
  return m.ratePct !== null && m.rateKind !== 'relief' ? `the ${m.ratePct}% ${m.program} duty (${m.ch99Code})` : `${m.program} (${m.ch99Code})`;
}

/**
 * What confirming `m` changes for the line, from what it replaces (among `inScope`) and its own
 * rate. Null when it would change nothing: a relief whose replaced duties don't apply here.
 */
function questionEffect(m: TariffMeasureRecord, inScope: TariffMeasureRecord[]): string | null {
  const replaced = inScope.filter((o) => o !== m && m.replacesCodes.includes(o.ch99Code) && o.rateKind !== 'relief');
  const replacedText = Array.from(new Set(replaced.map(describeCharge))).join(' and ');
  const pct = m.ratePct ?? 0;
  const of = m.contentBasis ? ` of ${basisPhrase(m)}` : '';
  switch (m.rateKind) {
    case 'relief':
      return replaced.length > 0 ? `Removes ${replacedText}.` : null;
    case 'additive':
      return `Charged ${pct}%${of} on top of the base rate (${m.ch99Code})${replaced.length > 0 ? ` instead of ${replacedText}` : ''}.`;
    case 'inPlaceOfBase':
      return `Charged ${pct}%${of} in place of the base rate (${m.ch99Code})${replaced.length > 0 ? ` instead of ${replacedText}` : ''}.`;
    case 'floor':
      return `Charged ${pct}%${of} or the base rate, whichever is higher (${m.ch99Code})${replaced.length > 0 ? `, instead of ${replacedText}` : ''}.`;
  }
}

interface QuestionDraft {
  question: Omit<TariffConfirmationQuestion, 'effect' | 'sources'>;
  effects: string[];
  sources: TariffMeasureSource[];
}

const KIND_ORDER: TariffConfirmationQuestion['kind'][] = ['fact', 'endUse', 'usOriginIngredient', 'companyProgram', 'productDescription'];

/** What answering "yes" does to a measure that applies only when a fact is answered "no": it stops applying. */
function factsFalseEffect(m: TariffMeasureRecord, inScope: TariffMeasureRecord[]): string | null {
  if (m.rateKind !== 'relief') return `Not charged: ${describeCharge(m)}.`;
  const replaced = inScope.filter((o) => o !== m && m.replacesCodes.includes(o.ch99Code) && o.rateKind !== 'relief');
  return replaced.length > 0
    ? `${m.program} (${m.ch99Code}) no longer applies, so ${Array.from(new Set(replaced.map(describeCharge))).join(' and ')} can apply.`
    : null;
}

/**
 * The confirmation questions that matter for a line from one country on one date: one per end
 * use / company program / named product / registry fact that a measure in scope (coverage, country,
 * in effect) is conditioned on, and only when confirming it changes the duty — except must-answer
 * facts (registry default null), which are always asked because the engine can't price without them.
 * `productDescriptions` supplies the note text for named products (descriptions whose `codePrefix`
 * doesn't match the line are left out); a description id it doesn't list is asked about by id.
 * `facts` is the confirmation-facts registry (defaults to the bundled one). Pure, like the engine.
 */
export function confirmationQuestionsForLine(
  line: { hts10: string; countryOfOrigin: string; entryDate: string },
  measures: TariffMeasureRecord[],
  productDescriptions: TariffProductDescription[] = [],
  facts: TariffConfirmationFact[] = loadConfirmationFacts()
): TariffConfirmationQuestion[] {
  const registry = factRegistry(facts);
  const hts10 = digits(line.hts10);
  const entryDay = isoDay(line.entryDate);
  const inScope = measures.filter(
    (m) =>
      measureCoversLine(m, hts10) && !coverageMatches(m.coverageExclude, hts10) && countryMatches(m, line.countryOfOrigin) && dateReason(m, entryDay) === null
  );
  const descriptions = new Map(productDescriptions.map((d) => [d.id, d]));
  const drafts = new Map<string, QuestionDraft>();
  const add = (question: QuestionDraft['question'], effect: string, sources: TariffMeasureSource[]) => {
    const key = `${question.kind}|${question.value}`;
    const draft = drafts.get(key) ?? { question, effects: [], sources: [] };
    if (!draft.effects.includes(effect)) draft.effects.push(effect);
    for (const s of sources) if (!draft.sources.some((x) => x.url === s.url)) draft.sources.push(s);
    drafts.set(key, draft);
  };

  // Registry facts (issue #1796): a "yes" effect per measure (factsTrue → the measure applies; factsFalse → it stops applying).
  const addFact = (id: string, effect: string | null, m: TariffMeasureRecord) => {
    const fact = registry.get(id);
    const mustAnswer = fact ? fact.defaultWhenUnanswered === null : false;
    if (!effect && !mustAnswer) return;
    const question: QuestionDraft['question'] = {
      kind: 'fact',
      value: id,
      prompt: fact?.prompt ?? `Does this apply to your goods: ${id}?`,
      caveat: fact?.help ?? QUESTION_CAVEATS.fact,
      ...(mustAnswer ? { mustAnswer: true } : {}),
      ...(fact && fact.defaultWhenUnanswered !== null ? { defaultAnswer: fact.defaultWhenUnanswered } : {}),
    };
    add(question, effect ?? `Changes which extra duties apply (${m.ch99Code}).`, [...(fact?.sources ?? []), ...m.sources]);
  };

  for (const m of inScope) {
    const c = m.conditions ?? {};
    for (const id of c.factsFalse ?? []) addFact(id, factsFalseEffect(m, inScope), m);
    for (const id of c.factsTrue ?? []) addFact(id, questionEffect(m, inScope), m);
    if (!c.endUse && !c.companyProgram && c.usOriginIngredient !== true && !(c.productDescriptionIds && c.productDescriptionIds.length > 0)) continue;
    const effect = questionEffect(m, inScope);
    if (!effect) continue;
    if (c.endUse) add({ kind: 'endUse', value: c.endUse, prompt: questionPrompt('endUse', c.endUse), caveat: QUESTION_CAVEATS.endUse }, effect, m.sources);
    if (c.companyProgram) {
      add(
        {
          kind: 'companyProgram',
          value: c.companyProgram,
          prompt: questionPrompt('companyProgram', c.companyProgram),
          caveat: QUESTION_CAVEATS.companyProgram,
        },
        effect,
        m.sources
      );
    }
    if (c.usOriginIngredient === true) {
      add(
        {
          kind: 'usOriginIngredient',
          value: 'true',
          prompt: 'Is the active ingredient of U.S. origin, made into dosage form abroad?',
          caveat: QUESTION_CAVEATS.usOriginIngredient,
        },
        effect,
        m.sources
      );
    }
    for (const id of c.productDescriptionIds ?? []) {
      const d = descriptions.get(id);
      if (d && !hts10.startsWith(digits(d.codePrefix))) continue;
      const prompt = d
        ? `Does your product match: “${d.description}”?`
        : `Does your product match the product the Chapter 99 notes describe for this line (${id})?`;
      add({ kind: 'productDescription', value: id, prompt, caveat: QUESTION_CAVEATS.productDescription }, effect, m.sources);
    }
  }

  return Array.from(drafts.values())
    .map((d) => ({ ...d.question, effect: d.effects.join(' '), sources: d.sources }))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
}

// ---------------------------------------------------------------------------
// FTA quota questions
// ---------------------------------------------------------------------------

/**
 * Questions for the FTA quota claims a line offers a country ("See 9822.04.01-9822.04.03 (AU)"): whether the shipment
 * is within the in-quota quantity, an additional quota, or under a safeguard — one per registry fact that changes the
 * claim's rate. The effect says it only matters with the claim. Pure, like the engine.
 */
export function quotaQuestionsForLine(
  line: Pick<MeasureEngineLine, 'hts10' | 'special' | 'general'>,
  country: string,
  facts: TariffConfirmationFact[] = loadConfirmationFacts()
): TariffConfirmationQuestion[] {
  const registry = factRegistry(facts);
  const out = new Map<string, TariffConfirmationQuestion>();
  for (const entry of parseSpecialRates(line.special)) {
    if (!isQuotaReference(entry.rateText)) continue;
    for (const code of entry.programs) {
      const info = SPECIAL_PROGRAMS[code];
      if (info?.lapsed || (info?.countries && !info.countries.includes(country))) continue;
      const res = resolveQuotaClaim(line, code, entry.rateText, country);
      if (!res.ok) continue;
      const programName = info?.name ?? code;
      for (const id of res.resolution.facts) {
        const fact = registry.get(id);
        const effect = `Only with the ${programName} claim. ${quotaQuestionEffect(id, res.resolution)}`;
        const existing = out.get(id);
        if (existing) {
          if (!existing.effect.includes(effect)) existing.effect = `${existing.effect} ${effect}`;
          continue;
        }
        const sources = priceQuotaClaim(res.resolution, programName, {}, {}).sources;
        out.set(id, {
          kind: 'fact',
          value: id,
          prompt: quotaQuestionPrompt(id, res.resolution, programName),
          effect,
          caveat: fact?.help ?? QUESTION_CAVEATS.fact,
          ...(fact && fact.defaultWhenUnanswered !== null ? { defaultAnswer: fact.defaultWhenUnanswered } : { mustAnswer: true }),
          sources: [...sources, ...(fact?.sources ?? []).filter((s) => !sources.some((x) => x.url === s.url))],
        });
      }
    }
  }
  return Array.from(out.values());
}

// ---------------------------------------------------------------------------
// Content-value inputs (issue #1796)
// ---------------------------------------------------------------------------

/**
 * The content values the calculator should ask for on a line from one country on one date: one per content kind that a
 * content-based measure in scope (coverage, not excluded, country — when given — and in effect) is charged on. The
 * measure's other conditions (e.g. USMCA-qualifying) are not checked here, so the input is offered before the claim is
 * made; its label says when it matters. Pure, like the engine.
 */
export function contentInputsForLine(
  line: { hts10: string; countryOfOrigin?: string | null; entryDate: string },
  measures: TariffMeasureRecord[]
): TariffContentInput[] {
  const hts10 = digits(line.hts10);
  const entryDay = isoDay(line.entryDate);
  const byKind = new Map<TariffContentInputKind, TariffContentInput>();
  const measuresByKind = new Map<TariffContentInputKind, TariffMeasureRecord[]>();
  for (const m of measures) {
    if (!m.contentBasis || m.rateKind === 'relief') continue;
    if (!measureCoversLine(m, hts10) || coverageMatches(m.coverageExclude, hts10) || dateReason(m, entryDay) !== null) continue;
    if (line.countryOfOrigin && !countryMatches(m, line.countryOfOrigin)) continue;
    const kind = contentInputKindFor(m.contentBasis);
    const entry = byKind.get(kind) ?? { kind, label: CONTENT_INPUT_LABELS[kind], explanation: '', ch99Codes: [], sources: [] };
    if (!entry.ch99Codes.includes(m.ch99Code)) entry.ch99Codes.push(m.ch99Code);
    for (const s of m.sources) if (!entry.sources.some((x) => x.url === s.url)) entry.sources.push(s);
    byKind.set(kind, entry);
    measuresByKind.set(kind, [...(measuresByKind.get(kind) ?? []), m]);
  }
  for (const [kind, entry] of Array.from(byKind)) {
    if (kind !== 'usContent') {
      entry.explanation = CONTENT_INPUT_EXPLANATIONS[kind];
      continue;
    }
    // U.S. content: the USMCA autos/parts wording when USMCA-only measures ask for it; capped measures (note 16(j)) say their cap.
    const ms = measuresByKind.get(kind) ?? [];
    const usmcaOnly = ms.filter((m) => m.conditions?.usmcaQualifying === true);
    const others = ms.filter((m) => m.conditions?.usmcaQualifying !== true);
    if (others.length > 0) entry.label = US_CONTENT_GENERIC_LABEL;
    const sentences: string[] = [];
    if (usmcaOnly.length > 0) sentences.push(CONTENT_INPUT_EXPLANATIONS.usContent);
    const phrases = new Map<string, string[]>();
    for (const m of others) phrases.set(basisPhrase(m), [...(phrases.get(basisPhrase(m)) ?? []), m.ch99Code]);
    for (const [phrase, codes] of Array.from(phrases)) sentences.push(`${Array.from(new Set(codes)).join(', ')}: the duty is charged on ${phrase}.`);
    entry.explanation = sentences.join(' ');
  }
  return CONTENT_INPUT_KINDS.filter((k) => byKind.has(k)).map((k) => byKind.get(k) as TariffContentInput);
}

// ---------------------------------------------------------------------------
// Import bans (issue #1796)
// ---------------------------------------------------------------------------

/** Plain note for a duty shown on a line that is banned: it only applies to goods imported before the ban. */
export function importBanDutyNote(p: TariffImportProhibition): string {
  return `The duty shown applies only to goods imported before ${p.effectiveFrom} and entered later; goods imported on or after that date can't be imported.`;
}

/**
 * The import ban that matches a shipment (line, country, date, fact answers), or null. A ban's fact conditions use the
 * registry like measures do (unanswered = the fact's default). When a must-answer fact is unanswered the ban is returned
 * with `unconfirmed`, so the calculator can say "prohibited if …" instead of guessing. A fact id missing from the registry
 * counts as must-answer (never silently not banned). Pure, like the engine.
 */
export function importProhibitionFor(
  shipment: { hts10: string; countryOfOrigin: string; entryDate: string; confirmations?: TariffShipmentConfirmations },
  bans: TariffImportBan[] = loadImportBans(),
  facts: TariffConfirmationFact[] = loadConfirmationFacts()
): TariffImportProhibition | null {
  const hts10 = digits(shipment.hts10);
  const day = isoDay(shipment.entryDate);
  const registry = factRegistry(facts);
  let unconfirmedMatch: TariffImportProhibition | null = null;
  for (const b of bans) {
    if (!b.countries.includes(shipment.countryOfOrigin) || !coverageMatches(b.coveragePrefixes, hts10)) continue;
    if (day < b.effectiveFrom || (b.effectiveTo && day > b.effectiveTo)) continue;
    const unconfirmed: NonNullable<TariffImportProhibition['unconfirmed']> = [];
    let excluded = false;
    for (const [ids, wanted] of [
      [b.conditions?.factsTrue ?? [], true],
      [b.conditions?.factsFalse ?? [], false],
    ] as const) {
      for (const id of ids) {
        const fact = registry.get(id);
        const answered = shipment.confirmations?.facts?.[id];
        const answer = answered === true || answered === false ? answered : fact?.defaultWhenUnanswered ?? undefined;
        if (answer === undefined || answer === null) unconfirmed.push({ factId: id, prompt: fact?.prompt ?? id, bannedWhen: wanted });
        else if (answer !== wanted) excluded = true;
      }
    }
    if (excluded) continue;
    const prohibition: TariffImportProhibition = { banId: b.id, reason: b.description, sources: b.sources, effectiveFrom: b.effectiveFrom };
    if (unconfirmed.length === 0) return prohibition;
    unconfirmedMatch = unconfirmedMatch ?? { ...prohibition, unconfirmed };
  }
  return unconfirmedMatch;
}

/** "Is the alcohol packaged …?" questions for the facts the import bans matching a line/country/date depend on. */
export function importBanQuestionsForLine(
  line: { hts10: string; countryOfOrigin: string; entryDate: string },
  bans: TariffImportBan[] = loadImportBans(),
  facts: TariffConfirmationFact[] = loadConfirmationFacts()
): TariffConfirmationQuestion[] {
  const hts10 = digits(line.hts10);
  const day = isoDay(line.entryDate);
  const registry = factRegistry(facts);
  const out = new Map<string, TariffConfirmationQuestion>();
  for (const b of bans) {
    if (!b.countries.includes(line.countryOfOrigin) || !coverageMatches(b.coveragePrefixes, hts10)) continue;
    if (day < b.effectiveFrom || (b.effectiveTo && day > b.effectiveTo)) continue;
    for (const [ids, wanted] of [
      [b.conditions?.factsTrue ?? [], true],
      [b.conditions?.factsFalse ?? [], false],
    ] as const) {
      for (const id of ids) {
        const fact = registry.get(id);
        const effect = wanted ? `Import prohibited: ${b.description}` : `Not covered by the import ban (${b.id}).`;
        const existing = out.get(id);
        if (existing) {
          if (!existing.effect.includes(effect)) existing.effect = `${existing.effect} ${effect}`;
          continue;
        }
        out.set(id, {
          kind: 'fact',
          value: id,
          prompt: fact?.prompt ?? `Does this apply to your goods: ${id}?`,
          effect,
          ...(fact?.help ? { caveat: fact.help } : {}),
          ...(!fact || fact.defaultWhenUnanswered === null ? { mustAnswer: true } : { defaultAnswer: fact.defaultWhenUnanswered }),
          sources: [...(fact?.sources ?? []), ...b.sources.filter((s) => !(fact?.sources ?? []).some((x) => x.url === s.url))],
        });
      }
    }
  }
  return Array.from(out.values());
}
