import { GenerationRequestPayload, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisRequest, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { InvestorKey, InvestorTypes, ReportType } from '@/types/ticker-typesv1';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface ReportTypeInfo {
  key: ReportType;
  label: string;
  reportType: ReportType;
}

/** Analysis types (moved from utils) */
export const reportTypes: ReportTypeInfo[] = [
  { key: ReportType.FINANCIAL_ANALYSIS, label: 'Financial Analysis', reportType: ReportType.FINANCIAL_ANALYSIS },
  { key: ReportType.COMPETITION, label: 'Competition', reportType: ReportType.COMPETITION },
  { key: ReportType.BUSINESS_AND_MOAT, label: 'Business & Moat', reportType: ReportType.BUSINESS_AND_MOAT },
  { key: ReportType.PAST_PERFORMANCE, label: 'Past Performance', reportType: ReportType.PAST_PERFORMANCE },
  { key: ReportType.FUTURE_GROWTH, label: 'Future Growth', reportType: ReportType.FUTURE_GROWTH },
  { key: ReportType.FAIR_VALUE, label: 'Fair Value', reportType: ReportType.FAIR_VALUE },
  { key: ReportType.FUTURE_RISK, label: 'Future Risk', reportType: ReportType.FUTURE_RISK },
  { key: ReportType.FINAL_SUMMARY, label: 'Final Summary/Meta/About', reportType: ReportType.FINAL_SUMMARY },
  { key: ReportType.WARREN_BUFFETT, label: 'Warren Buffett', reportType: ReportType.WARREN_BUFFETT },
  { key: ReportType.CHARLIE_MUNGER, label: 'Charlie Munger', reportType: ReportType.CHARLIE_MUNGER },
  { key: ReportType.BILL_ACKMAN, label: 'Bill Ackman', reportType: ReportType.BILL_ACKMAN },
];

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

  const generateAnalysis = async (
    analysisType: ReportType,
    ticker: TickerIdentifier,
    onReportGenerated?: (ticker: TickerIdentifier) => void
  ): Promise<void> => {
    if (!ticker || !ticker.symbol || !ticker.exchange) return;
    try {
      const payload: AnalysisRequest = {};
      const result = await postAnalysisTo(
        `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}/${analysisType}`,
        payload
      );
      if (result && onReportGenerated) onReportGenerated(ticker);
    } catch (err) {
      console.error(`Error generating ${analysisType} for ${ticker.symbol}-${ticker.exchange}:`, err);
    }
  };

  const generateInvestorAnalysis = async (
    investorKey: InvestorKey,
    ticker: TickerIdentifier,
    onReportGenerated?: (ticker: TickerIdentifier) => void
  ): Promise<void> => {
    if (!ticker || !ticker.symbol || !ticker.exchange) return;
    try {
      const payload: AnalysisRequest = { investorKey };
      const result = await postAnalysisTo(
        `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${ticker.exchange}/${ticker.symbol}/investor-analysis`,
        payload
      );
      if (result && onReportGenerated) onReportGenerated(ticker);
    } catch (err) {
      console.error(`Error generating investor analysis for ${ticker.symbol}-${ticker.exchange} (${investorKey}):`, err);
    }
  };

  /** --- public API --- */

  /**
   * Generate all reports for a single ticker (synchronously, respecting dependencies).
   */
  const generateAllReportsForTicker = async (ticker: TickerIdentifier, onReportGenerated?: (ticker: TickerIdentifier) => void): Promise<void> => {
    if (!ticker || !ticker.symbol || !ticker.exchange) return;

    setIsGenerating(true);
    try {
      const sequence: ReportType[] = [
        ReportType.FINANCIAL_ANALYSIS,
        ReportType.COMPETITION, // must precede subsequent steps
        ReportType.BUSINESS_AND_MOAT,
        ReportType.FAIR_VALUE,
        ReportType.FUTURE_RISK,
        ReportType.PAST_PERFORMANCE,
        ReportType.FUTURE_GROWTH,
        ReportType.FINAL_SUMMARY,
        ReportType.WARREN_BUFFETT,
        ReportType.CHARLIE_MUNGER,
        ReportType.BILL_ACKMAN,
      ];

      for (const step of sequence) {
        await generateAnalysis(step, ticker, onReportGenerated);
        await new Promise((r) => setTimeout(r, 1_000));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate selected report types synchronously for multiple tickers.
   * Each ticker processes its selected steps in sequence (to respect deps).
   */
  const generateReportsSynchronously = async (
    tickers: TickerIdentifier[],
    selectedReportTypes: ReportType[],
    onReportGenerated?: (ticker: TickerIdentifier) => void
  ): Promise<void> => {
    if (tickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const perTicker = tickers.map(async (ticker) => {
        for (const reportType of selectedReportTypes) {
          if (reportType === ReportType.WARREN_BUFFETT) {
            await generateInvestorAnalysis(InvestorTypes.WARREN_BUFFETT, ticker, onReportGenerated);
          } else if (reportType === ReportType.CHARLIE_MUNGER) {
            await generateInvestorAnalysis(InvestorTypes.CHARLIE_MUNGER, ticker, onReportGenerated);
          } else if (reportType === ReportType.BILL_ACKMAN) {
            await generateInvestorAnalysis(InvestorTypes.BILL_ACKMAN, ticker, onReportGenerated);
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
  const generateSpecificReportsInBackground = async (tickers: TickerIdentifier[], selectedReportTypes: ReportType[]): Promise<void> => {
    if (tickers.length === 0 || selectedReportTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => {
        const payload: GenerationRequestPayload = {
          ticker: { symbol: ticker.symbol, exchange: ticker.exchange },
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
        };

        selectedReportTypes.forEach((rt) => {
          if (rt === ReportType.COMPETITION) payload.regenerateCompetition = true;
          else if (rt === ReportType.FINANCIAL_ANALYSIS) payload.regenerateFinancialAnalysis = true;
          else if (rt === ReportType.BUSINESS_AND_MOAT) payload.regenerateBusinessAndMoat = true;
          else if (rt === ReportType.PAST_PERFORMANCE) payload.regeneratePastPerformance = true;
          else if (rt === ReportType.FUTURE_GROWTH) payload.regenerateFutureGrowth = true;
          else if (rt === ReportType.FAIR_VALUE) payload.regenerateFairValue = true;
          else if (rt === ReportType.FUTURE_RISK) payload.regenerateFutureRisk = true;
          else if (rt === ReportType.FINAL_SUMMARY) payload.regenerateFinalSummary = true;
          else if (rt === ReportType.WARREN_BUFFETT) payload.regenerateWarrenBuffett = true;
          else if (rt === ReportType.CHARLIE_MUNGER) payload.regenerateCharlieMunger = true;
          else if (rt === ReportType.BILL_ACKMAN) payload.regenerateBillAckman = true;
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
  const generateAllReportsInBackground = async (tickers: TickerIdentifier[]): Promise<void> => {
    if (tickers.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => ({
        ticker: { symbol: ticker.symbol, exchange: ticker.exchange },
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
  const createFullBackgroundGenerationRequests = async (tickers: TickerIdentifier[]): Promise<void> => {
    if (tickers.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = tickers.map((ticker) => ({
        ticker: { symbol: ticker.symbol, exchange: ticker.exchange },
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
  const createFailedPartsOnlyGenerationRequests = async (items: { ticker: TickerIdentifier; failedSteps: ReportType[] }[]): Promise<void> => {
    if (items.length === 0) return;

    setIsGenerating(true);
    try {
      const payloads: GenerationRequestPayload[] = items
        .filter((it) => it.ticker && it.ticker.symbol && it.ticker.exchange && (it.failedSteps?.length ?? 0) > 0)
        .map((it) => {
          const p: GenerationRequestPayload = {
            ticker: { symbol: it.ticker.symbol, exchange: it.ticker.exchange },
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
          };

          it.failedSteps.forEach((step) => {
            if (step === ReportType.COMPETITION) p.regenerateCompetition = true;
            else if (step === ReportType.FINANCIAL_ANALYSIS) p.regenerateFinancialAnalysis = true;
            else if (step === ReportType.BUSINESS_AND_MOAT) p.regenerateBusinessAndMoat = true;
            else if (step === ReportType.PAST_PERFORMANCE) p.regeneratePastPerformance = true;
            else if (step === ReportType.FUTURE_GROWTH) p.regenerateFutureGrowth = true;
            else if (step === ReportType.FAIR_VALUE) p.regenerateFairValue = true;
            else if (step === ReportType.FUTURE_RISK) p.regenerateFutureRisk = true;
            else if (step === ReportType.FINAL_SUMMARY) p.regenerateFinalSummary = true;
            else if (step === ReportType.WARREN_BUFFETT) p.regenerateWarrenBuffett = true;
            else if (step === ReportType.CHARLIE_MUNGER) p.regenerateCharlieMunger = true;
            else if (step === ReportType.BILL_ACKMAN) p.regenerateBillAckman = true;
          });

          return p;
        });

      if (payloads.length === 0) return;

      await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
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
    createFullBackgroundGenerationRequests,
    createFailedPartsOnlyGenerationRequests,

    /** state */
    isGenerating: isGenerating || analysisLoading || requestLoading,
    analysisLoading,
    requestLoading,
  };
};
