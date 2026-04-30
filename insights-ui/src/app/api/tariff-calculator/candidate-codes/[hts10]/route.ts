import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { fetchAndPersistCandidateCodes, IngestCandidateCodesResult } from '@/utils/tariff-calculator/ingest-candidate-codes';
import { revalidateCandidateCodesTag } from '@/utils/tariff-calculator/cache-tags';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { TariffApplicabilityConditionKind, TariffCandidateCodeType, TariffCountryScopeType, TariffRelatedCodeKind } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';

// Public read of cached candidate codes for an HTS 10-digit line, plus the
// admin POST that pulls a fresh copy from the upstream feed.

export interface CandidateCodeApplicabilityCondition {
  kind: TariffApplicabilityConditionKind;
  fieldKey: string;
  fieldShouldEqual: string | null;
  threshold: string | null;
  includingThreshold: boolean | null;
  programCodes: string[];
  sortOrder: number;
}

export interface CandidateCodeRelatedCode {
  kind: TariffRelatedCodeKind;
  code: string;
  variant: string | null;
}

export interface CandidateCodeSpecialRate {
  spi: string;
  rateDescription: string;
  ratePrimary: string;
  rateSecondary: string;
  rateOther: string;
  ratePenalty: string;
  rateComputationCode: string;
}

export interface CandidateCodeListItem {
  id: string;
  code: string;
  variant: string | null;
  type: TariffCandidateCodeType;
  label: string;
  category: string | null;
  lineDescription: string;
  fullDescription: string;
  rateDescription: string;
  ratePrimary: string;
  rateSecondary: string;
  rateOther: string;
  ratePenalty: string;
  rateComputationCode: string;
  unitsOfMeasure: string[];
  effectiveFrom: string;
  effectiveTo: string;
  priority: number;
  requiresUserChoice: boolean;
  countryScopeType: TariffCountryScopeType;
  countryScopeCountries: string[];
  flagsForAntiDumping: boolean;
  flagsForCountervailing: boolean;
  applicabilityConditions: CandidateCodeApplicabilityCondition[];
  relatedCodes: CandidateCodeRelatedCode[];
  specialRates: CandidateCodeSpecialRate[];
}

export interface CandidateCodesResponse {
  hts10: string;
  candidates: CandidateCodeListItem[];
  lastFetchedAt: string | null;
}

function parseHts10(raw: string): string | null {
  return /^\d{10}$/.test(raw) ? raw : null;
}

async function getHandler(_req: NextRequest, dynamic: { params: Promise<{ hts10: string }> }): Promise<CandidateCodesResponse | null> {
  const { hts10: rawHts10 } = await dynamic.params;
  const hts10 = parseHts10(rawHts10);
  if (!hts10) return null;

  const htsRow = await prisma.htsCode.findUnique({
    where: { spaceId_htsCode10: { spaceId: KoalaGainsSpaceId, htsCode10: hts10 } },
    select: { id: true },
  });
  if (!htsRow) return null;

  const links = await prisma.htsCodeCandidateCode.findMany({
    where: { spaceId: KoalaGainsSpaceId, htsCodeId: htsRow.id },
    orderBy: { lastFetchedAt: 'desc' },
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

  const lastFetchedAt = links.length > 0 ? links[0].lastFetchedAt.toISOString() : null;

  // Sort candidates by stacking priority (low → high) so the calculator UI
  // can render them in the same order the duty engine evaluates them.
  const candidates: CandidateCodeListItem[] = links
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

  return { hts10, candidates, lastFetchedAt };
}

async function postHandler(
  _req: NextRequest,
  _user: KoalaGainsJwtTokenPayload,
  dynamic: { params: Promise<{ hts10: string }> }
): Promise<IngestCandidateCodesResult> {
  const { hts10: rawHts10 } = await dynamic.params;
  const hts10 = parseHts10(rawHts10);
  if (!hts10) {
    throw new Error(`Invalid HTS 10-digit code: ${rawHts10}`);
  }
  const result = await fetchAndPersistCandidateCodes(hts10);
  revalidateCandidateCodesTag(hts10);
  return result;
}

export const GET = withErrorHandlingV2<CandidateCodesResponse | null>(getHandler);
export const POST = withLoggedInAdmin<IngestCandidateCodesResult>(postHandler);
