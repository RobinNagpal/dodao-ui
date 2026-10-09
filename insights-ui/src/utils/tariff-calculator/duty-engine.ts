// Duty calculation engine. Given a set of cached candidate codes for an HTS
// 10-digit line and a shipment's user inputs, decide which codes apply and
// compute the per-line duties + landed cost.
//
// Rate-info interpretation (from observed upstream data):
//   computationCode "0"  -> ad-valorem add-on, rate = ratePenalty
//                          (e.g. "duty + 25%" Section 232 / Section 301 stacks)
//   computationCode "1"  -> specific (per-unit), rate = ratePrimary
//                          applied against the quantity in the unit the rate
//                          text names ("1¢/kg" -> KG, "/head" -> NO, …; see
//                          rateUnitOfMeasure), falling back to unitsOfMeasure[0]
//   computationCode "7"  -> ad-valorem, rate = rateSecondary
//                          (the standard "32%" base HTSUS rate shape)
// For unknown codes the engine falls back to the same shape — specific +
// ad-valorem — by summing whatever non-zero rate fields are present, and
// flags the line so the UI can surface "verify upstream interpretation".
//
// Code relationships (relatedCodes):
//   EXCLUDED_BY X -> this code is dropped when X is active.
//   REPLACES X    -> when this code is active, X is dropped (e.g. the Section
//                    232 generic-drug exclusion 9903.04.67 replaces the 100%
//                    patented-pharma duty 9903.04.60).
// A per-unit line with no quantity for its unit is an error
// (QuantityRequiredError -> HTTP 400), never a silent $0.
//
// HMF/MPF formulas come from CBP regulations: HMF is 0.125% of customs
// value on ocean shipments only, MPF is 0.3464% clamped to [$32.71,
// $634.62] for formal entries (shipment value > $2500). Informal entries
// use a flat MPF that is out of scope for the simulator.

import { TariffApplicabilityConditionKind, TariffCandidateCodeType, TariffCountryScopeType, TariffRelatedCodeKind } from '@prisma/client';
import { CandidateCodeListItem } from '@/app/api/tariff-calculator/candidate-codes/[hts10]/route';
import type { TariffMeasureSource, TariffProductType } from '@/types/tariff-calculator-measures';

export const TRANSPORT_MODES = ['OCEAN', 'AIR', 'RAIL', 'TRUCK'] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const HMF_RATE = 0.00125;
export const MPF_RATE = 0.003464;
export const MPF_MIN_USD = 32.71;
export const MPF_MAX_USD = 634.62;
export const MPF_FORMAL_ENTRY_THRESHOLD = 2500;

/** HMF (ocean only) and MPF (formal entries only, clamped) on a shipment's customs value. */
export function entryFees(customsValueUsd: number, modeOfTransport: TransportMode): { hmf: number; mpf: number } {
  const hmf = modeOfTransport === 'OCEAN' ? customsValueUsd * HMF_RATE : 0;
  const mpf = customsValueUsd > MPF_FORMAL_ENTRY_THRESHOLD ? Math.min(Math.max(customsValueUsd * MPF_RATE, MPF_MIN_USD), MPF_MAX_USD) : 0;
  return { hmf, mpf };
}

export interface CalculatorInputs {
  hts10: string;
  shipmentValueUsd: number;
  countryOfOrigin: string;
  unitsOfMeasure: Record<string, number>;
  modeOfTransport: TransportMode;
  entryDate: string;
  dateOfLoading: string;
  chosenSpis: string[];
  // Codes the user explicitly elected to apply. Each entry is `${code}|${variant ?? ''}`.
  // Used for `requiresUserChoice`-flagged candidates (e.g. Section 122 Donation
  // Exclusion) which never auto-apply — the importer has to claim them.
  chosenExclusions: string[];
  // Official-measures engine only (issue #1785): the trade-deal (SPI) program claimed for
  // the base line (e.g. "S" for USMCA) and the product type some measures depend on.
  claimedSpi?: string;
  productType?: TariffProductType;
}

