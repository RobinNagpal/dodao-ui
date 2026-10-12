import type { TariffRateTableRow } from '@/types/tariff-chapter-prototype';
import type { MeasureEngineInput, MeasureEngineResult, TariffMeasureRecord, TariffProductType } from '@/types/tariff-calculator-measures';
import { loadConfirmationFacts } from '@/utils/tariff-calculator/confirmation-facts';
import {
  calculateWithMeasures,
  COLUMN2_COUNTRIES,
  CONTENT_VALUE_REQUIRED,
  importProhibitionFor,
  measureCoversLine,
  normalizeUom,
  productTypesForLine,
  rateUoms,
  SPECIAL_PROGRAMS,
  specialRateFor,
  USMCA_SPI_CODES,
} from '@/utils/tariff-calculator/measures-engine';
import { parseRate, quantityUnits, rateDollars } from '@/utils/tariff-reports/shipment-duty';
import { engineLine } from './rate-table';

// Runs one HTS line from one country through the official-measures engine (the same function the live
// calculator uses) and turns the result into the rate strings the "Rates by country" matrix shows:
// base / extra / preference / total, e.g. base "1¢/kg", extra "+10%", total "1¢/kg + 10%".
//
// Pricing basis = the validator's --check-calculator basis: $10,000 customs value and 1,000 of every
// quantity unit, so the total string can be re-priced and compared with the engine's dollars.

export const NOMINAL_VALUE_USD = 10_000;
export const NOMINAL_QUANTITY = 1_000;
const DEFAULT_UOMS = ['NO', 'KG', 'G', 'T', 'L', 'PF.L', 'CKG', 'DOZ', 'DPR', 'PRS', 'GROSS', 'M', 'M2', 'M3', 'THS', 'BBL'];
const PRODUCT_TYPE_ORDER: TariffProductType[] = ['generic', 'other', 'specialty', 'patented'];
const MAX_FACT_COMBOS = 3;

function digits(code: string): string {
  return code.replace(/\D/g, '');
}

function prefixMatch(prefixes: string[], hts10: string): boolean {
  return prefixes.some((p) => {
    const d = digits(p);
    return d.length > 0 && hts10.startsWith(d);
  });
}

export function inEffectOn(m: Pick<TariffMeasureRecord, 'effectiveFrom' | 'effectiveTo'>, day: string): boolean {
  return m.effectiveFrom.slice(0, 10) <= day && (!m.effectiveTo || day <= m.effectiveTo.slice(0, 10));
}

/** True when the measure reaches the line: in its coverage and not excluded. */
/**
 * True when a charging measure still reaches the line after unconditional relief headings: a relief in effect on
 * `day` that replaces the measure's code, reaches the line, has no conditions and covers all the measure's countries
 * (e.g. note 52(b) / 9903.05.86 exempting every Chapter 31 line from the 2026 Section 301 duties).
 */
export function measureChargesLine(m: TariffMeasureRecord, hts10: string, all: TariffMeasureRecord[], day: string): boolean {
  if (!measureReachesLine(m, hts10)) return false;
  const coversCountries = (r: TariffMeasureRecord): boolean =>
    r.countriesInclude.length === 0 || (m.countriesInclude.length > 0 && m.countriesInclude.every((c) => r.countriesInclude.includes(c)));
  return !all.some(
    (r) =>
      r.rateKind === 'relief' &&
      inEffectOn(r, day) &&
      r.replacesCodes.includes(m.ch99Code) &&
      Object.keys(r.conditions ?? {}).length === 0 &&
      r.countriesExclude.length === 0 &&
      coversCountries(r) &&
      measureReachesLine(r, hts10)
  );
}

export function measureReachesLine(m: TariffMeasureRecord, hts10: string): boolean {
  return measureCoversLine(m, hts10) && !prefixMatch(m.coverageExclude, hts10);
}

export function countryInScope(m: TariffMeasureRecord, iso: string): boolean {
  if (m.countriesInclude.length > 0 && !m.countriesInclude.includes(iso)) return false;
  return !m.countriesExclude.includes(iso);
}

/** "Section 301 (2026, 60 economies)" → "Section 301". */
export function programShort(program: string): string {
  return program.replace(/\s*\(.*\)\s*$/, '').trim();
}

export function fmtPct(pct: number): string {
  return `${Number(pct.toFixed(4))}%`;
}

/** A rate as per-unit terms (as written) plus one ad valorem percentage. */
export interface RateExpr {
  perUnit: string[];
  pct: number;
}

