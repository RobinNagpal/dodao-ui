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
// In-scope measures that are not charged are returned in `skipped` with the reason.
// A per-unit rate without a quantity for its unit, an unreadable rate, or a claim the
// line does not offer is an `error` — never a silent $0.
//
// Rate text is parsed by the shared parser in src/utils/tariff-reports/shipment-duty.ts.
// Pure (no DB, no Date.now) so the golden-scenario tests run it directly.

import type {
  CalculateWithMeasures,
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
import { parseRate, type ParsedRate } from '@/utils/tariff-reports/shipment-duty';

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
];

/** Normalizes a unit spelling ("No.", "kg", "liters", "doz.", "PFL", "count") to the calculator's unit code ("NO", "KG", "L", "DOZ", "PF.L"). Unknown units are upper-cased. */
export function normalizeUom(raw: string): string {
  const lower = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const alias = UOM_ALIASES.find((a) => a.pattern.test(lower));
  return alias ? alias.uom : raw.trim().toUpperCase();
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
  /** Rate the line gives this program, e.g. "Free". */
  rateText: string;
  /** Empty = any country. */
  countries: string[];
}

/**
 * Programs a line's special column offers that an importer can claim today (lapsed programs left
 * out), one per program code. On a line whose general rate is already Free, `conditionPrograms`
 * (programs the line's extra duties depend on, see `conditionProgramsForLine`) are offered too,
 * at "Free": the claim changes no base rate but does change which extra duties apply.
 */
