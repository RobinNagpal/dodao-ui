import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';

interface CompetitionAnalysisResponse {
  summary: string;
  introductionToAnalysis: string;
  competitionAnalysisArray: Array<{
    companyName: string;
    companySymbol?: string;
    exchangeSymbol?: string;
    exchangeName?: string;
    detailedComparison: string;
  }>;
}

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

  // Prepare input for the prompt (uses competition-input.schema.yaml)
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
    promptKey: 'US/public-equities-v1/competition',
    llmProvider,
    model,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as CompetitionAnalysisResponse;

  // Store competition analysis result (upsert)
  const competitionResult = await prisma.tickerV1VsCompetition.upsert({
    where: {
      spaceId_tickerId: {
        spaceId,
        tickerId: tickerRecord.id,
      },
    },
    update: {
      summary: response.summary,
      introductionToAnalysis: response.introductionToAnalysis,
      competitionAnalysisArray: response.competitionAnalysisArray,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      summary: response.summary,
      introductionToAnalysis: response.introductionToAnalysis,
      competitionAnalysisArray: response.competitionAnalysisArray,
    },
  });

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