/** Splits a base rate text ("40¢/kg + 10.4%", "Free", "6.8%") into per-unit terms and its ad valorem part. Null when unreadable. */
export function baseExpr(text: string | null): RateExpr | null {
  if (!text) return null;
  if (!parseRate(text)) return null;
  const perUnit: string[] = [];
  let pct = 0;
  for (const raw of text.split(/\s*\+\s*/)) {
    const term = raw.trim();
    if (!term || /^free$/i.test(term)) continue;
    const p = parseRate(term);
    if (!p) return null;
    if (p.perUnit.length === 0) pct += p.adValoremPct;
    else if (p.adValoremPct === 0) perUnit.push(term);
    else return null;
  }
  return { perUnit, pct };
}

export function exprString(e: RateExpr): string {
  const parts = [...e.perUnit];
  if (e.pct > 1e-9) parts.push(fmtPct(e.pct));
  return parts.length > 0 ? parts.join(' + ') : 'Free';
}

/** Dollars a rate string costs on the nominal shipment; null when unreadable. */
export function nominalDollars(total: string): number | null {
  const rate = parseRate(total);
  if (!rate) return null;
  const qty: Record<string, number> = {};
  for (const u of quantityUnits([rate])) qty[u.key] = NOMINAL_QUANTITY;
  return rateDollars(rate, NOMINAL_VALUE_USD, qty);
}

function nominalQuantities(line: TariffRateTableRow, extraRateTexts: (string | null)[]): Record<string, number> {
  const q: Record<string, number> = {};
  for (const u of DEFAULT_UOMS) q[u] = NOMINAL_QUANTITY;
  for (const u of line.units) q[normalizeUom(u)] = NOMINAL_QUANTITY;
  for (const t of extraRateTexts) for (const u of rateUoms(t)) q[u] = NOMINAL_QUANTITY;
  return q;
}

/** One way the line can be priced (a product type / fact answer combination). */
export interface RateVariantResult {
  /** "patented", "generic", "if yes"… null for the only variant. */
  label: string | null;
  total: string;
  extra: string;
  preference: string;
  dollars: number;
  expr: RateExpr | null;
  /** Charged Chapter 99 codes. */
  chargedCodes: string[];
}

export interface LineRateResult {
  hts: string;
  base: string;
  variants: RateVariantResult[];
  /** Problems the writer must look at (engine errors, totals that don't re-price to the engine's dollars). */
  problems: string[];
  /** Assumptions made (content value = customs value, fact defaults…). */
  notes: string[];
  banned: string | null;
}

export interface EvalOptions {
  /** SPI claimed for the base line ("S", "SG", "D"…); omitted = general rate. */
  claimedSpi?: string;
  entryDate: string;
}

function factIdsInScope(measures: TariffMeasureRecord[], hts10: string, iso: string, day: string): { mustAnswer: string[]; defaulted: string[] } {
  const registry = new Map(loadConfirmationFacts().map((f) => [f.id, f]));
  const mustAnswer = new Set<string>();
  const defaulted = new Set<string>();
  for (const m of measures) {
    if (!measureReachesLine(m, hts10) || !countryInScope(m, iso) || !inEffectOn(m, day)) continue;
    for (const id of [...(m.conditions?.factsTrue ?? []), ...(m.conditions?.factsFalse ?? [])]) {
      const f = registry.get(id);
      if (f && f.defaultWhenUnanswered === null) mustAnswer.add(id);
      else defaulted.add(id);
    }
  }
  return { mustAnswer: Array.from(mustAnswer), defaulted: Array.from(defaulted) };
}

function chargedRecord(code: string, measures: TariffMeasureRecord[], hts10: string, iso: string, day: string): TariffMeasureRecord | undefined {
  return measures.find((m) => m.ch99Code === code && m.rateKind !== 'relief' && measureReachesLine(m, hts10) && countryInScope(m, iso) && inEffectOn(m, day));
}

interface Priced {
  expr: RateExpr | null;
  extra: string;
  chargedCodes: string[];
  contentAssumed: boolean;
}

