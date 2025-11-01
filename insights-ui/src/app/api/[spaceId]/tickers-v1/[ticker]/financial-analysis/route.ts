import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry, saveFinancialAnalysisFactorAnalysisResponse } from '@/utils/save-report-utils';
import { prepareFinancialAnalysisInputJson } from '@/utils/report-input-json-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis } from '@/utils/stock-analyzer-scraper-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for FinancialStatementAnalysis category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FinancialStatementAnalysis);

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Prepare input for the prompt
  const inputJson = prepareFinancialAnalysisInputJson(tickerRecord, analysisFactors, financialData);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/financial-statements',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Save the analysis response using the utility function
  await saveFinancialAnalysisFactorAnalysisResponse(ticker.toLowerCase(), response, TickerAnalysisCategory.FinancialStatementAnalysis);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
