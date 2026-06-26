import { prisma } from '@/prisma';
import { EtfReportType, ETF_REPORT_TYPE_TO_CATEGORY } from '@/types/etf/etf-analysis-types';
import { triggerEtfGenerationOfAReport } from '@/utils/etf-analysis-reports/etf-generation-report-utils';
import {
  saveEtfCompetitionResponse,
  saveEtfFactorAnalysisResponse,
  saveEtfFinalSummaryResponse,
  saveEtfFutureReturns,
  saveEtfKeyFactsResponse,
} from '@/utils/etf-analysis-reports/save-etf-report-utils';

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
 * Steps (unchanged from the original route):
 *  1. Save the report for `reportType` (Future Performance Outlook also persists
 *     the expected forward returns in their own table).
 *  2. If this save is part of a generation request: mark the step completed,
 *     clear `inProgressStep`/`lastInvocationTime`, then trigger the next step.
 */
export async function saveEtfReportAndAdvanceGeneration(args: SaveEtfReportAndAdvanceArgs): Promise<void> {
  const { exchange, etf, reportType, llmResponse, generationRequestId } = args;

  if (reportType === EtfReportType.FINAL_SUMMARY) {
    await saveEtfFinalSummaryResponse(etf, exchange, llmResponse);
  } else if (reportType === EtfReportType.KEY_FACTS) {
    await saveEtfKeyFactsResponse(etf, exchange, llmResponse);
  } else if (reportType === EtfReportType.COMPETITION) {
    await saveEtfCompetitionResponse(etf, exchange, llmResponse);
  } else {
    const categoryKey = ETF_REPORT_TYPE_TO_CATEGORY[reportType];
    if (!categoryKey) {
      throw new Error(`Unsupported ETF report type: ${reportType}`);
    }

    await saveEtfFactorAnalysisResponse(etf, exchange, llmResponse, categoryKey);

    // The Future Performance Outlook report returns the standard category analysis
    // plus expected forward returns; persist the latter in their own table.
    if (reportType === EtfReportType.FUTURE_PERFORMANCE_OUTLOOK) {
      await saveEtfFutureReturns(etf, exchange, llmResponse);
    }
  }

  if (generationRequestId) {
    const generationRequest = await prisma.etfGenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });

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