function priceResult(
  result: MeasureEngineResult,
  baseText: string,
  measures: TariffMeasureRecord[],
  hts10: string,
  iso: string,
  day: string,
  usmcaClaimed: boolean
): Priced {
  const base = baseExpr(baseText);
  const charged = result.lines
    .filter((l) => l.code !== 'base')
    .map((l) => ({ line: l, m: chargedRecord(l.code, measures, hts10, iso, day) }))
    .filter((c) => c.m && c.m.rateKind !== 'relief') as { line: MeasureEngineResult['lines'][number]; m: TariffMeasureRecord }[];
  const replaced = charged.some((c) => c.m.rateKind === 'inPlaceOfBase' || c.m.rateKind === 'floor');
  let expr: RateExpr | null = replaced ? { perUnit: [], pct: 0 } : base ? { perUnit: [...base.perUnit], pct: base.pct } : null;
  const parts: string[] = [];
  let contentAssumed = false;
  for (const { line, m } of charged) {
    const pct = m.ratePct ?? 0;
    const on = m.contentBasis ? ` of the ${m.contentBasis === 'nonUsContent' ? 'non-U.S. content' : `${m.contentBasis} content`} value` : '';
    if (m.contentBasis) contentAssumed = true;
    if (m.rateKind === 'additive') {
      parts.push(`+${fmtPct(pct)}${on}`);
      if (expr) expr.pct += pct;
    } else if (m.rateKind === 'inPlaceOfBase') {
      parts.push(`${fmtPct(pct)}${on} in place of base`);
      if (expr) expr.pct += pct;
    } else {
      // floor: max(base, pct × value). The engine charges the larger one as this measure's amount.
      const floorAmount = (pct / 100) * NOMINAL_VALUE_USD;
      if (line.amountUsd > floorAmount + 0.005 && base) {
        parts.push(`${fmtPct(pct)} floor; the base rate is higher`);
        if (expr) {
          expr.perUnit.push(...base.perUnit);
          expr.pct += base.pct;
        }
      } else {
        parts.push(`${fmtPct(pct)}${on} in place of base`);
        if (expr) expr.pct += pct;
      }
    }
  }
  const codes = charged.map((c) => c.m.ch99Code);
  let extra: string;
  const relief = usmcaClaimed ? [] : reliefNotes(result, measures).notes;
  if (parts.length === 0) extra = usmcaClaimed ? 'None (USMCA)' : relief.length > 0 ? `None: ${relief.join('; ')}` : 'None';
  else if (parts.length === 1) extra = parts[0];
  else extra = parts.map((p, i) => `${i > 0 ? p.replace(/^\+/, '') : p} (${codes[i]})`).join(' + ');
  return { expr, extra, chargedCodes: codes, contentAssumed };
}

/** "Section 301 does not apply (9903.05.93)" for each relief heading the engine applied. */
function reliefNotes(result: MeasureEngineResult, measures: TariffMeasureRecord[]): { notes: string[]; programs: Set<string> } {
  const byProgram = new Map<string, string[]>();
  for (const l of result.lines) {
    if (l.code === 'base') continue;
    const relief = measures.find((m) => m.ch99Code === l.code && m.rateKind === 'relief');
    if (!relief) continue;
    const replaced = measures.find((m) => relief.replacesCodes.includes(m.ch99Code) && m.rateKind !== 'relief');
    const program = programShort(replaced?.program ?? relief.program);
    const codes = byProgram.get(program) ?? [];
    if (!codes.includes(l.code)) codes.push(l.code);
    byProgram.set(program, codes);
  }
  const notes = Array.from(byProgram.entries()).map(([program, codes]) => `${program} does not apply (${codes.join(', ')})`);
  return { notes, programs: new Set(byProgram.keys()) };
}

function preferenceText(result: MeasureEngineResult, claimed: string | undefined, claimRate: string | null, measures: TariffMeasureRecord[]): string {
  if (!claimed) return 'None';
  const isUsmca = USMCA_SPI_CODES.includes(claimed);
  // "AGOA (African Growth and Opportunity Act)" → "AGOA"; "US–Singapore Free Trade Agreement" stays.
  const name = isUsmca ? 'USMCA' : (SPECIAL_PROGRAMS[claimed]?.name ?? `program ${claimed}`).replace(/\s*\(.*\)$/, '');
  let text = `${claimRate ?? 'Free'} under ${name} (${claimed})`;
  const { notes, programs } = reliefNotes(result, measures);
  for (const s of result.skipped) {
    if (!/USMCA claimed|is claimed/.test(s.reason)) continue;
    const m = measures.find((x) => x.ch99Code === s.ch99Code && x.rateKind !== 'relief');
    if (m && !programs.has(programShort(m.program))) {
      programs.add(programShort(m.program));
      notes.push(`${programShort(m.program)} does not apply`);
    }
  }
  if (notes.length > 0) text += `; ${notes.join('; ')}`;
  return text;
}

interface Combo {
  label: string | null;
  productType?: TariffProductType;
  facts?: Record<string, boolean>;
}

