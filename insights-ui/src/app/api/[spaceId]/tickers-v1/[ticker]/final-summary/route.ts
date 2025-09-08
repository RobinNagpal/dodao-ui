import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  const llmProvider = 'gemini';
  const model = 'models/gemini-2.5-pro';

  // Get ticker from DB with all related analysis data
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
    },
  });

  if (!tickerRecord) {
    throw new Error(`Ticker ${ticker} not found`);
  }

  // Prepare category summaries from existing analysis results
  const categorySummaries = tickerRecord.categoryAnalysisResults.map((categoryResult) => ({
    categoryKey: categoryResult.categoryKey,
    overallSummary: categoryResult.summary,
  }));

  // Prepare factor results from existing factor analysis
  const factorResults = tickerRecord.categoryAnalysisResults.flatMap((categoryResult) =>
    categoryResult.factorResults.map((factorResult) => ({
      categoryKey: categoryResult.categoryKey,
      factorAnalysisKey: factorResult.analysisCategoryFactor.factorAnalysisKey,
      oneLineExplanation: factorResult.oneLineExplanation,
      result: factorResult.result,
    }))
  );

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    industryKey: tickerRecord.industryKey,
    subIndustryKey: tickerRecord.subIndustryKey,
    categorySummaries,
    factorResults,
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/final-summary',
    llmProvider,
    model,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const finalSummary = result.response as string;

  // Update the ticker's summary field
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      summary: finalSummary,
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
