import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchAnalysisFactors, fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { savePastPerformanceFactorAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { preparePastPerformanceInputJson } from '@/utils/analysis-reports/report-input-json-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { getDefaultGeminiModel, LLMProvider, GeminiModel } from '@/types/llmConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(ticker.toUpperCase(), exchange.toUpperCase());

  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for past performance analysis (last 5 annuals only)
  const financialData = extractFinancialDataForPastPerformance(scraperInfo);

  // Get analysis factors for PastPerformance category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.PastPerformance);

  // Prepare input for the prompt
  const inputJson = preparePastPerformanceInputJson(tickerRecord, analysisFactors, financialData);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/past-performance',
    llmProvider: LLMProvider.GEMINI,
    model: getDefaultGeminiModel(),
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Save the analysis response using the utility function
  await savePastPerformanceFactorAnalysisResponse(ticker.toLowerCase(), tickerRecord.exchange, response, TickerAnalysisCategory.PastPerformance);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