function combos(productTypes: TariffProductType[], mustFacts: string[]): Combo[] {
  const types: (TariffProductType | undefined)[] = productTypes.length > 0 ? PRODUCT_TYPE_ORDER.filter((t) => productTypes.includes(t)) : [undefined];
  const facts = mustFacts.slice(0, MAX_FACT_COMBOS);
  const answers: (Record<string, boolean> | undefined)[] = [];
  if (facts.length === 0) answers.push(undefined);
  else {
    for (let mask = 0; mask < 1 << facts.length; mask++) {
      const a: Record<string, boolean> = {};
      facts.forEach((f, i) => (a[f] = Boolean(mask & (1 << i))));
      answers.push(a);
    }
  }
  const out: Combo[] = [];
  for (const t of types) {
    for (const a of answers) {
      const factLabel = a ? (facts.length === 1 ? `if ${a[facts[0]] ? 'yes' : 'no'}` : facts.map((f) => `${f} ${a[f] ? 'yes' : 'no'}`).join(' ')) : null;
      const label = [t ?? null, factLabel].filter(Boolean).join(' ') || null;
      out.push({ label, productType: t, facts: a });
    }
  }
  return out;
}

/**
 * Prices one line from one country. With a claim the line must offer it (or have a Free general rate);
 * otherwise the result carries a problem and the caller can fall back to the general rate.
 */
