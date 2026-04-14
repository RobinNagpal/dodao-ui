import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory, EtfCategoryAnalysisResponse } from '@/types/etf/etf-analysis-types';
import { getEtfAnalysisFactorsForCategory } from '@/utils/etf-analysis-reports/etf-report-input-json-utils';
import { fetchEtfBySymbolAndExchange } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';

export async function saveEtfFactorAnalysisResponse(
  symbol: string,
  exchange: string,
  response: EtfCategoryAnalysisResponse,
  categoryKey: EtfAnalysisCategory
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const etfRecord = await fetchEtfBySymbolAndExchange(symbol, exchange);
  const factors = getEtfAnalysisFactorsForCategory(categoryKey);

  await prisma.etfCategoryAnalysisResult.upsert({
    where: {
      spaceId_etfId_categoryKey: {
        spaceId,
        etfId: etfRecord.id,
        categoryKey,
      },
    },
    update: {
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      etfId: etfRecord.id,
      categoryKey,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
    },
  });

  for (const factor of response.factors) {
    const factorDef = factors.find((f) => f.factorAnalysisKey === factor.factorAnalysisKey);
    if (!factorDef) {
      console.warn(`Unknown factor key: ${factor.factorAnalysisKey} for ETF ${symbol}`);
      continue;
    }

    await prisma.etfAnalysisCategoryFactorResult.upsert({
      where: {
        spaceId_etfId_factorKey: {
          spaceId,
          etfId: etfRecord.id,
          factorKey: factor.factorAnalysisKey,
        },
      },
      update: {
        categoryKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
        updatedAt: new Date(),
      },
      create: {
        spaceId,
        etfId: etfRecord.id,
        categoryKey,
        factorKey: factor.factorAnalysisKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
      },
    });
  }

  const score = response.factors.filter((f) => f.result && f.result.toLowerCase().includes('pass')).length;
  await updateEtfCachedScore(etfRecord.id, categoryKey, score);

  revalidateEtfAndExchangeTag(symbol, exchange);
}

async function updateEtfCachedScore(etfId: string, categoryKey: EtfAnalysisCategory, categoryScore: number): Promise<void> {
  const existingScore = await prisma.etfCachedScore.findUnique({
    where: { etfId },
  });

  const performanceExisting = existingScore?.performanceAndReturnsScore || 0;
  const costExisting = existingScore?.costEfficiencyAndTeamScore || 0;
  const riskExisting = existingScore?.riskAnalysisScore || 0;

  const scores: Record<string, number> = {};
  switch (categoryKey) {
    case EtfAnalysisCategory.PerformanceAndReturns:
      scores.performanceAndReturnsScore = categoryScore;
      break;
    case EtfAnalysisCategory.CostEfficiencyAndTeam:
      scores.costEfficiencyAndTeamScore = categoryScore;
      break;
    case EtfAnalysisCategory.RiskAnalysis:
      scores.riskAnalysisScore = categoryScore;
      break;
  }

  const finalScore =
    (categoryKey === EtfAnalysisCategory.PerformanceAndReturns ? categoryScore : performanceExisting) +
    (categoryKey === EtfAnalysisCategory.CostEfficiencyAndTeam ? categoryScore : costExisting) +
    (categoryKey === EtfAnalysisCategory.RiskAnalysis ? categoryScore : riskExisting);

  await prisma.etfCachedScore.upsert({
    where: { etfId },
    update: {
      ...scores,
      finalScore,
      updatedAt: new Date(),
    },
    create: {
      etfId,
      performanceAndReturnsScore: categoryKey === EtfAnalysisCategory.PerformanceAndReturns ? categoryScore : 0,
      costEfficiencyAndTeamScore: categoryKey === EtfAnalysisCategory.CostEfficiencyAndTeam ? categoryScore : 0,
      riskAnalysisScore: categoryKey === EtfAnalysisCategory.RiskAnalysis ? categoryScore : 0,
      finalScore,
    },
  });
}
