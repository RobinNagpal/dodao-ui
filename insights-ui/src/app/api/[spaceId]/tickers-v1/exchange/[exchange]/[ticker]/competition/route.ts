import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { saveCompetitionAnalysisResponse } from '@/utils/analysis-reports/save-report-utils';
import { fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { prepareBaseTickerInputJson } from '@/utils/analysis-reports/report-input-json-utils';

export interface CompetitionAnalysisResponse {
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

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker, exchange } = await params;

  // Get ticker from DB
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(ticker.toUpperCase(), exchange.toUpperCase());

  // Prepare input for the prompt (uses competition-input.schema.yaml)
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/competition',
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