export function evaluateLine(
  row: TariffRateTableRow,
  iso: string,
  measures: TariffMeasureRecord[],
  opts: EvalOptions
): LineRateResult & { claimRejected?: boolean } {
  const hts10 = row.htsCode10 as string;
  const hts = row.hts as string;
  const day = opts.entryDate;
  const line = engineLine(row);
  const generalBase = COLUMN2_COUNTRIES.includes(iso) && line.column2 ? line.column2 : line.general;
  const out: LineRateResult & { claimRejected?: boolean } = { hts, base: generalBase ?? '—', variants: [], problems: [], notes: [], banned: null };

  const ban = importProhibitionFor({ hts10, countryOfOrigin: iso, entryDate: day });
  if (ban && !ban.unconfirmed) {
    out.banned = ban.banId;
    out.variants.push({
      label: null,
      total: 'Import banned',
      extra: `Import banned (${ban.banId})`,
      preference: 'None',
      dollars: Number.NaN,
      expr: null,
      chargedCodes: [],
    });
    out.notes.push(`${hts}: import banned for ${iso} from ${ban.effectiveFrom} (${ban.banId}).`);
    return out;
  }
  if (ban?.unconfirmed) out.notes.push(`${hts}: banned for ${iso} only if: ${ban.unconfirmed.map((u) => u.prompt).join('; ')} (${ban.banId}).`);

  const claimRate = opts.claimedSpi ? specialRateFor(line, opts.claimedSpi) : null;
  const baseText = opts.claimedSpi && claimRate !== null ? claimRate : generalBase;
  if (!baseText) {
    out.problems.push(`${hts}: the HTS states no base rate.`);
    return out;
  }
  // A claimed program whose special rate only points to a Chapter 98/99 quota heading ("See 9823.05.01-9823.05.06
  // (S+)") can't be priced: the rate depends on in-quota / over-quota status. Say so in the cell instead of a number;
  // the validator's calculator cross-check skips non-numeric totals.
  const quotaRef = baseText.match(/^\s*See\s+(9[89]\d{2}\.\d{2}\.\d{2}(?:\s*-\s*9[89]\d{2}\.\d{2}\.\d{2})?)/i);
  if (opts.claimedSpi && quotaRef) {
    out.variants.push({
      label: null,
      total: `See ${quotaRef[1]} (quota)`,
      extra: 'Depends on quota status',
      preference: `${opts.claimedSpi} rate set by ${quotaRef[1]} (in-quota / over-quota); not priced by the calculator`,
      dollars: Number.NaN,
      expr: null,
      chargedCodes: [],
    });
    out.notes.push(`${hts} (${iso}, ${opts.claimedSpi}): special rate refers to ${quotaRef[1]} (quota) — shown as text, not priced.`);
    return out;
  }
  const { mustAnswer, defaulted } = factIdsInScope(measures, hts10, iso, day);
  if (mustAnswer.length > MAX_FACT_COMBOS) out.problems.push(`${hts}: ${mustAnswer.length} must-answer facts; only the first ${MAX_FACT_COMBOS} are varied.`);
  if (defaulted.length > 0) out.notes.push(`${hts} (${iso}): fact defaults used for ${defaulted.join(', ')}.`);
  const types = productTypesForLine(
    hts10,
    measures.filter((m) => inEffectOn(m, day)),
    iso
  );
  const usmcaClaimed = !!opts.claimedSpi && USMCA_SPI_CODES.includes(opts.claimedSpi);
  const quantities = nominalQuantities(row, [generalBase, claimRate]);

  const raw: RateVariantResult[] = [];
  for (const c of combos(types, mustAnswer)) {
    const input: MeasureEngineInput = {
      hts10,
      countryOfOrigin: iso,
      customsValueUsd: NOMINAL_VALUE_USD,
      quantities,
      ...(opts.claimedSpi ? { claimedSpi: opts.claimedSpi } : {}),
      ...(c.productType ? { productType: c.productType } : {}),
      ...(c.facts ? { confirmations: { facts: c.facts } } : {}),
      entryDate: day,
    };
    let result = calculateWithMeasures(input, line, measures);
    let contentFallback = false;
    if (result.error?.startsWith(CONTENT_VALUE_REQUIRED)) {
      // The cell can't know the metal / U.S. content: price on the full customs value and say so.
      result = calculateWithMeasures(
        { ...input, contentValuesUsd: { steel: NOMINAL_VALUE_USD, aluminum: NOMINAL_VALUE_USD, copper: NOMINAL_VALUE_USD, usContent: 0 } },
        line,
        measures
      );
      contentFallback = true;
    }
    if (result.error) {
      if (opts.claimedSpi && /does not offer a special rate/.test(result.error)) {
        out.claimRejected = true;
        return out;
      }
      out.problems.push(`${hts} (${iso}${opts.claimedSpi ? `, ${opts.claimedSpi}` : ''}${c.label ? `, ${c.label}` : ''}): engine error: ${result.error}`);
      continue;
    }
    const priced = priceResult(result, baseText, measures, hts10, iso, day, usmcaClaimed);
    if (contentFallback || priced.contentAssumed)
      out.notes.push(`${hts} (${iso}): content-based duty priced on the full customs value (the cell can't know the content value).`);
    const total = priced.expr ? exprString(priced.expr) : null;
    const repriced = total ? nominalDollars(total) : null;
    if (!total || repriced === null || Math.abs(repriced - result.totalDutyUsd) > 0.01) {
      out.problems.push(
        `${hts} (${iso}${c.label ? `, ${c.label}` : ''}): total "${total ?? '?'}" re-prices to ${
          repriced ?? '?'
        } but the engine charges $${result.totalDutyUsd.toFixed(2)} on $${NOMINAL_VALUE_USD} / ${NOMINAL_QUANTITY} units.`
      );
      continue;
    }
    raw.push({
      label: c.label,
      total,
      extra: priced.extra,
      preference: preferenceText(result, opts.claimedSpi, claimRate, measures),
      dollars: result.totalDutyUsd,
      expr: priced.expr,
      chargedCodes: priced.chargedCodes,
    });
  }
  // Collapse variants with the same total (e.g. generic = specialty = other) and order cheapest first.
  const merged: RateVariantResult[] = [];
  for (const v of raw) if (!merged.some((m) => m.total === v.total && m.extra === v.extra)) merged.push(v);
  merged.sort((a, b) => a.dollars - b.dollars);
  out.variants = merged.length === 1 ? [{ ...merged[0], label: null }] : merged;
  return out;
}

/** Country-tied FTA programs the line offers to `iso` (lapsed programs excluded), plus `extraClaims`. */
export function ftaClaimsFor(row: TariffRateTableRow, iso: string, extraClaims: string[] = []): string[] {
  const line = engineLine(row);
  const out: string[] = [];
  for (const [code, info] of Object.entries(SPECIAL_PROGRAMS)) {
    if (info.lapsed || !info.countries?.includes(iso) || USMCA_SPI_CODES.includes(code)) continue;
    if (specialRateFor(line, code) !== null) out.push(code);
  }
  for (const code of extraClaims) if (!out.includes(code) && specialRateFor(line, code) !== null) out.push(code);
  return out;
}

/** The USMCA SPI the line offers ("S" or "S+"), or "S" when the general rate is Free (the claim still counts). */
export function usmcaClaimFor(row: TariffRateTableRow): string | null {
  const line = engineLine(row);
  for (const code of USMCA_SPI_CODES) if (specialRateFor(line, code) !== null) return code;
  return line.general && /^\s*free\s*$/i.test(line.general) ? 'S' : null;
}
