import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFutureRiskResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { prepareBaseTickerInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { saveFutureRiskResponse } from '@/utils/analysis-reports/save-report-utils';

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(ticker.toUpperCase(), exchange.toUpperCase());

  // Prepare input for the prompt (uses future-risk-input.schema.yaml)
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/future-risk',
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFutureRiskResponse;

  // Save the analysis response using the utility function
  await saveFutureRiskResponse(ticker.toLowerCase(), tickerRecord.exchange, response);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