export function claimablePrograms(line: Pick<MeasureEngineLine, 'special' | 'general'>, conditionPrograms: string[] = []): ClaimableProgram[] {
  const out: ClaimableProgram[] = [];
  const seen = new Set<string>();
  if (isFree(line.general)) {
    for (const code of conditionPrograms) {
      const info = SPECIAL_PROGRAMS[code];
      if (seen.has(code) || info?.lapsed || specialRateFor(line, code) !== null) continue;
      seen.add(code);
      out.push({ code, name: info?.name ?? `Program ${code}`, rateText: 'Free', countries: info?.countries ?? [] });
    }
  }
  for (const entry of parseSpecialRates(line.special)) {
    for (const code of entry.programs) {
      const info = SPECIAL_PROGRAMS[code];
      // Lapsed programs and rates the parser can't price ("See 9823.xx") are not offered.
      if (seen.has(code) || info?.lapsed || !parseRate(entry.rateText)) continue;
      seen.add(code);
      out.push({ code, name: info?.name ?? `Program ${code}`, rateText: entry.rateText, countries: info?.countries ?? [] });
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

function priceRate(rate: ParsedRate, valueUsd: number, quantities: Record<string, number>): Priced {
  let amount = (rate.adValoremPct / 100) * valueUsd;
  const missing: string[] = [];
  for (const charge of rate.perUnit) {
    const uom = normalizeUom(charge.unit.key);
    const qty = quantities[uom];
    if (qty === undefined || !Number.isFinite(qty) || qty < 0) missing.push(uom);
    else amount += charge.amountUsd * qty;
  }
  return missing.length > 0 ? { ok: false, missingUoms: Array.from(new Set(missing)) } : { ok: true, amount };
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

type ConditionCheck = { ok: true } | { ok: false; reason: string } | { ok: false; needsProductType: TariffProductType[] };

function conditionCheck(m: TariffMeasureRecord, input: MeasureEngineInput): ConditionCheck {
  const c = m.conditions ?? {};
  const usmcaClaimed = !!input.claimedSpi && USMCA_SPI_CODES.includes(input.claimedSpi);
  if (c.usmcaQualifying === true && !usmcaClaimed) return { ok: false, reason: 'Only for USMCA-qualifying goods (USMCA not claimed)' };
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

function measureRateText(m: TariffMeasureRecord): string {
  const pct = m.ratePct ?? 0;
  switch (m.rateKind) {
    case 'additive':
      return `+${pct}% on top of the base rate`;
    case 'inPlaceOfBase':
      return `${pct}% in place of the base rate`;
    case 'floor':
      return `${pct}% or the base rate, whichever is higher`;
    case 'relief':
      return m.replacesCodes.length > 0 ? `No extra duty (replaces ${m.replacesCodes.join(', ')})` : 'No extra duty';
  }
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

function fail(error: string, skipped: MeasureEngineResult['skipped'] = []): MeasureEngineResult {
  return { lines: [], totalDutyUsd: 0, skipped, error };
}

export const calculateWithMeasures: CalculateWithMeasures = (input, line, measures) => {
  const hts10 = digits(input.hts10);
  const entryDay = isoDay(input.entryDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDay)) return fail(`Invalid entry date: ${input.entryDate}`);
  const value = input.customsValueUsd;
  const quantities = normalizeQuantities(input.quantities);

  // 1. Base rate: column 2, a claimed special program, or general.
  let baseLabel = 'Base rate (HTS general rate)';
  let baseText: string | null = line.general;
  if (COLUMN2_COUNTRIES.includes(input.countryOfOrigin) && line.column2) {
    baseLabel = 'Base rate (HTS column 2 rate)';
    baseText = line.column2;
  }
  if (input.claimedSpi) {
    const special = specialRateFor(line, input.claimedSpi);
    const info = SPECIAL_PROGRAMS[input.claimedSpi];
    const programName = info?.name ?? input.claimedSpi;
    if (special !== null) {
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
    const cond = conditionCheck(m, input);
    if (!cond.ok) {
      if ('needsProductType' in cond) cond.needsProductType.forEach((t) => productTypesNeeded.add(t));
      else skipped.push({ ch99Code: m.ch99Code, reason: cond.reason });
      continue;
    }
    applicable.push(m);
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
  const basePriced = priceRate(baseRate, value, quantities);
  if (!basePriced.ok) basePriced.missingUoms.forEach((u) => missingUoms.add(u));
  if (missingUoms.size > 0) {
    const uoms = Array.from(missingUoms);
    return fail(`Quantity required: the base rate "${baseText}" is charged per unit. Enter the shipment quantity in ${uoms.join(' and ')}.`, skipped);
  }
  const baseAmount = basePriced.ok ? basePriced.amount : 0;

  const baseReplacedBy = charged.filter((m) => m.rateKind === 'inPlaceOfBase' || m.rateKind === 'floor').map((m) => m.ch99Code);
  const lines: MeasureEngineDutyLine[] = [
    {
      code: 'base',
      label: baseLabel,
      rateText: baseReplacedBy.length > 0 && !isFree(baseText) ? `${baseText} (not charged: replaced by ${baseReplacedBy.join(', ')})` : baseText,
      amountUsd: baseReplacedBy.length > 0 ? 0 : round2(baseAmount),
      sources: [],
    },
  ];
  for (const m of charged) {
    const pctAmount = ((m.ratePct ?? 0) / 100) * value;
    let amount = 0;
    if (m.rateKind === 'additive' || m.rateKind === 'inPlaceOfBase') amount = pctAmount;
    else if (m.rateKind === 'floor') amount = Math.max(baseAmount, pctAmount);
    if (m.rateKind !== 'relief' && (m.ratePct === null || !Number.isFinite(m.ratePct)))
      return fail(`Measure ${m.measureKey} (${m.ch99Code}) has no rate.`, skipped);
    lines.push({ code: m.ch99Code, label: m.program, rateText: measureRateText(m), amountUsd: round2(amount), sources: m.sources });
  }

  const totalDutyUsd = round2(lines.reduce((sum, l) => sum + l.amountUsd, 0));
  return { lines, totalDutyUsd, skipped };
};

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
  switch (m.rateKind) {
    case 'relief':
      return replaced.length > 0 ? `Removes ${replacedText}.` : null;
    case 'additive':
      return `Charged ${pct}% on top of the base rate (${m.ch99Code})${replaced.length > 0 ? ` instead of ${replacedText}` : ''}.`;
    case 'inPlaceOfBase':
      return `Charged ${pct}% in place of the base rate (${m.ch99Code})${replaced.length > 0 ? ` instead of ${replacedText}` : ''}.`;
    case 'floor':
      return `Charged ${pct}% or the base rate, whichever is higher (${m.ch99Code})${replaced.length > 0 ? `, instead of ${replacedText}` : ''}.`;
  }
}

interface QuestionDraft {
  question: Omit<TariffConfirmationQuestion, 'effect' | 'sources'>;
  effects: string[];
  sources: TariffMeasureSource[];
}

const KIND_ORDER: TariffConfirmationQuestion['kind'][] = ['endUse', 'usOriginIngredient', 'companyProgram', 'productDescription'];

/**
 * The confirmation questions that matter for a line from one country on one date: one per end
 * use / company program / named product that a measure in scope (coverage, country, in effect)
 * is conditioned on, and only when confirming it changes the duty. `productDescriptions` supplies
 * the note text for named products (descriptions whose `codePrefix` doesn't match the line are
 * left out); a description id it doesn't list is asked about by id. Pure, like the engine.
 */
export function confirmationQuestionsForLine(
  line: { hts10: string; countryOfOrigin: string; entryDate: string },
  measures: TariffMeasureRecord[],
  productDescriptions: TariffProductDescription[] = []
): TariffConfirmationQuestion[] {
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

  for (const m of inScope) {
    const c = m.conditions ?? {};
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
