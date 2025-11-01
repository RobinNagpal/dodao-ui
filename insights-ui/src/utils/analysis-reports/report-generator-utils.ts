import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisTypeKey, InvestorKey } from '@/types/ticker-typesv1';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Helper function to create a background generation request for a ticker
export const createBackgroundGenerationRequest = async (
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload[]) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

  const payload: GenerationRequestPayload = {
    ticker,
    regenerateCompetition: true,
    regenerateFinancialAnalysis: true,
    regenerateBusinessAndMoat: true,
    regeneratePastPerformance: true,
    regenerateFutureGrowth: true,
    regenerateFairValue: true,
    regenerateFutureRisk: true,
    regenerateWarrenBuffett: true,
    regenerateCharlieMunger: true,
    regenerateBillAckman: true,
    regenerateFinalSummary: true,
    regenerateCachedScore: true,
  };

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);
};

// Helper function to create a background generation request for a specific analysis type
export const createSingleAnalysisBackgroundRequest = async (
  analysisType: string,
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload[]) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

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
    regenerateWarrenBuffett: false,
    regenerateCharlieMunger: false,
    regenerateBillAckman: false,
    regenerateFinalSummary: false,
    regenerateCachedScore: false,
  };

  // Set the specific analysis type to true using constants
  switch (analysisType) {
    case AnalysisTypeKey.COMPETITION:
      payload.regenerateCompetition = true;
      break;
    case AnalysisTypeKey.FINANCIAL_ANALYSIS:
      payload.regenerateFinancialAnalysis = true;
      break;
    case AnalysisTypeKey.BUSINESS_AND_MOAT:
      payload.regenerateBusinessAndMoat = true;
      break;
    case AnalysisTypeKey.PAST_PERFORMANCE:
      payload.regeneratePastPerformance = true;
      break;
    case AnalysisTypeKey.FUTURE_GROWTH:
      payload.regenerateFutureGrowth = true;
      break;
    case AnalysisTypeKey.FAIR_VALUE:
      payload.regenerateFairValue = true;
      break;
    case AnalysisTypeKey.FUTURE_RISK:
      payload.regenerateFutureRisk = true;
      break;
    case AnalysisTypeKey.FINAL_SUMMARY:
      payload.regenerateFinalSummary = true;
      break;
    case AnalysisTypeKey.CACHED_SCORE:
      payload.regenerateCachedScore = true;
      break;
    default:
      // If it's not a recognized analysis type, do nothing
      break;
  }

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);
};

// Helper function to create a background generation request for a specific investor analysis
export const createSingleInvestorBackgroundRequest = async (
  investorKey: InvestorKey,
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload[]) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

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
    regenerateWarrenBuffett: false,
    regenerateCharlieMunger: false,
    regenerateBillAckman: false,
    regenerateFinalSummary: false,
    regenerateCachedScore: false,
  };

  // Set the specific investor analysis to true
  switch (investorKey) {
    case 'WARREN_BUFFETT':
      payload.regenerateWarrenBuffett = true;
      break;
    case 'CHARLIE_MUNGER':
      payload.regenerateCharlieMunger = true;
      break;
    case 'BILL_ACKMAN':
      payload.regenerateBillAckman = true;
      break;
    default:
      // If it's not a recognized investor, do nothing
      break;
  }

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, [payload]);
};
