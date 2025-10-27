import { GenerationRequestPayload } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { AnalysisTypeKey, createInvestorAnalysisKey, INVESTOR_ANALYSIS_PREFIX, INVESTOR_OPTIONS, InvestorKey } from '@/types/ticker-typesv1';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

/** Shared types (moved from utils) */
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

/** Analysis types (moved from utils) */
export const analysisTypes: AnalysisTypeInfo[] = [
  { key: AnalysisTypeKey.FINANCIAL_ANALYSIS, label: 'Financial Analysis', statusKey: 'financialAnalysis' },
  { key: AnalysisTypeKey.COMPETITION, label: 'Competition', statusKey: 'competition' },
  { key: AnalysisTypeKey.BUSINESS_AND_MOAT, label: 'Business & Moat', statusKey: 'businessAndMoat' },
  { key: AnalysisTypeKey.PAST_PERFORMANCE, label: 'Past Performance', statusKey: 'pastPerformance' },
  { key: AnalysisTypeKey.FUTURE_GROWTH, label: 'Future Growth', statusKey: 'futureGrowth' },
  { key: AnalysisTypeKey.FAIR_VALUE, label: 'Fair Value', statusKey: 'fairValue' },
  { key: AnalysisTypeKey.FUTURE_RISK, label: 'Future Risk', statusKey: 'futureRisk' },
  { key: AnalysisTypeKey.FINAL_SUMMARY, label: 'Final Summary', statusKey: 'finalSummary' },
  { key: AnalysisTypeKey.CACHED_SCORE, label: 'Cached Score/About Report', statusKey: 'cachedScore' },
];

/** Investor analysis types (moved from utils) */
export const investorAnalysisTypes: AnalysisTypeInfo[] = INVESTOR_OPTIONS.map((investor) => ({
  key: investor.key,
  label: `${investor.name} Analysis`,
}));

/**
 * Hook for generating reports with consolidated logic.
 * All background requests use the BATCH endpoint (array payload),
 * even for a single ticker.
 */
