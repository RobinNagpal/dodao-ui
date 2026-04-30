// Persist a list of upstream candidate codes for a given HTS 10-digit line.
// Each candidate code is keyed globally by (spaceId, code, variant) — many HTS
// lines reference the same special code, so we upsert and link via the
// HtsCodeCandidateCode join table rather than duplicating per HTS line.

import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Prisma, TariffCandidateCode } from '@prisma/client';
import { fetchCandidateCodes, mapApplicabilityKind, mapCodeType, mapCountryScope, RELATED_KIND_BY_FIELD, UpstreamCandidateCode } from './upstream-feed';

export interface IngestCandidateCodesResult {
  hts10: string;
  candidatesProcessed: number;
  candidatesCreated: number;
  candidatesUpdated: number;
  linksCreated: number;
}

// Look up the HtsCode row by its 10-digit code. Returns null when missing
// — callers can treat that as a 404 (we won't ingest candidate codes for an
// HTS line we don't know about, since the join table requires its id).
async function findHtsCodeId(hts10: string): Promise<string | null> {
  const row = await prisma.htsCode.findUnique({
    where: { spaceId_htsCode10: { spaceId: KoalaGainsSpaceId, htsCode10: hts10 } },
    select: { id: true },
  });
  return row?.id ?? null;
}

function buildScalarData(c: UpstreamCandidateCode): Omit<Prisma.TariffCandidateCodeCreateInput, 'spaceId'> {
  const scope = mapCountryScope(c.countryScope);
  return {
    code: c.codeVariant.code,
    variant: c.codeVariant.variant,
    type: mapCodeType(c.type),
    lineDescription: c.lineDescription,
    fullDescription: c.fullDescription,
    effectiveFrom: new Date(c.effectiveFrom),
    effectiveTo: new Date(c.effectiveTo),
    rateDescription: c.rateDescription,
    ratePrimary: c.rateInfo.primaryRate,
    rateSecondary: c.rateInfo.secondaryRate,
    rateOther: c.rateInfo.otherRate,
    ratePenalty: c.rateInfo.penaltyRate,
    rateComputationCode: c.rateInfo.computationCode,
    unitsOfMeasure: c.unitsOfMeasure,
    flagsForAntiDumping: c.flagsForAntiDumping,
    flagsForCountervailing: c.flagsForCountervailing,
    priority: c.priority,
    requiresUserChoice: c.requiresUserChoice,
    countryScopeType: scope.type,
    countryScopeCountries: scope.countries,
    label: c.label,
    category: c.category,
    tags: c.tags,
    pgaFlags: c.pgaFlags,
    feeFlags: c.feeFlags,
    parentCodes: c.parentCodes,
    lineSplitField: c.lineSplitField,
    lineSplitConditions: (c.lineSplitConditions ?? null) as Prisma.InputJsonValue | null,
    relatesToCodesDigits: (c.relatesToCodesDigits ?? null) as Prisma.InputJsonValue | null,
  };
}

