import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchAnalysisFactors, fetchTickerRecordBySymbolAndExchangeWithAnalysisData } from '@/utils/analysis-reports/get-report-data-utils';
import { saveFairValueFactorAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareFairValueInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(ticker.toUpperCase(), exchange.toUpperCase());

  // Get analysis factors for FairValue category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);

  // Prepare input for the prompt
  const inputJson = prepareFairValueInputJson(tickerRecord, analysisFactors);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/fair-value',
    llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
    model: GeminiModel.GEMINI_3_PRO_PREVIEW,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Save the analysis response using the utility function
  await saveFairValueFactorAnalysisResponse(ticker.toLowerCase(), exchange, response, TickerAnalysisCategory.FairValue);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