// Which engine priced a result: the legacy cached candidate codes, or the official HTS
// rates + reviewed Chapter 99 measures (enabled per chapter by TARIFF_CALC_MEASURES_ENABLED).
export type CalculatorEngine = 'candidate-codes' | 'official-measures';

export interface DutyLine {
  candidateId: string;
  code: string;
  variant: string | null;
  type: TariffCandidateCodeType;
  label: string;
  category: string | null;
  rateDescription: string;
  dutyAmount: number;
  effectiveAdValoremRate: number | null;
  notes: string[];
  // Official documents behind the line (official-measures engine only).
  sources?: TariffMeasureSource[];
}

// A user-electable Chapter 99 code (requiresUserChoice = true) that — if the
// importer claims it — would knock out at least one currently-active duty
// line. The UI lists these with checkboxes; toggling re-submits the calc.
export interface PotentialExclusion {
  candidateId: string;
  code: string;
  variant: string | null;
  label: string;
  category: string | null;
  rateDescription: string;
  // Codes that would be dropped from the duty totals if the user applies this exclusion.
  excludesCodes: { code: string; variant: string | null }[];
  applied: boolean;
}

export interface CalculatorResult {
  hts10: string;
  inputs: CalculatorInputs;
  lines: DutyLine[];
  potentialExclusions: PotentialExclusion[];
  totals: {
    baseCost: number;
    totalDuties: number;
    hmf: number;
    mpf: number;
    landedCost: number;
    effectiveDutyRate: number;
  };
  diagnostics: {
    candidatesEvaluated: number;
    candidatesApplicable: number;
    candidatesExcluded: number;
    // True when at least one candidate in scope is priced per-unit
    // (computationCode "1" or any specific ratePrimary > 0). The UI hides the
    // UOM/Quantity inputs when false.
    requiresQuantity: boolean;
    // Distinct UOMs the per-unit candidate codes are priced in — the unit the
    // rate text names (e.g. cattle 0102.29.40.54 "1¢/kg" -> 'KG' even though
    // its first reporting unit is 'NO' head).
    primaryUoms: string[];
  };
}

// How fresh the cached extra-duty (Chapter 99) data is, plus where to send the
// user for today's rates. Added by the API route (the engine has no DB access).
export interface DataFreshness {
  // Most recent time the candidate codes for this HTS line were fetched upstream.
  lastUpdatedAt: string | null;
  // Chapter tariff report for the HTS chapter, when one is published.
  chapterReportHref: string | null;
  // Official-measures engine: the HTS edition the measures were reviewed against.
  // `lastUpdatedAt` is then the latest date the measures were reviewed against official sources.
  engine?: CalculatorEngine;
  htsEdition?: string | null;
}

export interface CalculatorResponse extends CalculatorResult {
  dataFreshness: DataFreshness;
  engine?: CalculatorEngine;
  // Official-measures engine: extra duties in scope for this line and country that are not charged, and why.
  skippedMeasures?: { ch99Code: string; reason: string }[];
}

// Units a per-unit duty for this HTS line can be charged in. Returned by the
// requirements endpoint so the UI can ask for the right quantity *before* the
// first calculation (a missing quantity is a 400, see QuantityRequiredError).
export interface PerUnitRequirement {
  uom: string;
  rateDescription: string;
}

// Thrown when a duty line is priced per unit but no quantity was given for its
// unit. The error middleware turns `isClientError` + `statusCode` into a 400.
export class QuantityRequiredError extends Error {
  readonly statusCode = 400;
  /** Trust marker: withErrorHandling only honours `statusCode` on errors that set this. */
  readonly isClientError = true;
  readonly uoms: string[];
  constructor(missing: { uom: string; rateDescription: string; code: string }[]) {
    const uoms = Array.from(new Set(missing.map((m) => m.uom)));
    const detail = missing.map((m) => `${m.rateDescription || 'per-unit rate'} on ${m.code}`).join('; ');
    super(`Quantity required: this product has a per-unit duty (${detail}). Enter the shipment quantity in ${uoms.map(describeUom).join(' and ')}.`);
    this.name = 'QuantityRequiredError';
    this.uoms = uoms;
  }
}

