import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { INVESTOR_OPTIONS } from '@/lib/mappingsV1';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/[ticker]/generation-requests/route';

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

// Common analysis types
export const analysisTypes: AnalysisTypeInfo[] = [
  { key: 'financial-analysis', label: 'Financial Analysis', statusKey: 'financialAnalysis' },
  { key: 'competition', label: 'Competition', statusKey: 'competition' },
  { key: 'business-and-moat', label: 'Business & Moat', statusKey: 'businessAndMoat' },
  { key: 'past-performance', label: 'Past Performance', statusKey: 'pastPerformance' },
  { key: 'future-growth', label: 'Future Growth', statusKey: 'futureGrowth' },
  { key: 'fair-value', label: 'Fair Value', statusKey: 'fairValue' },
  { key: 'future-risk', label: 'Future Risk', statusKey: 'futureRisk' },
  { key: 'final-summary', label: 'Final Summary', statusKey: 'finalSummary' },
  { key: 'cached-score', label: 'Cached Score', statusKey: 'cachedScore' },
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

  // Generate in sequence to respect dependencies
  const sequence = [
    'financial-analysis',
    'competition', // Must come before past-performance, future-growth, fair-value and business-and-moat
    'business-and-moat',
    'fair-value',
    'future-risk',
    'past-performance',
    'future-growth',
    'final-summary',
    'cached-score',
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
  await generateAnalysis('cached-score', ticker, postAnalysis, onReportGenerated);
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

  // Set the specific analysis type to true
  switch (analysisType) {
    case 'competition':
      payload.regenerateCompetition = true;
      break;
    case 'financial-analysis':
      payload.regenerateFinancialAnalysis = true;
      break;
    case 'business-and-moat':
      payload.regenerateBusinessAndMoat = true;
      break;
    case 'past-performance':
      payload.regeneratePastPerformance = true;
      break;
    case 'future-growth':
      payload.regenerateFutureGrowth = true;
      break;
    case 'fair-value':
      payload.regenerateFairValue = true;
      break;
    case 'future-risk':
      payload.regenerateFutureRisk = true;
      break;
    case 'final-summary':
      payload.regenerateFinalSummary = true;
      break;
    case 'cached-score':
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
      if (reportType.startsWith('investor-')) {
        const investorKey = reportType.replace('investor-', '');
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
    // Create a payload with only the selected report types
    const payload: GenerationRequestPayload = {
      regenerateCompetition: selectedReportTypes.includes('competition'),
      regenerateFinancialAnalysis: selectedReportTypes.includes('financial-analysis'),
      regenerateBusinessAndMoat: selectedReportTypes.includes('business-and-moat'),
      regeneratePastPerformance: selectedReportTypes.includes('past-performance'),
      regenerateFutureGrowth: selectedReportTypes.includes('future-growth'),
      regenerateFairValue: selectedReportTypes.includes('fair-value'),
      regenerateFutureRisk: selectedReportTypes.includes('future-risk'),
      regenerateWarrenBuffett: selectedReportTypes.includes('investor-WARREN_BUFFETT'),
      regenerateCharlieMunger: selectedReportTypes.includes('investor-CHARLIE_MUNGER'),
      regenerateBillAckman: selectedReportTypes.includes('investor-BILL_ACKMAN'),
      regenerateFinalSummary: selectedReportTypes.includes('final-summary'),
      regenerateCachedScore: selectedReportTypes.includes('cached-score'),
    };
    
    await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-requests`, payload);
  });

  // Execute all ticker promises in parallel
  await Promise.all(tickerPromises);
};
