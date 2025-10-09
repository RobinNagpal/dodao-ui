import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { bumpUpdatedAtAndInvalidateCache } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

interface CompetitionAnalysisResponse {
  summary: string;
  overallAnalysisDetails: string;
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
  const llmProvider = LLMProvider.GEMINI;
  const model = GeminiModel.GEMINI_2_5_PRO;

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
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
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
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
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: response.competitionAnalysisArray,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      summary: response.summary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: response.competitionAnalysisArray,
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
