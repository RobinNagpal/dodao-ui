import type { TariffCompanyProgram, TariffEndUse, TariffProductType, TariffShipmentConfirmations } from '@/types/tariff-calculator-measures';
import {
  calculateDuties,
  CalculatorInputs,
  CalculatorResponse,
  DutyLine,
  entryFees,
  TRANSPORT_MODES,
  TransportMode,
} from '@/utils/tariff-calculator/duty-engine';
import { formatHts10, loadCandidates, loadDataFreshness } from '@/utils/tariff-calculator/load-candidates';
import { isMeasuresEngineEnabledFor, loadMeasureEngineLine, loadMeasures } from '@/utils/tariff-calculator/load-measures';
import { calculateWithMeasures, rateUoms, SPECIAL_PROGRAMS } from '@/utils/tariff-calculator/measures-engine';
import { TariffCandidateCodeType } from '@prisma/client';
import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// POST /api/tariff-calculator/calculate
//
// Validates the user-supplied calculator inputs, loads the cached candidate
// codes for the requested HTS 10-digit line, runs the duty engine and returns
// the breakdown plus how fresh the cached extra-duty data is. Bad input and a
// missing quantity for a per-unit duty are 400s; an unknown HTS code is a 404.
//
// For HTS chapters listed in the TARIFF_CALC_MEASURES_ENABLED App Setting the
// official-measures engine prices the line instead (issue #1785): base rates from
// `hts_codes`, extra duties from the reviewed `tariff_measures`, with the optional
// trade-deal claim (`claimedSpi`) and `productType`. The response keeps the same
// shape and adds `engine: 'official-measures'`.
// Optional `confirmations` ({ endUse, productDescriptionIds, companyProgram, usOriginIngredient }, issue #1790)
// are the shipment facts the importer confirmed; measures conditioned on an unconfirmed
// fact are skipped and listed in `skippedMeasures` with the reason.

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseHts10(raw: unknown): string {
  if (typeof raw !== 'string') throw badRequestError('hts10 is required');
  const digits = raw.replace(/[.\s-]/g, '');
  if (!/^\d{10}$/.test(digits)) throw badRequestError(`hts10 must be 10 digits (got "${raw}")`);
  return digits;
}

function parseTransportMode(raw: unknown): TransportMode {
  if (typeof raw !== 'string' || !(TRANSPORT_MODES as readonly string[]).includes(raw)) {
    throw badRequestError(`modeOfTransport must be one of ${TRANSPORT_MODES.join(', ')}`);
  }
  return raw as TransportMode;
}

function parseIsoDate(raw: unknown, name: string): string {
  if (typeof raw !== 'string') throw badRequestError(`${name} must be an ISO date string`);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw badRequestError(`${name} is not a valid date: ${raw}`);
  return d.toISOString();
}

function parseUnitsOfMeasure(raw: unknown): Record<string, number> {
  if (raw === undefined || raw === null) return {};
  if (!isObject(raw)) throw badRequestError('unitsOfMeasure must be an object mapping UOM -> quantity');
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) throw badRequestError(`unitsOfMeasure["${k}"] must be a non-negative number`);
    out[k.toUpperCase()] = n;
  }
  return out;
}

function parseChosenSpis(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw badRequestError('chosenSpis must be an array of strings');
  return raw.map((s, i) => {
    if (typeof s !== 'string') throw badRequestError(`chosenSpis[${i}] must be a string`);
    return s;
  });
}

function parseChosenExclusions(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw badRequestError('chosenExclusions must be an array of strings');
  return raw.map((s, i) => {
    if (typeof s !== 'string') throw badRequestError(`chosenExclusions[${i}] must be a string`);
    return s;
  });
}

const PRODUCT_TYPES: TariffProductType[] = ['patented', 'generic', 'specialty', 'other'];

