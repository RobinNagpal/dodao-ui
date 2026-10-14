import type {
  MeasureEngineInput,
  MeasureEngineReferencedLine,
  TariffCompanyProgram,
  TariffEndUse,
  TariffProductType,
  TariffShipmentConfirmations,
} from '@/types/tariff-calculator-measures';
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
import { loadConfirmationFacts } from '@/utils/tariff-calculator/confirmation-facts';
import {
  calculateWithMeasures,
  CONTENT_INPUT_KINDS,
  importBanDutyNote,
  importProhibitionFor,
  lapsedClaimError,
  rateUoms,
  SPECIAL_PROGRAMS,
} from '@/utils/tariff-calculator/measures-engine';
import { TariffCandidateCodeType } from '@prisma/client';
import { FULL_POLARITY_DEGREES, isValidPolarity } from '@/utils/tariff-reports/shipment-duty';
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
// trade-deal claim (`claimedSpi`, or a single-entry `chosenSpis`) and `productType`. A claim the line does not
// offer is a 400, never ignored; a claim whose special rate points to Chapter 98/99 FTA quota headings is priced at
// the heading the quota facts (confirmations.facts ftaWithinQuota / ftaWithinSecondQuota / ftaSafeguardApplies) pick.
// The response keeps the same
// shape and adds `engine: 'official-measures'`.
// Optional `confirmations` ({ endUse, productDescriptionIds, companyProgram, usOriginIngredient }, issue #1790;
// facts: { <registry fact id>: true/false } from confirmation-facts.json, issue #1796)
// are the shipment facts the importer confirmed; measures conditioned on an unconfirmed
// fact are skipped and listed in `skippedMeasures` with the reason.
// Optional `contentValuesUsd` ({ steel, aluminum, copper, usContent }, issue #1796) are the
// declared content values that content-based measures (Section 232 derivatives, USMCA autos/parts)
// are charged on; each must be 0 – shipmentValueUsd.
// Optional `polarityDegrees` (above 0, at most 100) prices a base rate graded by sugar polarity (heading 1701:
// "… less 0.020668¢/kg for each degree under 100 degrees …"); without it such a rate is priced at 100° and the base
// line's notes say so.
// Optional `componentValuesUsd` ({ "lead content": 9000 }, issue #1812) are the declared values of the parts a base rate
// is charged on ("2.5% on the value of the lead content", "… on the value of the rifle + … the telescopic sight, if
// any"); each must be 0 – shipmentValueUsd. Optional `referencedLines` ([{ hts10, valueUsd?, unitsOfMeasure? }], at most
// 10) are the lines a base rate refers to ("The rate applicable to the article of which it is a part or accessory": one
// line; "… to each garment in the ensemble if separately entered": one per garment with its value; "… that article in
// the set subject to the highest rate of duty": one or more articles of the set, each with its own value and quantity
// when its rate is specific or compound, chapter 82 additional U.S. note 3); their rates are loaded from `hts_codes`.
// When an import ban (import-bans.json, issue #1796) matches the line, country, entry date and
// fact answers, the response carries `prohibited` next to the duty; the duty is labelled as applying
// only to goods imported before the ban and entered later.

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
  if (raw.facts !== undefined && raw.facts !== null) {
    if (!isObject(raw.facts)) throw badRequestError('confirmations.facts must be an object mapping fact id -> true/false');
    const known = new Set(loadConfirmationFacts().map((f) => f.id));
    const facts: Record<string, boolean> = {};
    for (const [id, v] of Object.entries(raw.facts)) {
      if (!known.has(id)) throw badRequestError(`confirmations.facts: unknown fact "${id}"`);
      if (v === null || v === undefined) continue;
      if (typeof v !== 'boolean') throw badRequestError(`confirmations.facts.${id} must be true or false`);
      facts[id] = v;
    }
    if (Object.keys(facts).length > 0) out.facts = facts;
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

type ContentValues = NonNullable<MeasureEngineInput['contentValuesUsd']>;

function parseContentValues(raw: unknown, customsValueUsd: number): ContentValues | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!isObject(raw)) throw badRequestError('contentValuesUsd must be an object such as { "steel": 40000 }');
  const out: ContentValues = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!(CONTENT_INPUT_KINDS as string[]).includes(k)) throw badRequestError(`contentValuesUsd keys must be ${CONTENT_INPUT_KINDS.join(', ')} (got "${k}")`);
    if (v === undefined || v === null || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) throw badRequestError(`contentValuesUsd.${k} must be a non-negative number`);
    if (n > customsValueUsd) throw badRequestError(`contentValuesUsd.${k} (${n}) can't be more than the shipment value (${customsValueUsd})`);
    out[k as keyof ContentValues] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseComponentValues(raw: unknown, customsValueUsd: number): Record<string, number> | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!isObject(raw)) throw badRequestError('componentValuesUsd must be an object such as { "lead content": 9000 }');
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!/^[a-z][a-z ,]{0,60}$/.test(key)) throw badRequestError(`componentValuesUsd key "${k}" is not a component name`);
    if (v === undefined || v === null || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) throw badRequestError(`componentValuesUsd["${k}"] must be a non-negative number`);
    if (n > customsValueUsd) throw badRequestError(`componentValuesUsd["${k}"] (${n}) can't be more than the shipment value (${customsValueUsd})`);
    out[key] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const MAX_REFERENCED_LINES = 10;

