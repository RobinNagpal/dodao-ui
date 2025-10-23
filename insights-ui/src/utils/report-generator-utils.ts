import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { INVESTOR_OPTIONS, AnalysisTypeKey, INVESTOR_ANALYSIS_PREFIX } from '@/lib/mappingsV1';
import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/[ticker]/generation-requests/route';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Common types
export interface AnalysisStatus {
  businessAndMoat: boolean;
  financialAnalysis: boolean;
  pastPerformance: boolean;
  futureGrowth: boolean;
  fairValue: boolean;
  competition: boolean;
  investorAnalysis: {
    WARREN_BUFFETT: boolean;
    CHARLIE_MUNGER: boolean;
    BILL_ACKMAN: boolean;
  };
  futureRisk: boolean;
  finalSummary: boolean;
  cachedScore: boolean;
}

export interface AnalysisTypeInfo {
  key: string;
  label: string;
  statusKey?: keyof AnalysisStatus;
}

// Common analysis types using constants
export const analysisTypes: AnalysisTypeInfo[] = [
  { key: AnalysisTypeKey.FINANCIAL_ANALYSIS, label: 'Financial Analysis', statusKey: 'financialAnalysis' },
  { key: AnalysisTypeKey.COMPETITION, label: 'Competition', statusKey: 'competition' },
  { key: AnalysisTypeKey.BUSINESS_AND_MOAT, label: 'Business & Moat', statusKey: 'businessAndMoat' },
  { key: AnalysisTypeKey.PAST_PERFORMANCE, label: 'Past Performance', statusKey: 'pastPerformance' },
  { key: AnalysisTypeKey.FUTURE_GROWTH, label: 'Future Growth', statusKey: 'futureGrowth' },
  { key: AnalysisTypeKey.FAIR_VALUE, label: 'Fair Value', statusKey: 'fairValue' },
  { key: AnalysisTypeKey.FUTURE_RISK, label: 'Future Risk', statusKey: 'futureRisk' },
  { key: AnalysisTypeKey.FINAL_SUMMARY, label: 'Final Summary', statusKey: 'finalSummary' },
  { key: AnalysisTypeKey.CACHED_SCORE, label: 'Cached Score', statusKey: 'cachedScore' },
];

// Common investor analysis types
export const investorAnalysisTypes: AnalysisTypeInfo[] = INVESTOR_OPTIONS.map((investor) => ({
  key: investor.key,
  label: `${investor.name} Analysis`,
}));

// Helper function to generate analysis for a specific ticker and analysis type
export const generateAnalysis = async (
  analysisType: string,
  ticker: string,
  postAnalysis: (url: string, data: AnalysisRequest) => Promise<TickerAnalysisResponse | undefined>,
  onReportGenerated?: (ticker: string) => void
): Promise<void> => {
  if (!ticker) return;

  try {
    const payload: AnalysisRequest = {};
    const result = await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/${analysisType}`, payload);

    if (result && onReportGenerated) {
      onReportGenerated(ticker);
    }
  } catch (error) {
    console.error(`Error generating ${analysisType} for ${ticker}:`, error);
  }
};

// Helper function to generate investor analysis for a specific ticker and investor
export const generateInvestorAnalysis = async (
  investorKey: string,
  ticker: string,
  postAnalysis: (url: string, data: AnalysisRequest) => Promise<TickerAnalysisResponse | undefined>,
  onReportGenerated?: (ticker: string) => void
): Promise<void> => {
  if (!ticker) return;

  try {
    const payload: AnalysisRequest = {
      investorKey: investorKey,
    };
    const result = await postAnalysis(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/investor-analysis`, payload);

    if (result && onReportGenerated) {
      onReportGenerated(ticker);
    }
  } catch (error) {
    console.error(`Error generating investor analysis for ${ticker} with investor ${investorKey}:`, error);
  }
};