const UOM_LABELS: Record<string, string> = {
  KG: 'kilograms',
  CKG: 'clean kilograms',
  G: 'grams',
  T: 'metric tons',
  L: 'liters',
  'PF.L': 'proof liters',
  NO: 'number of units / head',
  DOZ: 'dozens',
  DPR: 'dozen pairs',
  PRS: 'pairs',
  GROSS: 'gross',
  M: 'meters',
  M2: 'square meters',
  M3: 'cubic meters',
  THS: 'thousands',
};

export function describeUom(uom: string): string {
  const label = UOM_LABELS[uom];
  return label ? `${uom} (${label})` : uom;
}

function withinDateWindow(c: CandidateCodeListItem, entryDate: Date): boolean {
  return entryDate.getTime() >= new Date(c.effectiveFrom).getTime() && entryDate.getTime() <= new Date(c.effectiveTo).getTime();
}

function countryMatches(c: CandidateCodeListItem, country: string): boolean {
  switch (c.countryScopeType) {
    case TariffCountryScopeType.ALL:
      return true;
    case TariffCountryScopeType.ONLY:
      return c.countryScopeCountries.includes(country);
    case TariffCountryScopeType.ALL_EXCEPT:
      return !c.countryScopeCountries.includes(country);
  }
}

function compareThreshold(value: number, threshold: number, kind: 'GREATER' | 'LESS', including: boolean): boolean {
  if (kind === 'GREATER') return including ? value >= threshold : value > threshold;
  return including ? value <= threshold : value < threshold;
}

// Resolve a fieldKey on the input bundle to a comparable value. Returns
// undefined for unknown keys so the caller can treat the condition as
// unmet (conservative — we'd rather understate duty than apply a tariff
// based on a key we don't understand).
function resolveFieldValue(fieldKey: string, inputs: CalculatorInputs): { kind: 'string'; value: string } | { kind: 'number'; value: number } | undefined {
  switch (fieldKey) {
    case 'MODE_OF_TRANSPORT':
      return { kind: 'string', value: inputs.modeOfTransport };
    case 'COUNTRY_OF_ORIGIN':
      return { kind: 'string', value: inputs.countryOfOrigin };
    case 'ENTRY_DATE':
      return { kind: 'number', value: new Date(inputs.entryDate).getTime() };
    case 'DATE_OF_LOADING':
      return { kind: 'number', value: new Date(inputs.dateOfLoading).getTime() };
    case 'SHIPMENT_VALUE':
      return { kind: 'number', value: inputs.shipmentValueUsd };
    default:
      return undefined;
  }
}

function applicabilityConditionsPass(c: CandidateCodeListItem, inputs: CalculatorInputs): boolean {
  for (const cond of c.applicabilityConditions) {
    if (cond.kind === TariffApplicabilityConditionKind.SOME_SPI_APPLIED) {
      const intersects = cond.programCodes.some((p) => inputs.chosenSpis.includes(p));
      if (!intersects) return false;
      continue;
    }
    const resolved = resolveFieldValue(cond.fieldKey, inputs);
    if (!resolved) return false;
    if (cond.kind === TariffApplicabilityConditionKind.EQUALS) {
      if (cond.fieldShouldEqual === null) return false;
      const candidateValue = resolved.kind === 'string' ? resolved.value : resolved.value.toString();
      if (candidateValue !== cond.fieldShouldEqual) return false;
      continue;
    }
    // GREATER / LESS — both sides must reduce to numbers. For date fields
    // the threshold is an ISO timestamp; for numeric fields it's a number
    // serialized as a string.
    if (cond.threshold === null || cond.includingThreshold === null) return false;
    const lhs = resolved.kind === 'number' ? resolved.value : Number(resolved.value);
    const rhs = cond.fieldKey.endsWith('_DATE') || cond.fieldKey === 'DATE_OF_LOADING' ? new Date(cond.threshold).getTime() : Number(cond.threshold);
    if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) return false;
    const passed = compareThreshold(lhs, rhs, cond.kind === TariffApplicabilityConditionKind.GREATER ? 'GREATER' : 'LESS', cond.includingThreshold);
    if (!passed) return false;
  }
  return true;
}