interface ReferencedLineRequest {
  hts10: string;
  valueUsd?: number;
  quantities?: Record<string, number>;
}

function parseReferencedLines(raw: unknown): ReferencedLineRequest[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) throw badRequestError('referencedLines must be an array of { hts10, valueUsd?, unitsOfMeasure? }');
  if (raw.length > MAX_REFERENCED_LINES) throw badRequestError(`referencedLines accepts at most ${MAX_REFERENCED_LINES} lines`);
  const out = raw.map((r, i): ReferencedLineRequest => {
    if (!isObject(r)) throw badRequestError(`referencedLines[${i}] must be an object`);
    const hts10 = typeof r.hts10 === 'string' ? r.hts10.replace(/[.\s-]/g, '') : '';
    if (!/^\d{10}$/.test(hts10)) throw badRequestError(`referencedLines[${i}].hts10 must be 10 digits`);
    const line: ReferencedLineRequest = { hts10 };
    if (r.valueUsd !== undefined && r.valueUsd !== null && r.valueUsd !== '') {
      const n = typeof r.valueUsd === 'number' ? r.valueUsd : Number(r.valueUsd);
      if (!Number.isFinite(n) || n <= 0) throw badRequestError(`referencedLines[${i}].valueUsd must be a positive number`);
      line.valueUsd = n;
    }
    const quantities = parseUnitsOfMeasure(r.unitsOfMeasure);
    if (Object.keys(quantities).length > 0) line.quantities = quantities;
    return line;
  });
  return out.length > 0 ? out : undefined;
}

/** The referenced lines with their HTS rates from `hts_codes` (an unknown code is a 404, like the line itself). */
async function loadReferencedLines(requests: ReferencedLineRequest[] | undefined): Promise<MeasureEngineReferencedLine[] | undefined> {
  if (!requests) return undefined;
  return Promise.all(
    requests.map(async (r) => {
      const line = await loadMeasureEngineLine(r.hts10);
      return {
        hts10: r.hts10,
        general: line.general,
        special: line.special,
        column2: line.column2 ?? null,
        ...(r.valueUsd !== undefined ? { valueUsd: r.valueUsd } : {}),
        ...(r.quantities ? { quantities: r.quantities } : {}),
      };
    })
  );
}

function parsePolarity(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!isValidPolarity(n)) throw badRequestError(`polarityDegrees must be a number above 0 and at most ${FULL_POLARITY_DEGREES}`);
  return n;
}

/**
 * The trade-deal claim for the official-measures engine. `claimedSpi` is the field; `chosenSpis` (the candidate-codes
 * engine's list) is accepted as the claim when it names exactly one program, so a claim sent that way is never dropped.
 * Two programs, or a `chosenSpis` that disagrees with `claimedSpi`, is a 400.
 */
