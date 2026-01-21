import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchTickerRecordBySymbolAndExchangeWithAnalysisData } from '@/utils/analysis-reports/get-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { getDefaultGeminiModel, LLMProvider } from '@/types/llmConstants';
import { saveFinalSummaryResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareFinalSummaryInputJson } from '@/utils/analysis-reports/report-input-json-utils';

export interface FinalSummaryResponse {
  finalSummary: string;
  metaDescription: string;
  aboutReport: string;
}

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB with all related analysis data
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(ticker.toUpperCase(), exchange.toUpperCase());

  // Prepare input for the prompt
  const inputJson = prepareFinalSummaryInputJson(tickerRecord);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/final-summary',
    llmProvider: LLMProvider.GEMINI,
    model: getDefaultGeminiModel(),
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as FinalSummaryResponse;

  // Save the final summary response using the utility function
  await saveFinalSummaryResponse(ticker.toLowerCase(), tickerRecord.exchange, response.finalSummary, response.metaDescription, response.aboutReport);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
