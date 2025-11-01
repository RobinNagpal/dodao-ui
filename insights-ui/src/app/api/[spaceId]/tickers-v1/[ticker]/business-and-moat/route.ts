import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry, getCompetitionAnalysisArray } from '@/utils/analysis-reports/get-report-data-utils';
import { saveBusinessAndMoatFactorAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareBusinessAndMoatInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Get competition analysis (required for business and moat analysis)
  const competitionAnalysisArray = await getCompetitionAnalysisArray(tickerRecord);

  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.BusinessAndMoat);

  // Prepare input for the prompt
  const inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactors, competitionAnalysisArray);

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

  // Save the analysis response using the utility function
  await saveBusinessAndMoatFactorAnalysisResponse(ticker.toLowerCase(), response, TickerAnalysisCategory.BusinessAndMoat);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