function officialClaim(claimedSpi: string | undefined, chosenSpis: string[]): string | undefined {
  const chosen = Array.from(new Set(chosenSpis.map((s) => s.trim()).filter(Boolean)));
  if (chosen.length > 1) throw badRequestError(`Claim one trade program at a time (chosenSpis lists ${chosen.join(', ')}).`);
  if (chosen.length === 0) return claimedSpi;
  const fromChosen = parseClaimedSpi(chosen[0]);
  if (claimedSpi && fromChosen !== claimedSpi) throw badRequestError(`claimedSpi "${claimedSpi}" and chosenSpis "${chosen[0]}" name different programs.`);
  return fromChosen;
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

async function calculateWithOfficialMeasures(
  rawInputs: CalculatorInputs,
  confirmations: TariffShipmentConfirmations | undefined,
  contentValuesUsd: ContentValues | undefined,
  polarityDegrees: number | undefined,
  componentValuesUsd: Record<string, number> | undefined,
  referencedLineRequests: ReferencedLineRequest[] | undefined
): Promise<CalculatorResponse> {
  const inputs: CalculatorInputs = { ...rawInputs, claimedSpi: officialClaim(rawInputs.claimedSpi, rawInputs.chosenSpis) };
  const program = inputs.claimedSpi ? SPECIAL_PROGRAMS[inputs.claimedSpi] : undefined;
  if (inputs.claimedSpi && program?.countries && !program.countries.includes(inputs.countryOfOrigin)) {
    throw badRequestError(`${program.name} can only be claimed for goods from ${program.countries.join(', ')}.`);
  }
  const lapsedError = inputs.claimedSpi ? lapsedClaimError(inputs.claimedSpi, inputs.entryDate.slice(0, 10)) : null;
  if (lapsedError) throw badRequestError(lapsedError);

  const [line, loaded, referencedLines] = await Promise.all([loadMeasureEngineLine(inputs.hts10), loadMeasures(), loadReferencedLines(referencedLineRequests)]);
  const result = calculateWithMeasures(
    {
      hts10: inputs.hts10,
      countryOfOrigin: inputs.countryOfOrigin,
      customsValueUsd: inputs.shipmentValueUsd,
      quantities: inputs.unitsOfMeasure,
      claimedSpi: inputs.claimedSpi,
      productType: inputs.productType,
      confirmations,
      ...(contentValuesUsd ? { contentValuesUsd } : {}),
      ...(polarityDegrees !== undefined ? { polarityDegrees } : {}),
      ...(componentValuesUsd ? { componentValuesUsd } : {}),
      ...(referencedLines ? { referencedLines } : {}),
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
    notes: l.notes ?? [],
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
  const contentValuesUsd = parseContentValues(isObject(body) ? body.contentValuesUsd : undefined, inputs.shipmentValueUsd);
  const polarityDegrees = parsePolarity(isObject(body) ? body.polarityDegrees : undefined);
  const componentValuesUsd = parseComponentValues(isObject(body) ? body.componentValuesUsd : undefined, inputs.shipmentValueUsd);
  const referencedLines = parseReferencedLines(isObject(body) ? body.referencedLines : undefined);
  const response = (await isMeasuresEngineEnabledFor(inputs.hts10))
    ? await calculateWithOfficialMeasures(inputs, confirmations, contentValuesUsd, polarityDegrees, componentValuesUsd, referencedLines)
    : await calculateWithCandidateCodes(inputs);
  const ban = importProhibitionFor({ hts10: inputs.hts10, countryOfOrigin: inputs.countryOfOrigin, entryDate: inputs.entryDate, confirmations });
  return ban ? { ...response, prohibited: { ...ban, dutyNote: importBanDutyNote(ban) } } : response;
}

async function calculateWithCandidateCodes(inputs: CalculatorInputs): Promise<CalculatorResponse> {
  const { candidates, lastFetchedAt } = await loadCandidates(inputs.hts10);
  const result = calculateDuties(candidates, inputs);
  return { ...result, dataFreshness: await loadDataFreshness(inputs.hts10, lastFetchedAt), engine: 'candidate-codes' };
}

export const POST = withErrorHandlingV2<CalculatorResponse>(postHandler);