function parseClaimedSpi(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string' || !/^[A-Z]{1,2}[+*]?$/.test(raw)) throw badRequestError('claimedSpi must be a special program code such as "S" or "KR"');
  return raw;
}

function parseProductType(raw: unknown): TariffProductType | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string' || !(PRODUCT_TYPES as string[]).includes(raw)) throw badRequestError(`productType must be one of ${PRODUCT_TYPES.join(', ')}`);
  return raw as TariffProductType;
}

const END_USES: TariffEndUse[] = ['pharmaceutical', 'research'];
const COMPANY_PROGRAMS: TariffCompanyProgram[] = ['onshoring', 'mfnPricing', 'annexCompany'];
const MAX_PRODUCT_DESCRIPTION_IDS = 50;

function parseConfirmations(raw: unknown): TariffShipmentConfirmations | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!isObject(raw)) throw badRequestError('confirmations must be an object');
  const out: TariffShipmentConfirmations = {};
  if (raw.endUse !== undefined && raw.endUse !== null && raw.endUse !== '') {
    if (typeof raw.endUse !== 'string' || !(END_USES as string[]).includes(raw.endUse))
      throw badRequestError(`confirmations.endUse must be one of ${END_USES.join(', ')}`);
    out.endUse = raw.endUse as TariffEndUse;
  }
  if (raw.companyProgram !== undefined && raw.companyProgram !== null && raw.companyProgram !== '') {
    if (typeof raw.companyProgram !== 'string' || !(COMPANY_PROGRAMS as string[]).includes(raw.companyProgram)) {
      throw badRequestError(`confirmations.companyProgram must be one of ${COMPANY_PROGRAMS.join(', ')}`);
    }
    out.companyProgram = raw.companyProgram as TariffCompanyProgram;
  }
  if (raw.usOriginIngredient !== undefined && raw.usOriginIngredient !== null) {
    if (typeof raw.usOriginIngredient !== 'boolean') throw badRequestError('confirmations.usOriginIngredient must be true or false');
    if (raw.usOriginIngredient) out.usOriginIngredient = true;
  }
  if (raw.productDescriptionIds !== undefined && raw.productDescriptionIds !== null) {
    const ids = raw.productDescriptionIds;
    if (!Array.isArray(ids)) throw badRequestError('confirmations.productDescriptionIds must be an array of strings');
    if (ids.length > MAX_PRODUCT_DESCRIPTION_IDS)
      throw badRequestError(`confirmations.productDescriptionIds accepts at most ${MAX_PRODUCT_DESCRIPTION_IDS} ids`);
    const parsed = ids.map((id, i) => {
      if (typeof id !== 'string' || !/^[\w.()-]{1,80}$/.test(id)) throw badRequestError(`confirmations.productDescriptionIds[${i}] must be a description id`);
      return id;
    });
    if (parsed.length > 0) out.productDescriptionIds = Array.from(new Set(parsed));
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseCalculatorInputs(body: unknown): CalculatorInputs {
  if (!isObject(body)) throw badRequestError('Request body must be an object');
  const hts10 = parseHts10(body.hts10);
  const valueRaw = body.shipmentValueUsd;
  const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);
  if (!Number.isFinite(value) || value <= 0) throw badRequestError('shipmentValueUsd must be a positive number');
  const country = body.countryOfOrigin;
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) throw badRequestError('countryOfOrigin must be a 2-letter ISO country code');
  return {
    hts10,
    shipmentValueUsd: value,
    countryOfOrigin: country,
    unitsOfMeasure: parseUnitsOfMeasure(body.unitsOfMeasure),
    modeOfTransport: parseTransportMode(body.modeOfTransport),
    entryDate: parseIsoDate(body.entryDate, 'entryDate'),
    dateOfLoading: parseIsoDate(body.dateOfLoading, 'dateOfLoading'),
    chosenSpis: parseChosenSpis(body.chosenSpis),
    chosenExclusions: parseChosenExclusions(body.chosenExclusions),
    claimedSpi: parseClaimedSpi(body.claimedSpi),
    productType: parseProductType(body.productType),
  };
}

