import { prisma } from '@/prisma';
import { ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { triggerGenerationOfAReportSimplified } from '@/utils/analysis-reports/generation-report-utils';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  saveCompetitionAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveFinalSummaryResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  saveManagementTeamResponse,
  savePastPerformanceFactorAnalysisResponse,
} from '@/utils/analysis-reports/save-report-utils';

export interface SaveTickerReportAndAdvanceArgs {
  exchange: string;
  ticker: string;
  reportType: ReportType;
  /**
   * The raw LLM JSON. Untyped on purpose — the same object is dispatched to each
   * strongly-typed `save*` function below, exactly as the `save-report-callback`
   * route did when it read this straight off the request body.
   */
  llmResponse: any;
  generationRequestId?: string;
}

/**
 * Persists one stock (ticker V1) report and advances its generation request.
 *
 * This is the exact logic the `save-report-callback` route used to run inline,
 * extracted into a single shared function so BOTH execution paths run identical
 * code:
 *  - the HTTP callback (AWS Lambda path) — the route awaits this, and
 *  - the in-process background path (`processStockReportLLMResponseInBackground`),
 *    which calls this directly instead of POSTing back over HTTP.
 *
 * Steps (unchanged from the original route):
 *  1. Compute `skipRevalidation` — only the LAST pending step revalidates the
 *     page cache, so a full generation invalidates the cache once instead of
 *     once per step.
 *  2. Save the report for `reportType`.
 *  3. If this save is part of a generation request: mark the step completed,
 *     clear `inProgressStep`/`lastInvocationTime`, then trigger the next step.
 */
export async function saveTickerReportAndAdvanceGeneration(args: SaveTickerReportAndAdvanceArgs): Promise<void> {
  const { exchange, ticker, reportType, llmResponse, generationRequestId } = args;

  // When this save is part of an ongoing generation request, only revalidate the
  // page cache when this is the LAST pending step. Intermediate steps skip the
  // revalidation so a full generation produces a single cache invalidation
  // instead of one per step.
  let skipRevalidation = false;
  if (generationRequestId) {
    const currentRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });
    const projectedCompletedSteps = currentRequest.completedSteps.includes(reportType)
      ? currentRequest.completedSteps
      : [...currentRequest.completedSteps, reportType];
    const remainingPendingSteps = calculatePendingSteps({
      ...currentRequest,
      completedSteps: projectedCompletedSteps,
    });
    skipRevalidation = remainingPendingSteps.length > 0;
  }

  // Save the report based on the report type
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
      await saveBusinessAndMoatFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.BusinessAndMoat, { skipRevalidation });
      break;
    case ReportType.PAST_PERFORMANCE:
      await savePastPerformanceFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.PastPerformance, { skipRevalidation });
      break;
    case ReportType.FUTURE_GROWTH:
      await saveFutureGrowthFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FutureGrowth, { skipRevalidation });
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      await saveFinancialAnalysisFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FinancialStatementAnalysis, { skipRevalidation });
      break;
    case ReportType.COMPETITION:
      await saveCompetitionAnalysisResponse(ticker, exchange, llmResponse, { skipRevalidation });
      break;
    case ReportType.FAIR_VALUE:
      await saveFairValueFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FairValue, { skipRevalidation });
      break;
    case ReportType.MANAGEMENT_TEAM:
      await saveManagementTeamResponse(ticker, exchange, llmResponse, { skipRevalidation });
      break;
    case ReportType.FINAL_SUMMARY:
      await saveFinalSummaryResponse(ticker, exchange, llmResponse.finalSummary, llmResponse.metaDescription, llmResponse.aboutReport, { skipRevalidation });
      break;
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  // If we have a generation request ID, update the generation request to mark this report as completed
  if (generationRequestId) {
    // Get the current generation request
    const generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });

    // Add the current report to completedSteps if it's not already there
    const updatedCompletedSteps = [...generationRequest.completedSteps];
    if (!updatedCompletedSteps.includes(reportType)) {
      updatedCompletedSteps.push(reportType);
    }

    // Update the generation request
    await prisma.tickerV1GenerationRequest.update({
      where: { id: generationRequestId },
      data: {
        completedSteps: updatedCompletedSteps,
        inProgressStep: null,
        lastInvocationTime: null,
      },
    });

    // Trigger generation of the next report
    await triggerGenerationOfAReportSimplified(ticker, exchange, generationRequestId);
  }
}
