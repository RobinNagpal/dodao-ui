import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { LLMFactorAnalysisResponse, LLMInvestorAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { bumpUpdatedAtAndInvalidateCache, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';

/**
 * Saves factor analysis response for any category
 */
export async function saveFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, tickerAnalysisCategory);

  // Store category analysis result (upsert)
  await prisma.tickerV1CategoryAnalysisResult.upsert({
    where: {
      spaceId_tickerId_categoryKey: {
        spaceId,
        tickerId: tickerRecord.id,
        categoryKey: tickerAnalysisCategory,
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
      categoryKey: tickerAnalysisCategory,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
    },
  });

  // Store factor results (upsert each one)

  for (const factor of response.factors) {
    const analysisFactorRecord = analysisFactors.find((af) => af.factorAnalysisKey === factor.factorAnalysisKey);

    if (analysisFactorRecord) {
      await prisma.tickerV1AnalysisCategoryFactorResult.upsert({
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
          categoryKey: tickerAnalysisCategory,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
        },
      });
    }
  }

  // Calculate score (number of passed factors out of total)
  const score = response.factors.filter((factor) => factor.result && factor.result.toLowerCase().includes('pass')).length;

  // Update cached score using the utility function
  await updateTickerCachedScore(tickerRecord, tickerAnalysisCategory, score);

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

// Category-specific functions that use the generic saveFactorAnalysisResponse function

export async function saveBusinessAndMoatFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function savePastPerformanceFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFutureGrowthFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFinancialAnalysisFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFairValueFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

/**
 * Saves investor analysis response
 */
export async function saveInvestorAnalysisResponse(ticker: string, response: LLMInvestorAnalysisResponse, investorKey: string): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Store investor analysis result (upsert)
  await prisma.tickerV1InvestorAnalysisResult.upsert({
    where: {
      spaceId_tickerId_investorKey: {
        spaceId,
        tickerId: tickerRecord.id,
        investorKey,
      },
    },
    update: {
      summary: response.summary,
      verdict: response.verdict,
      willInvest: response.willInvest,
      topCompaniesToConsider: response.topCompaniesToConsider,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      investorKey,
      summary: response.summary,
      verdict: response.verdict,
      willInvest: response.willInvest,
      topCompaniesToConsider: response.topCompaniesToConsider,
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

/**
 * Saves final summary response
 */
export async function saveFinalSummaryResponse(ticker: string, finalSummary: string, metaDescription: string): Promise<void> {
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Update the ticker's summary and meta description fields
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      summary: finalSummary,
      metaDescription: metaDescription,
      updatedAt: new Date(),
    },
  });

  revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);
}