export const useGenerateReports = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Direct/synchronous analysis generation
  const { postData: postAnalysis, loading: analysisLoading } = usePostData<TickerAnalysisResponse, AnalysisRequest>({
    successMessage: 'Analysis generation started successfully!',
    errorMessage: 'Failed to generate analysis.',
  });

  // Background batch generation
  const { postData: postRequest, loading: requestLoading } = usePostData<unknown, GenerationRequestPayload[]>({
    successMessage: 'Background generation request created successfully!',
    errorMessage: 'Failed to create background generation request.',
  });

  /** --- helpers (internal) --- */

  const postAnalysisTo = async (url: string, payload: AnalysisRequest): Promise<TickerAnalysisResponse | undefined> => {
    return postAnalysis(url, payload);
  };

  const generateAnalysis = async (analysisType: string, ticker: string, onReportGenerated?: (ticker: string) => void): Promise<void> => {
    if (!ticker) return;
    try {
      const payload: AnalysisRequest = {};
      const result = await postAnalysisTo(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/${analysisType}`, payload);
      if (result && onReportGenerated) onReportGenerated(ticker);
    } catch (err) {
      console.error(`Error generating ${analysisType} for ${ticker}:`, err);
    }
  };

  const generateInvestorAnalysis = async (investorKey: InvestorKey, ticker: string, onReportGenerated?: (ticker: string) => void): Promise<void> => {
    if (!ticker) return;
    try {
      const payload: AnalysisRequest = { investorKey };
      const result = await postAnalysisTo(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/investor-analysis`, payload);
      if (result && onReportGenerated) onReportGenerated(ticker);
    } catch (err) {
      console.error(`Error generating investor analysis for ${ticker} (${investorKey}):`, err);
    }
  };

  /** --- public API --- */

  /**
   * Generate all reports for a single ticker (synchronously, respecting dependencies).
   */
  const generateAllReportsForTicker = async (ticker: string, onReportGenerated?: (ticker: string) => void): Promise<void> => {
    if (!ticker) return;

    setIsGenerating(true);
    try {
      const sequence: string[] = [
        AnalysisTypeKey.FINANCIAL_ANALYSIS,
        AnalysisTypeKey.COMPETITION, // must precede subsequent steps
        AnalysisTypeKey.BUSINESS_AND_MOAT,
        AnalysisTypeKey.FAIR_VALUE,
        AnalysisTypeKey.FUTURE_RISK,
        AnalysisTypeKey.PAST_PERFORMANCE,
        AnalysisTypeKey.FUTURE_GROWTH,
        AnalysisTypeKey.FINAL_SUMMARY,
        AnalysisTypeKey.CACHED_SCORE,
      ];

      for (const step of sequence) {
        await generateAnalysis(step, ticker, onReportGenerated);
        await new Promise((r) => setTimeout(r, 1_000));
      }

      const allInvestors: InvestorKey[] = ['WARREN_BUFFETT', 'CHARLIE_MUNGER', 'BILL_ACKMAN'];
      for (const inv of allInvestors) {
        await generateInvestorAnalysis(inv, ticker, onReportGenerated);
        await new Promise((r) => setTimeout(r, 1_000));
      }

      // final score refresh
      await generateAnalysis(AnalysisTypeKey.CACHED_SCORE, ticker, onReportGenerated);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate selected report types synchronously for multiple tickers.
   * Each ticker processes its selected steps in sequence (to respect deps).
   */
  const generateReportsSynchronously = async (
    tickers: string[],
    selectedReportTypes: string[],
    onReportGenerated?: (ticker: string) => void
  ): Promise<void> => {
    if (tickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const perTicker = tickers.map(async (ticker) => {
        for (const reportType of selectedReportTypes) {
          if (reportType.startsWith(INVESTOR_ANALYSIS_PREFIX)) {
            const investorKey = reportType.replace(INVESTOR_ANALYSIS_PREFIX, '') as InvestorKey;
            await generateInvestorAnalysis(investorKey, ticker, onReportGenerated);
          } else {
            await generateAnalysis(reportType, ticker, onReportGenerated);
          }
          await new Promise((r) => setTimeout(r, 1_000));
        }
      });
      await Promise.all(perTicker);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Batch background generation for specific report types and tickers.
   * Always sends a single POST with an array of payloads (batch), even when length === 1.
   */
  const generateSpecificReportsInBackground = async (tickers: string[], selectedReportTypes: string[]): Promise<void> => {
    if (tickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => {
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

        selectedReportTypes.forEach((rt) => {
          if (rt === AnalysisTypeKey.COMPETITION) payload.regenerateCompetition = true;
          else if (rt === AnalysisTypeKey.FINANCIAL_ANALYSIS) payload.regenerateFinancialAnalysis = true;
          else if (rt === AnalysisTypeKey.BUSINESS_AND_MOAT) payload.regenerateBusinessAndMoat = true;
          else if (rt === AnalysisTypeKey.PAST_PERFORMANCE) payload.regeneratePastPerformance = true;
          else if (rt === AnalysisTypeKey.FUTURE_GROWTH) payload.regenerateFutureGrowth = true;
          else if (rt === AnalysisTypeKey.FAIR_VALUE) payload.regenerateFairValue = true;
          else if (rt === AnalysisTypeKey.FUTURE_RISK) payload.regenerateFutureRisk = true;
          else if (rt === AnalysisTypeKey.FINAL_SUMMARY) payload.regenerateFinalSummary = true;
          else if (rt === AnalysisTypeKey.CACHED_SCORE) payload.regenerateCachedScore = true;
          else if (rt === createInvestorAnalysisKey('WARREN_BUFFETT')) payload.regenerateWarrenBuffett = true;
          else if (rt === createInvestorAnalysisKey('CHARLIE_MUNGER')) payload.regenerateCharlieMunger = true;
          else if (rt === createInvestorAnalysisKey('BILL_ACKMAN')) payload.regenerateBillAckman = true;
        });

        return payload;
      });

      await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Batch background generation for all report types for tickers with many missing reports.
   * Always sends a single POST with an array of payloads (batch), even when length === 1.
   */
  const generateAllReportsInBackground = async (tickers: string[]): Promise<void> => {
    if (tickers.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => ({
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
      }));

      await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Batch generate "full" background requests for a list of tickers.
   * Replaces the old single-ticker helper. Always batched.
   */
  const createFullBackgroundGenerationRequests = async (tickers: string[]): Promise<void> => {
    if (tickers.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => ({
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
      }));

      await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Batch create background requests where each item enables only its failed steps.
   * Accepts an array to keep this strictly batch-only even for a single ticker.
   */
  const createFailedPartsOnlyGenerationRequests = async (items: { ticker: string; failedSteps: string[] }[]): Promise<void> => {
    if (items.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = items
        .filter((it) => it.ticker && (it.failedSteps?.length ?? 0) > 0)
        .map((it) => {
          const p: GenerationRequestPayload = {
            ticker: it.ticker,
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

          it.failedSteps.forEach((step) => {
            if (step === AnalysisTypeKey.COMPETITION) p.regenerateCompetition = true;
            else if (step === AnalysisTypeKey.FINANCIAL_ANALYSIS) p.regenerateFinancialAnalysis = true;
            else if (step === AnalysisTypeKey.BUSINESS_AND_MOAT) p.regenerateBusinessAndMoat = true;
            else if (step === AnalysisTypeKey.PAST_PERFORMANCE) p.regeneratePastPerformance = true;
            else if (step === AnalysisTypeKey.FUTURE_GROWTH) p.regenerateFutureGrowth = true;
            else if (step === AnalysisTypeKey.FAIR_VALUE) p.regenerateFairValue = true;
            else if (step === AnalysisTypeKey.FUTURE_RISK) p.regenerateFutureRisk = true;
            else if (step === AnalysisTypeKey.FINAL_SUMMARY) p.regenerateFinalSummary = true;
            else if (step === AnalysisTypeKey.CACHED_SCORE) p.regenerateCachedScore = true;
            else if (step === createInvestorAnalysisKey('WARREN_BUFFETT')) p.regenerateWarrenBuffett = true;
            else if (step === createInvestorAnalysisKey('CHARLIE_MUNGER')) p.regenerateCharlieMunger = true;
            else if (step === createInvestorAnalysisKey('BILL_ACKMAN')) p.regenerateBillAckman = true;
          });

          return p;
        });

      if (payloads.length === 0) return;

      await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate missing reports smartly:
   * - If some tickers have many missing reports, send full-generation batch for them.
   * - For the rest, send per-report-type batches.
   * - If none have many missing reports, send one batch for all tickers and all types.
   */
  const generateMissingReports = async (
    tickersWithReportTypes: { ticker: string; reportTypes: string[] }[],
    tickersWithManyMissingReports?: string[]
  ): Promise<void> => {
    if (tickersWithReportTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const allTickers: string[] = tickersWithReportTypes.map((t) => t.ticker);
      const allReportTypes: string[] = Array.from(new Set(tickersWithReportTypes.flatMap((t) => t.reportTypes)));

      if (tickersWithManyMissingReports && tickersWithManyMissingReports.length > 0) {
        // Full regeneration for high-miss tickers
        await generateAllReportsInBackground(tickersWithManyMissingReports);

        // For remaining, group by report type
        const remaining: string[] = allTickers.filter((t) => !tickersWithManyMissingReports.includes(t));

        if (remaining.length > 0) {
          const typeToTickers: Record<string, string[]> = {};
          tickersWithReportTypes
            .filter((x) => remaining.includes(x.ticker))
            .forEach(({ ticker, reportTypes }) => {
              reportTypes.forEach((rt) => {
                if (!typeToTickers[rt]) typeToTickers[rt] = [];
                typeToTickers[rt].push(ticker);
              });
            });

          for (const [rt, tickers] of Object.entries(typeToTickers)) {
            await generateSpecificReportsInBackground(tickers, [rt]);
          }
        }
      } else {
        // Single batch for everything
        await generateSpecificReportsInBackground(allTickers, allReportTypes);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    /** exports used by UI */
    generateAllReportsForTicker,
    generateReportsSynchronously,
    generateSpecificReportsInBackground,
    generateAllReportsInBackground,
    generateMissingReports,
    createFullBackgroundGenerationRequests,
    createFailedPartsOnlyGenerationRequests,

    /** state */
    isGenerating: isGenerating || analysisLoading || requestLoading,
    analysisLoading,
    requestLoading,
  };
};