// Helper function to generate all reports for a ticker
export const generateAllReports = async (
  ticker: string,
  postAnalysis: (url: string, data: AnalysisRequest) => Promise<TickerAnalysisResponse | undefined>,
  onReportGenerated?: (ticker: string) => void
): Promise<void> => {
  if (!ticker) return;

  // Generate in sequence to respect dependencies using constants
  const sequence = [
    AnalysisTypeKey.FINANCIAL_ANALYSIS,
    AnalysisTypeKey.COMPETITION, // Must come before past-performance, future-growth, fair-value and business-and-moat
    AnalysisTypeKey.BUSINESS_AND_MOAT,
    AnalysisTypeKey.FAIR_VALUE,
    AnalysisTypeKey.FUTURE_RISK,
    AnalysisTypeKey.PAST_PERFORMANCE,
    AnalysisTypeKey.FUTURE_GROWTH,
    AnalysisTypeKey.FINAL_SUMMARY,
    AnalysisTypeKey.CACHED_SCORE,
  ];

  for (const analysisType of sequence) {
    await generateAnalysis(analysisType, ticker, postAnalysis, onReportGenerated);
    // Add a small delay between calls
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate investor analysis for all investors
  const allInvestors = ['WARREN_BUFFETT', 'CHARLIE_MUNGER', 'BILL_ACKMAN'];
  for (const investorKey of allInvestors) {
    await generateInvestorAnalysis(investorKey, ticker, postAnalysis, onReportGenerated);
    // Add a small delay between calls
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate cached score at the end of all steps
  await generateAnalysis(AnalysisTypeKey.CACHED_SCORE, ticker, postAnalysis, onReportGenerated);
};

// Helper function to create a background generation request for a ticker
export const createBackgroundGenerationRequest = async (
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

  const payload: GenerationRequestPayload = {
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

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-requests`, payload);
};

// Helper function to create a background generation request for a specific analysis type
export const createSingleAnalysisBackgroundRequest = async (
  analysisType: string,
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

  // Create a payload with all options set to false by default
  const payload: GenerationRequestPayload = {
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

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-requests`, payload);
};

// Helper function to create a background generation request for a specific investor analysis
export const createSingleInvestorBackgroundRequest = async (
  investorKey: string,
  ticker: string,
  postRequest: (url: string, data: GenerationRequestPayload) => Promise<any>
): Promise<void> => {
  if (!ticker) return;

  // Create a payload with all options set to false by default
  const payload: GenerationRequestPayload = {
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

  await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-requests`, payload);
};

// Helper function to generate selected report types synchronously for multiple tickers
export const generateSelectedReportsSynchronously = async (
  tickers: string[],
  selectedReportTypes: string[],
  postAnalysis: (url: string, data: AnalysisRequest) => Promise<TickerAnalysisResponse | undefined>,
  onReportGenerated?: (ticker: string) => void
): Promise<void> => {
  if (tickers.length === 0 || selectedReportTypes.length === 0) return;

  // Create an array of promises for each ticker
  const tickerPromises = tickers.map(async (ticker) => {
    // Generate only selected report types for each ticker
    for (const reportType of selectedReportTypes) {
      if (reportType.startsWith(INVESTOR_ANALYSIS_PREFIX)) {
        const investorKey = reportType.replace(INVESTOR_ANALYSIS_PREFIX, '');
        await generateInvestorAnalysis(investorKey, ticker, postAnalysis, onReportGenerated);
      } else {
        await generateAnalysis(reportType, ticker, postAnalysis, onReportGenerated);
      }
      // Add a small delay between calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  // Execute all ticker promises in parallel
  await Promise.all(tickerPromises);
};

// Helper function to create background generation requests for selected report types for multiple tickers
export const generateSelectedReportsInBackground = async (
  tickers: string[],
  selectedReportTypes: string[],
  postRequest: (url: string, data: GenerationRequestPayload) => Promise<any>
): Promise<void> => {
  if (tickers.length === 0 || selectedReportTypes.length === 0) return;

  // Create background generation requests for each ticker with only selected types
  const tickerPromises = tickers.map(async (ticker) => {
    // Create a payload with all options set to false by default
    const payload: GenerationRequestPayload = {
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

    // Set the selected report types to true using constants
    selectedReportTypes.forEach((reportType) => {
      // Handle regular analysis types
      if (reportType === AnalysisTypeKey.COMPETITION) {
        payload.regenerateCompetition = true;
      } else if (reportType === AnalysisTypeKey.FINANCIAL_ANALYSIS) {
        payload.regenerateFinancialAnalysis = true;
      } else if (reportType === AnalysisTypeKey.BUSINESS_AND_MOAT) {
        payload.regenerateBusinessAndMoat = true;
      } else if (reportType === AnalysisTypeKey.PAST_PERFORMANCE) {
        payload.regeneratePastPerformance = true;
      } else if (reportType === AnalysisTypeKey.FUTURE_GROWTH) {
        payload.regenerateFutureGrowth = true;
      } else if (reportType === AnalysisTypeKey.FAIR_VALUE) {
        payload.regenerateFairValue = true;
      } else if (reportType === AnalysisTypeKey.FUTURE_RISK) {
        payload.regenerateFutureRisk = true;
      } else if (reportType === AnalysisTypeKey.FINAL_SUMMARY) {
        payload.regenerateFinalSummary = true;
      } else if (reportType === AnalysisTypeKey.CACHED_SCORE) {
        payload.regenerateCachedScore = true;
      }
      // Handle investor analysis types
      else if (reportType === `${INVESTOR_ANALYSIS_PREFIX}WARREN_BUFFETT`) {
        payload.regenerateWarrenBuffett = true;
      } else if (reportType === `${INVESTOR_ANALYSIS_PREFIX}CHARLIE_MUNGER`) {
        payload.regenerateCharlieMunger = true;
      } else if (reportType === `${INVESTOR_ANALYSIS_PREFIX}BILL_ACKMAN`) {
        payload.regenerateBillAckman = true;
      }
    });

    await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-requests`, payload);
  });

  // Execute all ticker promises in parallel
  await Promise.all(tickerPromises);
};
