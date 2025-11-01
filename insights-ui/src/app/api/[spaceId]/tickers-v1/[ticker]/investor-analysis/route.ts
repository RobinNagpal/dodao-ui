import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { AnalysisRequest, LLMInvestorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { fetchTickerRecordWithIndustryAndSubIndustry, getCompetitionAnalysisArray, saveInvestorAnalysisResponse } from '@/utils/save-report-utils';
import { prepareInvestorAnalysisInputJson } from '@/utils/report-input-json-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;
  const body = await req.json();
  const { investorKey } = body as AnalysisRequest;

  if (!investorKey) {
    throw new Error('investorKey is required');
  }

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Get competition analysis (required for investor analysis)
  const competitionAnalysisArray = await getCompetitionAnalysisArray(tickerRecord);

  // Prepare input for the prompt (uses investor-analysis-input.schema.yaml)
  const inputJson = prepareInvestorAnalysisInputJson(tickerRecord, investorKey, competitionAnalysisArray);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/investor-analysis',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMInvestorAnalysisResponse;

  // Save the investor analysis response using the utility function
  await saveInvestorAnalysisResponse(ticker.toLowerCase(), response, investorKey);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