async function calculateWithOfficialMeasures(inputs: CalculatorInputs, confirmations: TariffShipmentConfirmations | undefined): Promise<CalculatorResponse> {
  const program = inputs.claimedSpi ? SPECIAL_PROGRAMS[inputs.claimedSpi] : undefined;
  if (inputs.claimedSpi && program?.countries && !program.countries.includes(inputs.countryOfOrigin)) {
    throw badRequestError(`${program.name} can only be claimed for goods from ${program.countries.join(', ')}.`);
  }
  if (program?.lapsed) throw badRequestError(`${program.name} is no longer in force, so it can't be claimed.`);

  const [line, loaded] = await Promise.all([loadMeasureEngineLine(inputs.hts10), loadMeasures()]);
  const result = calculateWithMeasures(
    {
      hts10: inputs.hts10,
      countryOfOrigin: inputs.countryOfOrigin,
      customsValueUsd: inputs.shipmentValueUsd,
      quantities: inputs.unitsOfMeasure,
      claimedSpi: inputs.claimedSpi,
      productType: inputs.productType,
      confirmations,
      entryDate: inputs.entryDate,
    },
    line,
    loaded.measures
  );
  if (result.error) throw badRequestError(result.error);

  const value = inputs.shipmentValueUsd;
  const lines: DutyLine[] = result.lines.map((l, i) => ({
    candidateId: `${l.code}-${i}`,
    code: l.code === 'base' ? formatHts10(line.hts10) : l.code,
    variant: null,
    type: l.code === 'base' ? TariffCandidateCodeType.COMMODITY_CODE : TariffCandidateCodeType.SPECIAL_CODE,
    label: l.label,
    category: null,
    rateDescription: l.rateText,
    dutyAmount: l.amountUsd,
    effectiveAdValoremRate: value > 0 ? l.amountUsd / value : null,
    notes: [],
    sources: l.sources,
  }));
  const primaryUoms = Array.from(new Set([line.general, line.column2 ?? null].flatMap((t) => rateUoms(t)))).sort();
  const totalDuties = result.totalDutyUsd;
  const { hmf, mpf } = entryFees(value, inputs.modeOfTransport);
  const freshness = await loadDataFreshness(inputs.hts10, loaded.reviewedAt);

  return {
    hts10: inputs.hts10,
    inputs,
    lines,
    potentialExclusions: [],
    totals: {
      baseCost: value,
      totalDuties,
      hmf,
      mpf,
      landedCost: value + totalDuties + hmf + mpf,
      effectiveDutyRate: value > 0 ? totalDuties / value : 0,
    },
    diagnostics: {
      candidatesEvaluated: loaded.measures.length,
      candidatesApplicable: result.lines.length - 1,
      candidatesExcluded: result.skipped.length,
      requiresQuantity: primaryUoms.length > 0,
      primaryUoms,
    },
    dataFreshness: { ...freshness, engine: 'official-measures', htsEdition: loaded.htsEdition },
    engine: 'official-measures',
    skippedMeasures: result.skipped,
  };
}

async function postHandler(req: NextRequest): Promise<CalculatorResponse> {
  const body: unknown = await req.json().catch(() => null);
  const inputs = parseCalculatorInputs(body);
  const confirmations = parseConfirmations(isObject(body) ? body.confirmations : undefined);
  if (await isMeasuresEngineEnabledFor(inputs.hts10)) return calculateWithOfficialMeasures(inputs, confirmations);
  const { candidates, lastFetchedAt } = await loadCandidates(inputs.hts10);
  const result = calculateDuties(candidates, inputs);
  return { ...result, dataFreshness: await loadDataFreshness(inputs.hts10, lastFetchedAt), engine: 'candidate-codes' };
}

export const POST = withErrorHandlingV2<CalculatorResponse>(postHandler);