interface DutyComputation {
  amount: number;
  effectiveAdValoremRate: number | null;
  notes: string[];
}

function parseRate(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

// Which unit a specific rate is charged in, read from its rate text. Each entry
// lists the HTS reporting-unit codes that mean that unit; the first one the
// candidate actually reports is used, else the first in the list (the rate text
// is authoritative even when the reporting units differ). Order matters:
// more specific patterns ("/pf. liter", "/doz. pr.") come first.
const RATE_UNIT_PATTERNS: { pattern: RegExp; uoms: string[] }[] = [
  { pattern: /\/\s*pf\.?\s*l|proof\s*lit/i, uoms: ['PF.L'] },
  { pattern: /\/\s*clean\s*kg/i, uoms: ['CKG', 'KG'] },
  { pattern: /\/\s*kg\b|per\s+kilogram/i, uoms: ['KG'] },
  { pattern: /\/\s*(?:liter|litre|l)\b|per\s+lit(?:er|re)/i, uoms: ['L'] },
  { pattern: /\/\s*doz\.?\s*pr/i, uoms: ['DPR'] },
  { pattern: /\/\s*doz\b/i, uoms: ['DOZ'] },
  { pattern: /\/\s*m(?:2|²)/i, uoms: ['M2'] },
  { pattern: /\/\s*m(?:3|³)/i, uoms: ['M3'] },
  { pattern: /\/\s*(?:m|meter|metre)\b/i, uoms: ['M'] },
  { pattern: /\/\s*(?:pr|pair)s?\b/i, uoms: ['PRS'] },
  { pattern: /\/\s*gross\b/i, uoms: ['GROSS'] },
  { pattern: /\/\s*(?:t|ton|tonne)\b/i, uoms: ['T'] },
  { pattern: /\/\s*(?:g|gram)\b/i, uoms: ['G'] },
  { pattern: /\/\s*(?:1,?000|thousand)\b/i, uoms: ['THS'] },
  { pattern: /\/\s*(?:head|no\.?|unit|item|piece|pc)(?=\W|$)|\beach\b/i, uoms: ['NO'] },
];

export function rateUnitOfMeasure(c: Pick<CandidateCodeListItem, 'rateDescription' | 'unitsOfMeasure'>): string | undefined {
  const text = c.rateDescription ?? '';
  for (const { pattern, uoms } of RATE_UNIT_PATTERNS) {
    if (!pattern.test(text)) continue;
    return uoms.find((u) => c.unitsOfMeasure.includes(u)) ?? uoms[0];
  }
  return c.unitsOfMeasure[0];
}

function isPerUnit(c: CandidateCodeListItem): boolean {
  return c.rateComputationCode === '1' || parseRate(c.ratePrimary) > 0;
}

function computeLineDuty(c: CandidateCodeListItem, inputs: CalculatorInputs): DutyComputation {
  const primary = parseRate(c.ratePrimary);
  const secondary = parseRate(c.rateSecondary);
  const penalty = parseRate(c.ratePenalty);
  const value = inputs.shipmentValueUsd;
  const notes: string[] = [];

  let specific = 0;
  if (primary > 0) {
    const uom = rateUnitOfMeasure(c);
    const qty = uom ? inputs.unitsOfMeasure[uom] : undefined;
    // calculateDuties checks quantities up front, so this only guards direct callers.
    if (!uom || qty === undefined) throw new QuantityRequiredError([{ uom: uom ?? 'unit', rateDescription: c.rateDescription, code: c.code }]);
    specific = primary * qty;
    notes.push(`Per-unit duty: $${primary} per ${uom} × ${qty.toLocaleString('en-US')} ${uom}`);
  }

  let adValoremRate = 0;
  if (c.rateComputationCode === '7') {
    adValoremRate = secondary;
  } else if (c.rateComputationCode === '0') {
    adValoremRate = penalty;
  } else if (c.rateComputationCode === '1') {
    // Pure specific — no ad-valorem component.
  } else {
    // Unknown computation code: best-effort sum of whichever ad-valorem
    // fields are populated. Surface a note so the UI flags it — only when an
    // ad-valorem part exists, since a lone per-unit rate is unambiguous.
    adValoremRate = secondary + penalty;
    if (adValoremRate > 0) {
      notes.push(`Computation code ${c.rateComputationCode} not in MVP ruleset — interpretation may be inaccurate`);
    }
  }

  const adValorem = adValoremRate * value;
  const amount = specific + adValorem;
  const effectiveAdValoremRate = value > 0 ? amount / value : adValoremRate || null;

  return { amount, effectiveAdValoremRate, notes };
}

function keyFor(code: string, variant: string | null | undefined): string {
  return `${code}|${variant ?? ''}`;
}

// Keys of the codes `c` replaces (REPLACES relations), ignoring self-references
// (upstream lists e.g. 9903.04.64 as replacing itself).
function replacedKeys(c: CandidateCodeListItem): string[] {
  const self = keyFor(c.code, c.variant);
  return c.relatedCodes
    .filter((rel) => rel.kind === TariffRelatedCodeKind.REPLACES)
    .map((rel) => keyFor(rel.code, rel.variant))
    .filter((k) => k !== self);
}

// Keys of the codes that, when active, knock `c` out (EXCLUDED_BY relations).
function excludedByKeys(c: CandidateCodeListItem): string[] {
  return c.relatedCodes.filter((rel) => rel.kind === TariffRelatedCodeKind.EXCLUDED_BY).map((rel) => keyFor(rel.code, rel.variant));
}

// Resolve the active set into the codes that are actually charged:
//   1. REPLACES — walk the user-claimed codes first, then the auto codes (each
//      in stacking order); each code still in play drops the codes it replaces.
//      A code that was already replaced can't replace anything, so mutual
//      replacements (e.g. two 0% exclusions that each list the other) resolve
//      to the first one instead of cancelling out, and a claimed code beats the
//      auto code it replaces.
//   2. EXCLUDED_BY — drop codes whose excluder is still in play.
// The result keeps the input (stacking) order.
function resolveSurviving(active: CandidateCodeListItem[]): CandidateCodeListItem[] {
  const removed = new Set<string>();
  const walkOrder = [...active.filter((c) => c.requiresUserChoice), ...active.filter((c) => !c.requiresUserChoice)];
  for (const c of walkOrder) {
    if (removed.has(keyFor(c.code, c.variant))) continue;
    for (const k of replacedKeys(c)) removed.add(k);
  }
  const afterReplace = active.filter((c) => !removed.has(keyFor(c.code, c.variant)));
  const inPlay = new Set(afterReplace.map((c) => keyFor(c.code, c.variant)));
  return afterReplace.filter((c) => !excludedByKeys(c).some((k) => inPlay.has(k)));
}

// Every unit a currently-effective per-unit line could be charged in. The UI
// uses this to show the right quantity inputs before the first calculation.
export function perUnitRequirements(candidates: CandidateCodeListItem[], asOf: Date): PerUnitRequirement[] {
  const byUom = new Map<string, PerUnitRequirement>();
  for (const c of candidates) {
    if (!isPerUnit(c) || !withinDateWindow(c, asOf)) continue;
    const uom = rateUnitOfMeasure(c);
    if (uom && !byUom.has(uom)) byUom.set(uom, { uom, rateDescription: c.rateDescription });
  }
  return Array.from(byUom.values());
}

export function calculateDuties(candidates: CandidateCodeListItem[], inputs: CalculatorInputs): CalculatorResult {
  const entryDate = new Date(inputs.entryDate);
  if (Number.isNaN(entryDate.getTime())) {
    throw new Error(`Invalid entryDate: ${inputs.entryDate}`);
  }

  const applicable = candidates.filter(
    (c) => withinDateWindow(c, entryDate) && countryMatches(c, inputs.countryOfOrigin) && applicabilityConditionsPass(c, inputs)
  );

  // `requiresUserChoice` codes (e.g. Section 232 generic-drug exclusion) are
  // *never* auto-applied — the importer has to claim them. Split the
  // applicable set so we can report user-electable ones separately and only
  // include them in the active set when the user opts in.
  const chosenSet = new Set(inputs.chosenExclusions);
  const userElectable = applicable.filter((c) => c.requiresUserChoice);
  const userOptedIn = userElectable.filter((c) => chosenSet.has(keyFor(c.code, c.variant)));
  const active = applicable.filter((c) => !c.requiresUserChoice || userOptedIn.includes(c));
  const surviving = resolveSurviving(active);

  // A per-unit line without a quantity in its unit is a user error, not $0.
  const missing = surviving
    .filter((c) => parseRate(c.ratePrimary) > 0)
    .map((c) => ({ uom: rateUnitOfMeasure(c) ?? 'unit', rateDescription: c.rateDescription, code: c.code }))
    .filter((m) => inputs.unitsOfMeasure[m.uom] === undefined);
  if (missing.length > 0) throw new QuantityRequiredError(missing);

  let totalDuties = 0;
  const lines: DutyLine[] = surviving.map((c) => {
    const computed = computeLineDuty(c, inputs);
    totalDuties += computed.amount;
    return {
      candidateId: c.id,
      code: c.code,
      variant: c.variant,
      type: c.type,
      label: c.label,
      category: c.category,
      rateDescription: c.rateDescription,
      dutyAmount: computed.amount,
      effectiveAdValoremRate: computed.effectiveAdValoremRate,
      notes: computed.notes,
    };
  });

  // Build the "Potential Exclusion Codes" list. We only surface user-electable
  // codes that would *actually* knock out at least one currently-charged duty
  // line (or, if already opted in, that are knocking one out right now). A code
  // knocks out a line either because the line lists it as EXCLUDED_BY or because
  // the code REPLACES the line (e.g. the generic-drug exclusion replacing the
  // 100% Section 232 pharma duty).
  const survivingKeys = new Set(surviving.map((c) => keyFor(c.code, c.variant)));
  const dutyLineKeys = new Set(lines.filter((l) => l.dutyAmount > 0).map((l) => keyFor(l.code, l.variant)));
  const potentialExclusions: PotentialExclusion[] = [];
  for (const c of userElectable) {
    const ownKey = keyFor(c.code, c.variant);
    const isApplied = chosenSet.has(ownKey);
    const replaces = new Set(replacedKeys(c));
    const effectiveTargets: { code: string; variant: string | null }[] = [];
    for (const target of active) {
      const k = keyFor(target.code, target.variant);
      if (k === ownKey) continue;
      if (!replaces.has(k) && !excludedByKeys(target).includes(ownKey)) continue;
      const currentlyCharged = dutyLineKeys.has(k);
      const droppedNow = !survivingKeys.has(k); // dropped today, would re-appear if the claim is dropped
      if ((isApplied && droppedNow) || (!isApplied && currentlyCharged)) effectiveTargets.push({ code: target.code, variant: target.variant });
    }
    if (effectiveTargets.length === 0) continue;
    potentialExclusions.push({
      candidateId: c.id,
      code: c.code,
      variant: c.variant,
      label: c.label,
      category: c.category,
      rateDescription: c.rateDescription,
      excludesCodes: effectiveTargets,
      applied: isApplied,
    });
  }

  const requiresQuantity = candidates.some(isPerUnit);
  const uomSet = new Set<string>();
  for (const c of candidates) {
    if (!isPerUnit(c)) continue;
    const uom = rateUnitOfMeasure(c);
    if (uom) uomSet.add(uom);
  }
  const primaryUoms = Array.from(uomSet).sort();

  const baseCost = inputs.shipmentValueUsd;
  const { hmf, mpf } = entryFees(baseCost, inputs.modeOfTransport);
  const landedCost = baseCost + totalDuties + hmf + mpf;
  const effectiveDutyRate = baseCost > 0 ? totalDuties / baseCost : 0;

  return {
    hts10: inputs.hts10,
    inputs,
    lines,
    potentialExclusions,
    totals: {
      baseCost,
      totalDuties,
      hmf,
      mpf,
      landedCost,
      effectiveDutyRate,
    },
    diagnostics: {
      candidatesEvaluated: candidates.length,
      candidatesApplicable: applicable.length,
      candidatesExcluded: active.length - surviving.length,
      requiresQuantity,
      primaryUoms,
    },
  };
}
