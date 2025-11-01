import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchTickerRecordWithAnalysisData } from '@/utils/analysis-reports/get-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { generateMetaDescriptionPrompt, MetaDescriptionResponse, MetaDescriptionResponseType } from '@/lib/promptForMetaDescriptionV1';
import { LLMProvider, GeminiModel, GeminiModelType } from '@/types/llmConstants';
import { saveFinalSummaryResponse } from '@/utils/analysis-reports/save-report-utils';
import { prepareFinalSummaryInputJson } from '@/utils/analysis-reports/report-input-json-utils';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB with all related analysis data
  const tickerRecord = await fetchTickerRecordWithAnalysisData(ticker);

  // Prepare input for the prompt
  const inputJson = prepareFinalSummaryInputJson(tickerRecord);

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