// Replace child rows for a candidate code in a single transaction step. We
// delete-then-insert rather than diff because the upstream feed is the
// source of truth for these arrays and they're small (< ~50 rows each).
async function replaceChildren(tx: Prisma.TransactionClient, candidate: TariffCandidateCode, c: UpstreamCandidateCode): Promise<void> {
  await tx.tariffCandidateSpecialRate.deleteMany({ where: { candidateCodeId: candidate.id } });
  await tx.tariffCandidateApplicabilityCondition.deleteMany({ where: { candidateCodeId: candidate.id } });
  await tx.tariffCandidateRelatedCode.deleteMany({ where: { candidateCodeId: candidate.id } });
  await tx.tariffTradeAnalytic.deleteMany({ where: { candidateCodeId: candidate.id } });

  if (c.specialRates.length > 0) {
    await tx.tariffCandidateSpecialRate.createMany({
      data: c.specialRates.map((sr, i) => ({
        candidateCodeId: candidate.id,
        spi: sr.spi,
        rateDescription: sr.rateDescription,
        ratePrimary: sr.rateInfo.primaryRate,
        rateSecondary: sr.rateInfo.secondaryRate,
        rateOther: sr.rateInfo.otherRate,
        ratePenalty: sr.rateInfo.penaltyRate,
        rateComputationCode: sr.rateInfo.computationCode,
        sortOrder: i,
        spaceId: KoalaGainsSpaceId,
      })),
    });
  }

  if (c.applicabilityConditions.length > 0) {
    await tx.tariffCandidateApplicabilityCondition.createMany({
      data: c.applicabilityConditions.map((cond, i) => ({
        candidateCodeId: candidate.id,
        kind: mapApplicabilityKind(cond.__typename),
        fieldKey: cond.fieldKey,
        fieldShouldEqual: cond.__typename === 'CustomsTariffEquals' ? cond.fieldShouldEqual : null,
        threshold: cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.threshold : null,
        includingThreshold: cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.includingThreshold : null,
        programCodes: cond.__typename === 'CustomsTariffSomeSpiApplied' ? cond.programCodes : [],
        sortOrder: i,
        spaceId: KoalaGainsSpaceId,
      })),
    });
  }

  const relatedRows: Prisma.TariffCandidateRelatedCodeCreateManyInput[] = [];
  for (const fieldName of ['excludedByCodes', 'replacesCodes', 'relatedCodes'] as const) {
    const arr = c[fieldName];
    arr.forEach((r, i) => {
      relatedRows.push({
        candidateCodeId: candidate.id,
        kind: RELATED_KIND_BY_FIELD[fieldName],
        code: r.code,
        variant: r.variant,
        sortOrder: i,
        spaceId: KoalaGainsSpaceId,
      });
    });
  }
  if (relatedRows.length > 0) {
    await tx.tariffCandidateRelatedCode.createMany({ data: relatedRows });
  }

  for (const ta of c.tradeAnalytics) {
    const analytic = await tx.tariffTradeAnalytic.create({
      data: {
        candidateCodeId: candidate.id,
        analyticsLevel: ta.analyticsLevel,
        htsCode10: ta.htsCode,
        date: ta.date,
        countryName: ta.countryOfOrigin.countryName,
        usCustomsCountryCode: ta.countryOfOrigin.usCustomsCountryCode,
        totalCustomsValue: new Prisma.Decimal(ta.totalCustomsValue),
        totalCalculatedDuty: new Prisma.Decimal(ta.totalCalculatedDuty),
        totalDutyRate: new Prisma.Decimal(ta.totalDutyRate),
        spaceId: KoalaGainsSpaceId,
      },
    });
    if (ta.importPrograms.length > 0) {
      await tx.tariffTradeAnalyticImportProgram.createMany({
        data: ta.importPrograms.map((p) => ({
          tradeAnalyticId: analytic.id,
          programName: p.importProgram.programName,
          programIndicator: p.importProgram.programIndicator,
          generalNote: p.importProgram.generalNote,
          spiSpecialProgramIndicator: p.importProgram.customsTariffSpi.specialProgramIndicator,
          spiAgreementName: p.importProgram.customsTariffSpi.agreementName,
          spiGeneralNote: p.importProgram.customsTariffSpi.generalNote,
          spiExcludeMpf: p.importProgram.customsTariffSpi.excludeMpf,
          countriesOfOrigin: p.importProgram.countriesOfOrigin,
          spiCountriesOfOrigin: p.importProgram.customsTariffSpi.countriesOfOrigin,
          customsValue: new Prisma.Decimal(p.customsValue),
          calculatedDuty: new Prisma.Decimal(p.calculatedDuty),
          dutyRate: new Prisma.Decimal(p.dutyRate),
          percentOfLineValue: new Prisma.Decimal(p.percentOfLineValue),
          spaceId: KoalaGainsSpaceId,
        })),
      });
    }
  }
}

export async function persistCandidateCodes(hts10: string, upstream: UpstreamCandidateCode[]): Promise<IngestCandidateCodesResult> {
  const htsCodeId = await findHtsCodeId(hts10);
  if (!htsCodeId) {
    throw new Error(`HTS code ${hts10} not found in hts_codes — ingest the HTSUS chapter first.`);
  }

  let created = 0;
  let updated = 0;
  let linksCreated = 0;
  const fetchedAt = new Date();

  for (const c of upstream) {
    const scalar = buildScalarData(c);
    // Variant is nullable, so the compound unique can't be used when it's
    // null — fall back to findFirst with an `is null` filter in that case.
    const existing = await prisma.tariffCandidateCode.findFirst({
      where: { spaceId: KoalaGainsSpaceId, code: c.codeVariant.code, variant: c.codeVariant.variant },
    });

    const candidate = await prisma.$transaction(async (tx) => {
      const row = existing
        ? await tx.tariffCandidateCode.update({ where: { id: existing.id }, data: scalar })
        : await tx.tariffCandidateCode.create({ data: { ...scalar, spaceId: KoalaGainsSpaceId } });
      await replaceChildren(tx, row, c);
      return row;
    });

    if (existing) updated++;
    else created++;

    const existingLink = await prisma.htsCodeCandidateCode.findUnique({
      where: { spaceId_htsCodeId_candidateCodeId: { spaceId: KoalaGainsSpaceId, htsCodeId, candidateCodeId: candidate.id } },
      select: { id: true },
    });
    await prisma.htsCodeCandidateCode.upsert({
      where: { spaceId_htsCodeId_candidateCodeId: { spaceId: KoalaGainsSpaceId, htsCodeId, candidateCodeId: candidate.id } },
      update: { lastFetchedAt: fetchedAt },
      create: { spaceId: KoalaGainsSpaceId, htsCodeId, candidateCodeId: candidate.id, lastFetchedAt: fetchedAt },
    });
    if (!existingLink) linksCreated++;
  }

  return {
    hts10,
    candidatesProcessed: upstream.length,
    candidatesCreated: created,
    candidatesUpdated: updated,
    linksCreated,
  };
}

// Convenience wrapper used by both the admin ingest route and any
// on-demand ingest path. Returns the freshly-fetched candidate codes
// alongside the persistence summary.
export async function fetchAndPersistCandidateCodes(hts10: string): Promise<IngestCandidateCodesResult> {
  const upstream = await fetchCandidateCodes(hts10);
  return persistCandidateCodes(hts10, upstream);
}
