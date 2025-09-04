import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { LLMInvestorAnalysisFutureRiskResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';

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

  // Prepare input for the prompt (uses future-risk-input.schema.yaml)
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    subIndustryKey: tickerRecord.subIndustryKey,
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/future-risk',
    llmProvider,
    model,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMInvestorAnalysisFutureRiskResponse;

  // Store future risk analysis result (upsert)
  const futureRiskResult = await prisma.tickerV1FutureRisk.upsert({
    where: {
      spaceId_tickerId: {
        spaceId,
        tickerId: tickerRecord.id,
      },
    },
    update: {
      summary: response.summary,
      detailedAnalysis: response.detailedAnalysis,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      summary: response.summary,
      detailedAnalysis: response.detailedAnalysis,
    },
  });

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
