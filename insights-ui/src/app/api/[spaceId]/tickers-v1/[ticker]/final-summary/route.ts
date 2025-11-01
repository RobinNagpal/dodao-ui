import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { generateMetaDescriptionPrompt, MetaDescriptionResponse, MetaDescriptionResponseType } from '@/lib/promptForMetaDescriptionV1';
import { LLMProvider, GeminiModel, GeminiModelType } from '@/types/llmConstants';
import { fetchTickerRecordWithAnalysisData, saveFinalSummaryResponse } from '@/utils/save-report-utils';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB with all related analysis data
  const tickerRecord = await fetchTickerRecordWithAnalysisData(ticker);

  // Prepare category summaries from existing analysis results
  const categorySummaries = tickerRecord.categoryAnalysisResults.map((categoryResult) => ({
    categoryKey: categoryResult.categoryKey,
    overallSummary: categoryResult.summary,
  }));

  // Prepare factor results from existing factor analysis
  const factorResults = tickerRecord.categoryAnalysisResults.flatMap((categoryResult) =>
    categoryResult.factorResults.map((factorResult) => ({
      categoryKey: categoryResult.categoryKey,
      factorAnalysisKey: factorResult.analysisCategoryFactor.factorAnalysisKey,
      oneLineExplanation: factorResult.oneLineExplanation,
      result: factorResult.result,
    }))
  );

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    industryKey: tickerRecord.industryKey,
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
    categorySummaries,
    factorResults,
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/final-summary',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const finalSummary = result.response as string;

  const metaDescriptionPrompt = generateMetaDescriptionPrompt(finalSummary);

  const metaDescriptionResult = await getLlmResponse<MetaDescriptionResponseType>(
    metaDescriptionPrompt,
    MetaDescriptionResponse,
    GeminiModelType.GEMINI_2_5_PRO,
    3,
    1000
  );

  const metaDescription = metaDescriptionResult.metaDescription;

  // Save the final summary response using the utility function
  await saveFinalSummaryResponse(ticker.toLowerCase(), finalSummary, metaDescription);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
