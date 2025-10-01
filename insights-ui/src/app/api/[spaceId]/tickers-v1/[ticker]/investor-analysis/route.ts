import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { bumpUpdatedAtAndInvalidateCache } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import {
  AnalysisRequest,
  CompetitionAnalysisArray,
  LLMInvestorAnalysisFutureRiskResponse,
  TickerAnalysisResponse,
} from '@/types/public-equity/analysis-factors-types';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;
  const body = await req.json();
  const { investorKey } = body as AnalysisRequest;

  // Hardcode LLM provider and model
  const llmProvider = 'gemini';
  const model = 'models/gemini-2.5-pro';

  if (!investorKey) {
    throw new Error('investorKey is required');
  }

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });

  // Get competition analysis (required for investor analysis)
  const competitionData = await prisma.tickerV1VsCompetition.findFirst({
    where: {
      spaceId,
      tickerId: tickerRecord.id,
    },
  });

  if (!competitionData) {
    throw new Error(`Competition analysis not found for ticker ${ticker}. Please run competition analysis first.`);
  }

  // Prepare input for the prompt (uses investor-analysis-input.schema.yaml)
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
    investorKey: investorKey,
    competitionAnalysisArray: competitionData.competitionAnalysisArray as CompetitionAnalysisArray,
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/investor-analysis',
    llmProvider,
    model,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMInvestorAnalysisFutureRiskResponse;

  // Store investor analysis result (upsert)
  const investorAnalysisResult = await prisma.tickerV1InvestorAnalysisResult.upsert({
    where: {
      spaceId_tickerId_investorKey: {
        spaceId,
        tickerId: tickerRecord.id,
        investorKey,
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
      investorKey,
      summary: response.summary,
      detailedAnalysis: 'detailedAnalysis',
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
