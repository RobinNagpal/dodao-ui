import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { parseLlmSelectionFromRequest } from '@/utils/analysis-reports/llm-selection-utils';
import { fetchAnalysisFactors, fetchTickerRecordBySymbolAndExchangeWithAnalysisData } from '@/utils/analysis-reports/get-report-data-utils';
import { saveFairValueFactorAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareFairValueInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { loadFairValueValuationSnapshot } from '@/utils/stock-analyzer-scraper-utils';
import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Optional LLM provider/model chosen in the report-generation UI (falls back to defaults).
  const { llmProvider, model } = await parseLlmSelectionFromRequest(req);

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(ticker.toUpperCase(), exchange.toUpperCase());

  // Get analysis factors for FairValue category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);

  const valuationSnapshot = await loadFairValueValuationSnapshot(tickerRecord);

  // Prepare input for the prompt
  const inputJson = prepareFairValueInputJson(tickerRecord, analysisFactors, valuationSnapshot);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/fair-value',
    requestFrom: 'ui',
    llmProvider,
    model,
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

export const POST = withAdminOrToken<TickerAnalysisResponse>(postHandler);
