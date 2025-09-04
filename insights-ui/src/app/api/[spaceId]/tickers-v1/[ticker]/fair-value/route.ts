import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
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

  // Get analysis factors for FairValue category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FairValue,
    },
  });

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    subIndustryKey: tickerRecord.subIndustryKey,
    categoryKey: 'FairValue',
    factorAnalysisArray: analysisFactors.map((factor) => ({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
    })),
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/fair-value',
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
        categoryKey: TickerAnalysisCategory.FairValue,
      },
    },
    update: {
      summary: response.overallSummary,
      introductionToAnalysis: response.introductionToAnalysis,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      categoryKey: TickerAnalysisCategory.FairValue,
      summary: response.overallSummary,
      introductionToAnalysis: response.introductionToAnalysis,
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
          categoryKey: TickerAnalysisCategory.FairValue,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
        },
      });
      factorResults.push(factorResult);
    }
  }

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
