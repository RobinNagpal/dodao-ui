import { GenerationRequestPayload, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { LLMProvider } from '@/types/llmConstants';
import { InvestorKey, InvestorTypes, ReportType } from '@/types/ticker-typesv1';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

const GENERATION_REQUESTS_PATH = '/admin-v1/generation-requests';
/** A named target, so repeated batches reuse one Generation Requests tab instead of opening another each time. */
const GENERATION_REQUESTS_TAB = 'koalagains-generation-requests';

export interface ReportTypeInfo {
  key: ReportType;
  label: string;
  reportType: ReportType;
}

/**
 * Optional LLM provider/model chosen in the report-generation UI. When omitted
 * (or its fields are undefined) the backend falls back to the configured defaults.
 */
export interface ReportLlmSelection {
  llmProvider?: LLMProvider;
  model?: string;
}

/** Analysis types (moved from utils) */
export const reportTypes: ReportTypeInfo[] = [
  { key: ReportType.FINANCIAL_ANALYSIS, label: 'Financial Analysis', reportType: ReportType.FINANCIAL_ANALYSIS },
  { key: ReportType.COMPETITION, label: 'Competition', reportType: ReportType.COMPETITION },
  { key: ReportType.BUSINESS_AND_MOAT, label: 'Business & Moat', reportType: ReportType.BUSINESS_AND_MOAT },
  { key: ReportType.PAST_PERFORMANCE, label: 'Past Performance', reportType: ReportType.PAST_PERFORMANCE },
  { key: ReportType.FUTURE_GROWTH, label: 'Future Growth', reportType: ReportType.FUTURE_GROWTH },
  { key: ReportType.FAIR_VALUE, label: 'Fair Value', reportType: ReportType.FAIR_VALUE },
  { key: ReportType.MANAGEMENT_TEAM, label: 'Management Team', reportType: ReportType.MANAGEMENT_TEAM },
  { key: ReportType.STABILITY, label: 'Stability', reportType: ReportType.STABILITY },
  { key: ReportType.FINAL_SUMMARY, label: 'Final Summary/Meta/About', reportType: ReportType.FINAL_SUMMARY },
];

/** One item of a batched generation request: which report steps to (re)generate for a ticker. */
export interface TickerReportSteps {
  ticker: TickerIdentifier;
  steps: ReportType[];
}

/** Every report type — a "regenerate everything" request. */
const ALL_REPORT_TYPES: ReportType[] = reportTypes.map((rt) => rt.key);

function toPayload({ ticker, steps }: TickerReportSteps, llmSelection?: ReportLlmSelection): GenerationRequestPayload {
  return {
    ticker: { symbol: ticker.symbol, exchange: ticker.exchange },
    regenerateCompetition: steps.includes(ReportType.COMPETITION),
    regenerateFinancialAnalysis: steps.includes(ReportType.FINANCIAL_ANALYSIS),
    regenerateBusinessAndMoat: steps.includes(ReportType.BUSINESS_AND_MOAT),
    regeneratePastPerformance: steps.includes(ReportType.PAST_PERFORMANCE),
    regenerateFutureGrowth: steps.includes(ReportType.FUTURE_GROWTH),
    regenerateFairValue: steps.includes(ReportType.FAIR_VALUE),
    regenerateManagementTeam: steps.includes(ReportType.MANAGEMENT_TEAM),
    regenerateStability: steps.includes(ReportType.STABILITY),
    regenerateFinalSummary: steps.includes(ReportType.FINAL_SUMMARY),
    llmProvider: llmSelection?.llmProvider,
    llmModel: llmSelection?.model,
  };
}

/**
 * Hook for generating reports with consolidated logic.
 * All background requests use the BATCH endpoint (array payload),
 * even for a single ticker. Every generate function resolves `true` only when
 * the requests were actually queued — `usePostData` reports a failed POST with
 * a toast and resolves `undefined` rather than throwing, so callers must not
 * treat a resolved promise as success.
 */
export const useGenerateReports = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { showNotification } = useNotificationContext();

  // Background batch generation. All stock report generation now goes through
  // background generation requests (the synchronous per-report routes were removed).
  const { postData: postRequest, loading: requestLoading } = usePostData<unknown, GenerationRequestPayload[]>({
    successMessage: 'Background generation request created successfully!',
    errorMessage: 'Failed to create background generation request.',
  });

  /**
   * Showing the queue in a new tab keeps the admin's filters and selection on
   * the current screen for the next batch. Browsers only allow `window.open`
   * during the click that triggered it, not after the request has been
   * awaited, so the tab is reserved synchronously up front and pointed at the
   * queue (or closed again) once the outcome is known.
   *
   * Call this first thing in the click handler, before any `await`.
   */
  const reserveGenerationRequestsTab = (): Window | null => window.open('', GENERATION_REQUESTS_TAB);

  /** The requests were queued: show them in the reserved tab, or say so if the browser blocked it. */
  const showGenerationRequestsTab = (tab: Window | null): void => {
    if (tab) {
      tab.location.href = GENERATION_REQUESTS_PATH;
      tab.focus();
      return;
    }
    showNotification({ type: 'info', message: 'Requests queued. The Generation Requests tab was blocked — open it from the admin nav.' });
  };

  /** Nothing was queued: close the tab if it is still the blank one we just opened. */
  const discardGenerationRequestsTab = (tab: Window | null): void => {
    if (tab && tab.location.href === 'about:blank') tab.close();
  };

  /**
   * Queue one batched request enabling exactly the given steps per ticker.
   * Resolves `true` only when the POST succeeded.
   */
  const generateStepsInBackground = async (items: TickerReportSteps[], llmSelection?: ReportLlmSelection): Promise<boolean> => {
    const payloads: GenerationRequestPayload[] = items
      .filter((it) => it.ticker?.symbol && it.ticker?.exchange && it.steps.length > 0)
      .map((it) => toPayload(it, llmSelection));
    if (payloads.length === 0) return false;

    setIsGenerating(true);
    try {
      // Resolved per call: getBaseUrl() answers differently on the server and in the browser.
      const result = await postRequest(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`, payloads);
      return result !== undefined;
    } finally {
      setIsGenerating(false);
    }
  };

  /** The same report types for every ticker. */
  const generateSpecificReportsInBackground = (
    tickers: TickerIdentifier[],
    selectedReportTypes: ReportType[],
    llmSelection?: ReportLlmSelection
  ): Promise<boolean> =>
    generateStepsInBackground(
      tickers.map((ticker) => ({ ticker, steps: selectedReportTypes })),
      llmSelection
    );

  /** Every report type for every ticker. */
  const createFullBackgroundGenerationRequests = (tickers: TickerIdentifier[], llmSelection?: ReportLlmSelection): Promise<boolean> =>
    generateStepsInBackground(
      tickers.map((ticker) => ({ ticker, steps: ALL_REPORT_TYPES })),
      llmSelection
    );

  const generateAllReportsInBackground = createFullBackgroundGenerationRequests;

  /** Only the steps that failed last time, per ticker. */
  const createFailedPartsOnlyGenerationRequests = (
    items: { ticker: TickerIdentifier; failedSteps: ReportType[] }[],
    llmSelection?: ReportLlmSelection
  ): Promise<boolean> =>
    generateStepsInBackground(
      items.map(({ ticker, failedSteps }) => ({ ticker, steps: failedSteps ?? [] })),
      llmSelection
    );

  return {
    /** exports used by UI */
    generateStepsInBackground,
    generateSpecificReportsInBackground,
    generateAllReportsInBackground,
    createFullBackgroundGenerationRequests,
    createFailedPartsOnlyGenerationRequests,
    reserveGenerationRequestsTab,
    showGenerationRequestsTab,
    discardGenerationRequestsTab,

    /** state */
    isGenerating: isGenerating || requestLoading,
    requestLoading,
  };
};
