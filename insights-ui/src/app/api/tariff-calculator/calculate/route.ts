import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CandidateCodeListItem } from '@/app/api/tariff-calculator/candidate-codes/[hts10]/route';
import { calculateDuties, CalculatorInputs, CalculatorResult, TRANSPORT_MODES, TransportMode } from '@/utils/tariff-calculator/duty-engine';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// POST /api/tariff-calculator/calculate
//
// Validates the user-supplied calculator inputs, lazily ingests the
// candidate-codes feed for the requested HTS 10-digit line if we don't
// already have it, then runs the duty engine and returns the breakdown.

// Thrown for the two "we don't have this code" cases in loadCandidates(). The
// error middleware reads `statusCode` and returns a 404 (instead of a 500), so a
// typo'd or unknown HTS code reads as "not found" to the user and to crawlers
// rather than logging a server error. The message is shown directly in the UI,
// so keep it plain-English and free of internal hints.
class HtsLookupError extends Error {
  readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'HtsLookupError';
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function formatHts10(hts10: string): string {
  return hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

function parseHts10(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('hts10 is required');
  const digits = raw.replace(/[.\s-]/g, '');
  if (!/^\d{10}$/.test(digits)) throw new Error(`hts10 must be 10 digits (got "${raw}")`);
  return digits;
}

function parseTransportMode(raw: unknown): TransportMode {
  if (typeof raw !== 'string' || !(TRANSPORT_MODES as readonly string[]).includes(raw)) {
    throw new Error(`modeOfTransport must be one of ${TRANSPORT_MODES.join(', ')}`);
  }
  return raw as TransportMode;
}

function parseIsoDate(raw: unknown, name: string): string {
  if (typeof raw !== 'string') throw new Error(`${name} must be an ISO date string`);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`${name} is not a valid date: ${raw}`);
  return d.toISOString();
}

function parseUnitsOfMeasure(raw: unknown): Record<string, number> {
  if (raw === undefined || raw === null) return {};
  if (!isObject(raw)) throw new Error('unitsOfMeasure must be an object mapping UOM -> quantity');
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) throw new Error(`unitsOfMeasure["${k}"] must be a non-negative number`);
    out[k.toUpperCase()] = n;
  }
  return out;
}

function parseChosenSpis(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new Error('chosenSpis must be an array of strings');
  return raw.map((s, i) => {
    if (typeof s !== 'string') throw new Error(`chosenSpis[${i}] must be a string`);
    return s;
  });
}

function parseChosenExclusions(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new Error('chosenExclusions must be an array of strings');
  return raw.map((s, i) => {
    if (typeof s !== 'string') throw new Error(`chosenExclusions[${i}] must be a string`);
    return s;
  });
}

function parseCalculatorInputs(body: unknown): CalculatorInputs {
  if (!isObject(body)) throw new Error('Request body must be an object');
  const hts10 = parseHts10(body.hts10);
  const valueRaw = body.shipmentValueUsd;
  const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);
  if (!Number.isFinite(value) || value <= 0) throw new Error('shipmentValueUsd must be a positive number');
  const country = body.countryOfOrigin;
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) throw new Error('countryOfOrigin must be a 2-letter ISO country code');
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
  };
}

async function loadCandidates(hts10: string): Promise<CandidateCodeListItem[]> {
  const htsRow = await prisma.htsCode.findUnique({
    where: { spaceId_htsCode10: { spaceId: KoalaGainsSpaceId, htsCode10: hts10 } },
    select: { id: true },
  });
  if (!htsRow) {
    throw new HtsLookupError(`We couldn't find HTS code ${formatHts10(hts10)} in the US tariff schedule. Double-check the 10-digit code and try again.`);
  }

  const fetchLinks = () =>
    prisma.htsCodeCandidateCode.findMany({
      where: { spaceId: KoalaGainsSpaceId, htsCodeId: htsRow.id },
      include: {
        candidateCode: {
          include: {
            applicabilityConditions: { orderBy: { sortOrder: 'asc' } },
            relatedCodes: { orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }] },
            specialRates: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

  let links = await fetchLinks();
  if (links.length === 0) {
    throw new HtsLookupError(`We don't have duty data for HTS code ${formatHts10(hts10)} yet. Try a different code or check back later.`);
  }

  return links
    .map((l) => l.candidateCode)
    .sort((a, b) => a.priority - b.priority || a.code.localeCompare(b.code))
    .map((c) => ({
      id: c.id,
      code: c.code,
      variant: c.variant,
      type: c.type,
      label: c.label,
      category: c.category,
      lineDescription: c.lineDescription,
      fullDescription: c.fullDescription,
      rateDescription: c.rateDescription,
      ratePrimary: c.ratePrimary,
      rateSecondary: c.rateSecondary,
      rateOther: c.rateOther,
      ratePenalty: c.ratePenalty,
      rateComputationCode: c.rateComputationCode,
      unitsOfMeasure: c.unitsOfMeasure,
      effectiveFrom: c.effectiveFrom.toISOString(),
      effectiveTo: c.effectiveTo.toISOString(),
      priority: c.priority,
      requiresUserChoice: c.requiresUserChoice,
      countryScopeType: c.countryScopeType,
      countryScopeCountries: c.countryScopeCountries,
      flagsForAntiDumping: c.flagsForAntiDumping,
      flagsForCountervailing: c.flagsForCountervailing,
      applicabilityConditions: c.applicabilityConditions.map((ac) => ({
        kind: ac.kind,
        fieldKey: ac.fieldKey,
        fieldShouldEqual: ac.fieldShouldEqual,
        threshold: ac.threshold,
        includingThreshold: ac.includingThreshold,
        programCodes: ac.programCodes,
        sortOrder: ac.sortOrder,
      })),
      relatedCodes: c.relatedCodes.map((rc) => ({ kind: rc.kind, code: rc.code, variant: rc.variant })),
      specialRates: c.specialRates.map((sr) => ({
        spi: sr.spi,
        rateDescription: sr.rateDescription,
        ratePrimary: sr.ratePrimary,
        rateSecondary: sr.rateSecondary,
        rateOther: sr.rateOther,
        ratePenalty: sr.ratePenalty,
        rateComputationCode: sr.rateComputationCode,
      })),
    }));
}

async function postHandler(req: NextRequest): Promise<CalculatorResult> {
  const inputs = parseCalculatorInputs(await req.json());
  const candidates = await loadCandidates(inputs.hts10);
  return calculateDuties(candidates, inputs);
}

export const POST = withErrorHandlingV2<CalculatorResult>(postHandler);
