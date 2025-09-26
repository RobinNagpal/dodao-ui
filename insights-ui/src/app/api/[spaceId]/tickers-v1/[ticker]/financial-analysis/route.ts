import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { bumpUpdatedAtAndInvalidateCache, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Hardcode LLM provider and model
  const llmProvider = 'gemini';
  const model = 'models/gemini-2.5-pro';

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
  });

  if (!tickerRecord) {
    throw new Error(`Ticker ${ticker} not found`);
  }

  // Get analysis factors for FinancialStatementAnalysis category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
    },
  });

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    subIndustryKey: tickerRecord.subIndustryKey,
    categoryKey: 'FinancialStatementAnalysis',
    factorAnalysisArray: analysisFactors.map((factor) => ({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
      factorAnalysisMetrics: factor.factorAnalysisMetrics || '',
    })),
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/financial-statements',
    llmProvider,
    model,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Store category analysis result (upsert)
  const categoryResult = await prisma.tickerV1CategoryAnalysisResult.upsert({
    where: {
      spaceId_tickerId_categoryKey: {
        spaceId,
        tickerId: tickerRecord.id,
        categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
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
      categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
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
          categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
        },
      });
      factorResults.push(factorResult);
    }
  }

  // Calculate financial statement analysis score (number of passed factors out of 5)
  const financialStatementAnalysisScore = response.factors.filter((factor) => factor.result && factor.result.toLowerCase().includes('pass')).length;

  // Update cached score using the utility function
  await updateTickerCachedScore(tickerRecord, TickerAnalysisCategory.FinancialStatementAnalysis, financialStatementAnalysisScore);

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
