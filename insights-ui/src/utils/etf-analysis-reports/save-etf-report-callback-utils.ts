import { prisma } from '@/prisma';
import { EtfReportType, ETF_REPORT_TYPE_TO_CATEGORY } from '@/types/etf/etf-analysis-types';
import { triggerEtfGenerationOfAReport } from '@/utils/etf-analysis-reports/etf-generation-report-utils';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import {
  saveEtfCompetitionResponse,
  saveEtfFactorAnalysisResponse,
  saveEtfFinalSummaryResponse,
  saveEtfFutureReturns,
  saveEtfKeyFactsResponse,
} from '@/utils/etf-analysis-reports/save-etf-report-utils';
import { EtfGenerationRequest } from '@prisma/client';

export interface SaveEtfReportAndAdvanceArgs {
  exchange: string;
  etf: string;
  reportType: EtfReportType;
  /**
   * The raw LLM JSON. Untyped on purpose — the same object is dispatched to each
   * strongly-typed `save*` function below, exactly as the `save-report-callback`
   * route did when it read this straight off the request body.
   */
  llmResponse: any;
  generationRequestId?: string;
}

/**
 * Persists one ETF report and advances its generation request.
 *
 * This is the exact logic the ETF `save-report-callback` route used to run inline,
 * extracted into a single shared function so BOTH execution paths run identical
 * code:
 *  - the HTTP callback (AWS Lambda path) — the route awaits this, and
 *  - the in-process background path (`processEtfReportLLMResponseInBackground`),
 *    which calls this directly instead of POSTing back over HTTP.
 *
 * Steps (unchanged from the original route, plus deferred cache invalidation):
 *  1. Compute `skipRevalidation` — each step always invalidates its own narrow
 *     per-subpage tag (+ CloudFront URL), but the main-page umbrella tag is
 *     deferred and fired only on the LAST pending step, so a full generation
 *     invalidates the main report once instead of once per step. Mirrors the
 *     stocks pipeline (`saveTickerReportAndAdvanceGeneration`).
 *  2. Save the report for `reportType` (Future Performance Outlook also persists
 *     the expected forward returns in their own table).
 *  3. If this save is part of a generation request: mark the step completed,
 *     clear `inProgressStep`/`lastInvocationTime`, then trigger the next step.
 */
export async function saveEtfReportAndAdvanceGeneration(args: SaveEtfReportAndAdvanceArgs): Promise<void> {
  const { exchange, etf, reportType, llmResponse, generationRequestId } = args;

  // When this save is part of an ongoing generation request, only invalidate the
  // umbrella (main-page) tag when this is the LAST pending step. Intermediate
  // steps skip it so a full generation produces a single main-page invalidation
  // instead of one per step. A standalone save (no request) revalidates normally.
  let skipRevalidation = false;
  let generationRequest: EtfGenerationRequest | null = null;
  if (generationRequestId) {
    generationRequest = await prisma.etfGenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });
    const projectedCompletedSteps = generationRequest.completedSteps.includes(reportType)
      ? generationRequest.completedSteps
      : [...generationRequest.completedSteps, reportType];
    const remainingPendingSteps = calculateEtfPendingSteps({ ...generationRequest, completedSteps: projectedCompletedSteps });
    skipRevalidation = remainingPendingSteps.length > 0;
  }

  if (reportType === EtfReportType.FINAL_SUMMARY) {
    await saveEtfFinalSummaryResponse(etf, exchange, llmResponse, { skipRevalidation });
  } else if (reportType === EtfReportType.KEY_FACTS) {
    await saveEtfKeyFactsResponse(etf, exchange, llmResponse, { skipRevalidation });
  } else if (reportType === EtfReportType.COMPETITION) {
    await saveEtfCompetitionResponse(etf, exchange, llmResponse, { skipRevalidation });
  } else {
    const categoryKey = ETF_REPORT_TYPE_TO_CATEGORY[reportType];
    if (!categoryKey) {
      throw new Error(`Unsupported ETF report type: ${reportType}`);
    }

    await saveEtfFactorAnalysisResponse(etf, exchange, llmResponse, categoryKey, { skipRevalidation });

    // The Future Performance Outlook report returns the standard category analysis
    // plus expected forward returns; persist the latter in their own table.
    if (reportType === EtfReportType.FUTURE_PERFORMANCE_OUTLOOK) {
      await saveEtfFutureReturns(etf, exchange, llmResponse, { skipRevalidation });
    }
  }

  if (generationRequestId && generationRequest) {
    const updatedCompletedSteps = [...generationRequest.completedSteps];
    if (!updatedCompletedSteps.includes(reportType)) {
      updatedCompletedSteps.push(reportType);
    }

    await prisma.etfGenerationRequest.update({
      where: { id: generationRequestId },
      data: {
        completedSteps: updatedCompletedSteps,
        inProgressStep: null,
        lastInvocationTime: null,
      },
    });

    await triggerEtfGenerationOfAReport(etf, exchange, generationRequestId);
  }
}
