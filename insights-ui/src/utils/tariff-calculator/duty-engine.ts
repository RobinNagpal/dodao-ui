// Duty calculation engine. Given a set of cached candidate codes for an HTS
// 10-digit line and a shipment's user inputs, decide which codes apply and
// compute the per-line duties + landed cost.
//
// Rate-info interpretation (from observed upstream data):
//   computationCode "0"  -> ad-valorem add-on, rate = ratePenalty
//                          (e.g. "duty + 25%" Section 232/301/IEEPA stacks)
//   computationCode "1"  -> specific (per-unit), rate = ratePrimary
//                          applied against the quantity in unitsOfMeasure[0]
//   computationCode "7"  -> ad-valorem, rate = rateSecondary
//                          (the standard "32%" base HTSUS rate shape)
// For unknown codes the engine falls back to the same shape — specific +
// ad-valorem — by summing whatever non-zero rate fields are present, and
// flags the line so the UI can surface "verify upstream interpretation".
//
// HMF/MPF formulas come from CBP regulations: HMF is 0.125% of customs
// value on ocean shipments only, MPF is 0.3464% clamped to [$32.71,
// $634.62] for formal entries (shipment value > $2500). Informal entries
// use a flat MPF that is out of scope for the simulator.

import { TariffApplicabilityConditionKind, TariffCandidateCodeType, TariffCountryScopeType, TariffRelatedCodeKind } from '@prisma/client';
import { CandidateCodeListItem } from '@/app/api/tariff-calculator/candidate-codes/[hts10]/route';

export const TRANSPORT_MODES = ['OCEAN', 'AIR', 'RAIL', 'TRUCK'] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const HMF_RATE = 0.00125;
export const MPF_RATE = 0.003464;
export const MPF_MIN_USD = 32.71;
export const MPF_MAX_USD = 634.62;
export const MPF_FORMAL_ENTRY_THRESHOLD = 2500;

export interface CalculatorInputs {
  hts10: string;
  shipmentValueUsd: number;
  countryOfOrigin: string;
  unitsOfMeasure: Record<string, number>;
  modeOfTransport: TransportMode;
  entryDate: string;
  dateOfLoading: string;
  chosenSpis: string[];
}

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
}

export interface CalculatorResult {
  hts10: string;
  inputs: CalculatorInputs;
  lines: DutyLine[];
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
  };
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

function computeLineDuty(c: CandidateCodeListItem, inputs: CalculatorInputs): DutyComputation {
  const primary = parseRate(c.ratePrimary);
  const secondary = parseRate(c.rateSecondary);
  const penalty = parseRate(c.ratePenalty);
  const value = inputs.shipmentValueUsd;
  const notes: string[] = [];

  let specific = 0;
  if (primary > 0) {
    const uom = c.unitsOfMeasure[0];
    const qty = uom ? inputs.unitsOfMeasure[uom] : undefined;
    if (qty === undefined) {
      notes.push(`Specific rate requires quantity for ${uom ?? 'unit'} — defaulted to 0`);
    } else {
      specific = primary * qty;
    }
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
    // fields are populated. Surface a note so the UI flags it.
    adValoremRate = secondary + penalty;
    if (adValoremRate > 0 || primary > 0) {
      notes.push(`Computation code ${c.rateComputationCode} not in MVP ruleset — interpretation may be inaccurate`);
    }
  }

  const adValorem = adValoremRate * value;
  const amount = specific + adValorem;
  const effectiveAdValoremRate = value > 0 ? amount / value : adValoremRate || null;

  return { amount, effectiveAdValoremRate, notes };
}

export function calculateDuties(candidates: CandidateCodeListItem[], inputs: CalculatorInputs): CalculatorResult {
  const entryDate = new Date(inputs.entryDate);
  if (Number.isNaN(entryDate.getTime())) {
    throw new Error(`Invalid entryDate: ${inputs.entryDate}`);
  }

  const applicable = candidates.filter(
    (c) => withinDateWindow(c, entryDate) && countryMatches(c, inputs.countryOfOrigin) && applicabilityConditionsPass(c, inputs)
  );

  // Drop codes that are excluded by another code that's also applicable.
  // The exclusion graph is small per HTS line, so an O(n^2) scan is fine.
  const applicableKeys = new Set(applicable.map((c) => `${c.code}|${c.variant ?? ''}`));
  const surviving = applicable.filter((c) => {
    for (const rel of c.relatedCodes) {
      if (rel.kind !== TariffRelatedCodeKind.EXCLUDED_BY) continue;
      if (applicableKeys.has(`${rel.code}|${rel.variant ?? ''}`)) return false;
    }
    return true;
  });

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

  const baseCost = inputs.shipmentValueUsd;
  const hmf = inputs.modeOfTransport === 'OCEAN' ? baseCost * HMF_RATE : 0;
  let mpf = 0;
  if (baseCost > MPF_FORMAL_ENTRY_THRESHOLD) {
    mpf = Math.min(Math.max(baseCost * MPF_RATE, MPF_MIN_USD), MPF_MAX_USD);
  }
  const landedCost = baseCost + totalDuties + hmf + mpf;
  const effectiveDutyRate = baseCost > 0 ? totalDuties / baseCost : 0;

  return {
    hts10: inputs.hts10,
    inputs,
    lines,
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
      candidatesExcluded: applicable.length - surviving.length,
    },
  };
}
