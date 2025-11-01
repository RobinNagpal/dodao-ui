import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { LLMFactorAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { bumpUpdatedAtAndInvalidateCache, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';

export async function saveBusinessAndMoatFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
) {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });

  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: tickerAnalysisCategory,
    },
  });

  // Store category analysis result (upsert)
  await prisma.tickerV1CategoryAnalysisResult.upsert({
    where: {
      spaceId_tickerId_categoryKey: {
        spaceId,
        tickerId: tickerRecord.id,
        categoryKey: TickerAnalysisCategory.BusinessAndMoat,
      },
    },
    update: {
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      categoryKey: TickerAnalysisCategory.BusinessAndMoat,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
    },
  });

  // Store factor results (upsert each one)
  const factorResults = [];
  for (const factor of response.factors) {
    const analysisFactorRecord = analysisFactors.find((af) => af.factorAnalysisKey === factor.factorAnalysisKey);

    if (analysisFactorRecord) {
      const factorResult = await prisma.tickerV1AnalysisCategoryFactorResult.upsert({
        where: {
          spaceId_tickerId_analysisCategoryFactorId: {
            spaceId,
            tickerId: tickerRecord.id,
            analysisCategoryFactorId: analysisFactorRecord.id,
          },
        },
        update: {
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
          updatedAt: new Date(),
        },
        create: {
          spaceId,
          tickerId: tickerRecord.id,
          categoryKey: TickerAnalysisCategory.BusinessAndMoat,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
        },
      });
      factorResults.push(factorResult);
    }
  }

  // Calculate business and moat score (number of passed factors out of 5)
  const businessAndMoatScore = response.factors.filter((factor) => factor.result && factor.result.toLowerCase().includes('pass')).length;

  // Update cached score using the utility function
  await updateTickerCachedScore(tickerRecord, TickerAnalysisCategory.BusinessAndMoat, businessAndMoatScore);

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}
