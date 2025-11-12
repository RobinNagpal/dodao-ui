import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';
import { saveCompetitionAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { fetchTickerRecordWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { prepareBaseTickerInputJson } from '@/utils/analysis-reports/report-input-json-utils';

interface CompetitionAnalysisResponse {
  summary: string;
  overallAnalysisDetails: string;
  competitionAnalysisArray: Array<{
    companyName: string;
    companySymbol?: string;
    exchangeSymbol?: string;
    exchangeName?: string;
    detailedComparison: string;
  }>;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Prepare input for the prompt (uses competition-input.schema.yaml)
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/competition',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as CompetitionAnalysisResponse;

  // Save the analysis response using the utility function
  await saveCompetitionAnalysisResponse(ticker.toLowerCase(), tickerRecord.exchange, response);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
