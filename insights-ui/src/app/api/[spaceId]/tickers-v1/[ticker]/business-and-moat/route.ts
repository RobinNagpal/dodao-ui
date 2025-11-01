import { prisma } from '@/prisma';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { CompetitionAnalysisArray, LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { saveBusinessAndMoatFactorAnalysisResponse } from '@/utils/save-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

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

  // Get competition analysis (required for business and moat analysis)
  const competitionData = await prisma.tickerV1VsCompetition.findFirstOrThrow({
    where: {
      spaceId,
      tickerId: tickerRecord.id,
    },
  });

  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.BusinessAndMoat,
    },
  });

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
    categoryKey: TickerAnalysisCategory.BusinessAndMoat,
    factorAnalysisArray: analysisFactors.map((factor) => ({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
      factorAnalysisMetrics: factor.factorAnalysisMetrics || '',
    })),
    competitionAnalysisArray: competitionData.competitionAnalysisArray as CompetitionAnalysisArray,
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/business-moat',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;
  await saveBusinessAndMoatFactorAnalysisResponse(ticker.toLowerCase(), response, TickerAnalysisCategory.BusinessAndMoat);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
