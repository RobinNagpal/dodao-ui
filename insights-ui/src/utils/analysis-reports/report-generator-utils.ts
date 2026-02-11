import { GenerationRequestPayload, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { InvestorKey, ReportType } from '@/types/ticker-typesv1';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Helper function to create a background generation request for a ticker
export const createBackgroundGenerationRequest = async (
  ticker: TickerIdentifier,
  postRequest: (url: string, data: GenerationRequestPayload[]) => Promise<any>
): Promise<void> => {
  if (!ticker || !ticker.symbol || !ticker.exchange) return;

  const payload: GenerationRequestPayload = {
    ticker,
    regenerateCompetition: true,
    regenerateFinancialAnalysis: true,
    regenerateBusinessAndMoat: true,
    regeneratePastPerformance: true,
    regenerateFutureGrowth: true,
    regenerateFairValue: true,
    regenerateFutureRisk: true,
    regenerateFinalSummary: true,
  };

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);
};

// Helper function to create a background generation request for a specific analysis type
export const createSingleAnalysisBackgroundRequest = async (
  reportType: ReportType,
  ticker: TickerIdentifier,
  postRequest: (url: string, data: GenerationRequestPayload[]) => Promise<any>
): Promise<void> => {
  if (!ticker || !ticker.symbol || !ticker.exchange) return;

  // Create a payload with all options set to false by default
  const payload: GenerationRequestPayload = {
    ticker,
    regenerateCompetition: false,
    regenerateFinancialAnalysis: false,
    regenerateBusinessAndMoat: false,
    regeneratePastPerformance: false,
    regenerateFutureGrowth: false,
    regenerateFairValue: false,
    regenerateFutureRisk: false,
    regenerateFinalSummary: false,
  };

  // Set the specific analysis type to true using constants
  switch (reportType) {
    case ReportType.COMPETITION:
      payload.regenerateCompetition = true;
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      payload.regenerateFinancialAnalysis = true;
      break;
    case ReportType.BUSINESS_AND_MOAT:
      payload.regenerateBusinessAndMoat = true;
      break;
    case ReportType.PAST_PERFORMANCE:
      payload.regeneratePastPerformance = true;
      break;
    case ReportType.FUTURE_GROWTH:
      payload.regenerateFutureGrowth = true;
      break;
    case ReportType.FAIR_VALUE:
      payload.regenerateFairValue = true;
      break;
    case ReportType.FUTURE_RISK:
      payload.regenerateFutureRisk = true;
      break;
    case ReportType.FINAL_SUMMARY:
      payload.regenerateFinalSummary = true;
      break;

    default:
      // If it's not a recognized analysis type, do nothing
      break;
  }

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);
};
