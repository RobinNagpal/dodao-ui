import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import {
  fetchAnalysisFactors,
  fetchBusinessMoatAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry,
} from '@/utils/analysis-reports/get-report-data-utils';
import { saveFutureGrowthFactorAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareFutureGrowthInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { ensureStockAnalyzerDataIsFresh, extractKpisDataForAnalysis } from '@/utils/stock-analyzer-scraper-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(ticker.toUpperCase(), exchange.toUpperCase());

  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for FutureGrowth category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FutureGrowth);

  // Get business moat analysis (required for future growth analysis)
  const businessMoatData = await fetchBusinessMoatAnalysisData(spaceId, tickerRecord.id);

  // Extract KPIs data for analysis
  const kpisData = extractKpisDataForAnalysis(scraperInfo);

  // Prepare input for the prompt (uses future-growth-input.schema.yaml)
  const inputJson = prepareFutureGrowthInputJson(tickerRecord, analysisFactors, businessMoatData, kpisData);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/future-growth',
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Save the analysis response using the utility function
  await saveFutureGrowthFactorAnalysisResponse(ticker.toLowerCase(), tickerRecord.exchange, response, TickerAnalysisCategory.FutureGrowth);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
