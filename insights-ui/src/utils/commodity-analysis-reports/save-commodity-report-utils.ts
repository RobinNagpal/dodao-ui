import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  CommodityAnalysisCategory,
  CommodityCategoryAnalysisResponse,
  CommodityFinalSummaryResponse,
  CommodityKeyFactsResponse,
} from '@/types/commodity/commodity-analysis-types';
import { findCommodityFactorDefinition, getCommodityFactorsForCategory } from '@/utils/commodity-analysis-reports/commodity-analysis-factor-utils';
import { fetchCommodityBySlug } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { Prisma } from '@prisma/client';

/**
 * Persist one scored-category analysis: the category summary, its factor
 * verdicts (replaced atomically so a re-run never leaves stale rows), and the
 * cached per-category pass count. Mirrors `saveEtfFactorAnalysisResponse`.
 */
export async function saveCommodityFactorAnalysisResponse(
  slug: string,
  response: CommodityCategoryAnalysisResponse,
  categoryKey: CommodityAnalysisCategory
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const commodity = await fetchCommodityBySlug(slug);

  // Resolve each returned factor to its canonical key; drop unknown keys so they
  // can't become stale rows on the replace below.
  const validFactors = response.factors.flatMap((factor) => {
    const def = findCommodityFactorDefinition(categoryKey, factor.factorKey);
    if (!def) {
      console.warn(`Unknown commodity factor key: ${factor.factorKey} for ${slug}`);
      return [];
    }
    return [{ ...factor, factorKey: def.factorKey }];
  });

  const expectedFactorCount = getCommodityFactorsForCategory(categoryKey).length;
  if (validFactors.length !== expectedFactorCount) {
    throw new Error(
      `Commodity ${slug} ${categoryKey}: expected ${expectedFactorCount} factor result(s) but got ${validFactors.length} valid (LLM returned ${response.factors.length}). Aborting save to avoid persisting an incomplete report.`
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.commodityCategoryAnalysisResult.upsert({
      where: {
        spaceId_commodityId_categoryKey: { spaceId, commodityId: commodity.id, categoryKey },
      },
      update: {
        summary: response.overallSummary,
        overallAnalysisDetails: response.overallAnalysisDetails,
        updatedAt: new Date(),
      },
      create: {
        spaceId,
        commodityId: commodity.id,
        categoryKey,
        summary: response.overallSummary,
        overallAnalysisDetails: response.overallAnalysisDetails,
      },
    });

    await tx.commodityAnalysisCategoryFactorResult.deleteMany({
      where: { spaceId, commodityId: commodity.id, categoryKey },
    });

    await tx.commodityAnalysisCategoryFactorResult.createMany({
      data: validFactors.map((factor) => ({
        spaceId,
        commodityId: commodity.id,
        categoryKey,
        factorKey: factor.factorKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
      })),
    });
  });

  const score = validFactors.filter((f) => f.result && f.result.toLowerCase().includes('pass')).length;
  await updateCommodityCachedScore(commodity.id, categoryKey, score);
}

export async function saveCommodityKeyFactsResponse(slug: string, response: CommodityKeyFactsResponse): Promise<void> {
  const commodity = await fetchCommodityBySlug(slug);

  await prisma.commodityKeyFactsReport.upsert({
    where: { commodityId: commodity.id },
    update: {
      keyFacts: response.keyFacts,
      greenFlags: (response.greenFlags ?? []) as unknown as Prisma.InputJsonValue,
      redFlags: (response.redFlags ?? []) as unknown as Prisma.InputJsonValue,
      mainUses: (response.mainUses ?? []) as unknown as Prisma.InputJsonValue,
      topProducers: (response.topProducers ?? []) as unknown as Prisma.InputJsonValue,
      waysToInvest: (response.waysToInvest ?? []) as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
    create: {
      spaceId: commodity.spaceId,
      commodityId: commodity.id,
      keyFacts: response.keyFacts,
      greenFlags: (response.greenFlags ?? []) as unknown as Prisma.InputJsonValue,
      redFlags: (response.redFlags ?? []) as unknown as Prisma.InputJsonValue,
      mainUses: (response.mainUses ?? []) as unknown as Prisma.InputJsonValue,
      topProducers: (response.topProducers ?? []) as unknown as Prisma.InputJsonValue,
      waysToInvest: (response.waysToInvest ?? []) as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function saveCommodityFinalSummaryResponse(slug: string, response: CommodityFinalSummaryResponse): Promise<void> {
  const commodity = await fetchCommodityBySlug(slug);
  await prisma.commodity.update({
    where: { id: commodity.id },
    data: { summary: response.summary, updatedAt: new Date() },
  });
}

/**
 * Update the single flat cached-score row: set the category being saved, keep
 * the others, and recompute `finalScore` as the sum of the four category pass
 * counts (Future Outlook counts as 0 until it is generated).
 */
async function updateCommodityCachedScore(commodityId: string, categoryKey: CommodityAnalysisCategory, categoryScore: number): Promise<void> {
  const existing = await prisma.commodityCachedScore.findUnique({ where: { commodityId } });

  const supply = categoryKey === CommodityAnalysisCategory.SupplyAndDemand ? categoryScore : existing?.supplyAndDemandScore ?? 0;
  const price = categoryKey === CommodityAnalysisCategory.PriceAndValue ? categoryScore : existing?.priceAndValueScore ?? 0;
  const volatility = categoryKey === CommodityAnalysisCategory.VolatilityAndRisk ? categoryScore : existing?.volatilityAndRiskScore ?? 0;
  const future = categoryKey === CommodityAnalysisCategory.FutureOutlook ? categoryScore : existing?.futureOutlookScore ?? 0;
  const finalScore = supply + price + volatility + (future ?? 0);

  await prisma.commodityCachedScore.upsert({
    where: { commodityId },
    update: {
      supplyAndDemandScore: supply,
      priceAndValueScore: price,
      volatilityAndRiskScore: volatility,
      futureOutlookScore: future,
      finalScore,
      updatedAt: new Date(),
    },
    create: {
      commodityId,
      supplyAndDemandScore: supply,
      priceAndValueScore: price,
      volatilityAndRiskScore: volatility,
      futureOutlookScore: future,
      finalScore,
    },
  });
}
