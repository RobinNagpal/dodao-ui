import 'server-only';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CandidateCodeListItem } from '@/app/api/tariff-calculator/candidate-codes/[hts10]/route';
import { DataFreshness } from '@/utils/tariff-calculator/duty-engine';
import { getTariffReportRefByChapterNumber } from '@/utils/tariff-cross-links/hts-chapter-ref';

// Loads the cached candidate codes for an HTS 10-digit line (shared by the
// calculate and requirements routes) plus how fresh that cached data is.

// Thrown for the two "we don't have this code" cases. The error middleware reads
// `statusCode` and returns a 404 (instead of a 500), so a typo'd or unknown HTS
// code reads as "not found" to the user and to crawlers rather than logging a
// server error. The message is shown directly in the UI, so keep it plain-English
// and free of internal hints.
export class HtsLookupError extends Error {
  readonly statusCode = 404;
  /** Trust marker: withErrorHandling only honours `statusCode` on errors that set this. */
  readonly isClientError = true;
  constructor(message: string) {
    super(message);
    this.name = 'HtsLookupError';
  }
}

export function formatHts10(hts10: string): string {
  return hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

export interface LoadedCandidates {
  candidates: CandidateCodeListItem[];
  // Latest upstream fetch time across this line's candidate links.
  lastFetchedAt: string | null;
}

export async function loadCandidates(hts10: string): Promise<LoadedCandidates> {
  const htsRow = await prisma.htsCode.findUnique({
    where: { spaceId_htsCode10: { spaceId: KoalaGainsSpaceId, htsCode10: hts10 } },
    select: { id: true },
  });
  if (!htsRow) {
    throw new HtsLookupError(`We couldn't find HTS code ${formatHts10(hts10)} in the US tariff schedule. Double-check the 10-digit code and try again.`);
  }

  const links = await prisma.htsCodeCandidateCode.findMany({
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
  if (links.length === 0) {
    throw new HtsLookupError(`We don't have duty data for HTS code ${formatHts10(hts10)} yet. Try a different code or check back later.`);
  }

  const lastFetchedMs = Math.max(...links.map((l) => l.lastFetchedAt.getTime()));

  const candidates = links
    .map((l) => l.candidateCode)
    .sort((a, b) => a.priority - b.priority || a.code.localeCompare(b.code))
    .map(
      (c): CandidateCodeListItem => ({
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
      })
    );

  return { candidates, lastFetchedAt: Number.isFinite(lastFetchedMs) ? new Date(lastFetchedMs).toISOString() : null };
}

// Freshness of the cached extra-duty data plus the chapter report link for the
// HTS chapter (first two digits). A missing report just means no link.
export async function loadDataFreshness(hts10: string, lastFetchedAt: string | null): Promise<DataFreshness> {
  const chapterNumber = parseInt(hts10.slice(0, 2), 10);
  const report = chapterNumber >= 1 && chapterNumber <= 99 ? await getTariffReportRefByChapterNumber(chapterNumber) : null;
  return { lastUpdatedAt: lastFetchedAt, chapterReportHref: report?.href ?? null };
}
