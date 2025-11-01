import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry, saveFairValueFactorAnalysisResponse } from '@/utils/save-report-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis } from '@/utils/stock-analyzer-scraper-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Get analysis factors for FairValue category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);

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
    categoryKey: TickerAnalysisCategory.FairValue,
    factorAnalysisArray: analysisFactors.map((factor) => ({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
      factorAnalysisMetrics: factor.factorAnalysisMetrics || '',
    })),

    // Market Snapshot
    marketSummary: JSON.stringify(financialData.marketSummary),

    // Financial Statements - last 5 annuals
    incomeStatement: JSON.stringify(financialData.incomeStatement),
    balanceSheet: JSON.stringify(financialData.balanceSheet),
    cashFlow: JSON.stringify(financialData.cashFlow),
    ratios: JSON.stringify(financialData.ratios),
    dividends: JSON.stringify(financialData.dividends),
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/fair-value',
    llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Save the analysis response using the utility function
  await saveFairValueFactorAnalysisResponse(ticker.toLowerCase(), response, TickerAnalysisCategory.FairValue);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
