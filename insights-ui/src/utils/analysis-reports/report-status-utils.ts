import { prisma } from '@/prisma';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { TickerV1, TickerV1GenerationRequest } from '@prisma/client';

/**
 * Helper function to check if a report should be regenerated
 */
export function shouldRegenerateReport(request: TickerV1GenerationRequest, reportType: ReportType): boolean {
  switch (reportType) {
    case ReportType.COMPETITION:
      return request.regenerateCompetition;
    case ReportType.FINANCIAL_ANALYSIS:
      return request.regenerateFinancialAnalysis;
    case ReportType.BUSINESS_AND_MOAT:
      return request.regenerateBusinessAndMoat;
    case ReportType.PAST_PERFORMANCE:
      return request.regeneratePastPerformance;
    case ReportType.FUTURE_GROWTH:
      return request.regenerateFutureGrowth;
    case ReportType.FAIR_VALUE:
      return request.regenerateFairValue;
    case ReportType.MANAGEMENT_TEAM:
      return request.regenerateManagementTeam;
    case ReportType.FINAL_SUMMARY:
      return request.regenerateFinalSummary;
    default:
      console.error(`Unknown report type: ${reportType}`);
      return false;
  }
}

/**
 * Checks if all reports that should be regenerated have been attempted (either completed or failed)
 */
export function areAllReportsAttempted(generationRequest: TickerV1GenerationRequest): boolean {
  return Object.entries(generationRequest)
    .filter(([key, value]) => key.startsWith('regenerate') && value === true)
    .every(([key]) => {
      const reportType = key.replace('regenerate', '');
      const reportTypeKey = Object.values(ReportType).find((type) => type.toUpperCase() === reportType.toUpperCase());
      return reportTypeKey && (generationRequest.completedSteps.includes(reportTypeKey) || generationRequest.failedSteps.includes(reportTypeKey));
    });
}

/**
 * Updates the generation request status for first-time runs
 */
export async function updateInitialStatus(generationRequest: TickerV1GenerationRequest & { ticker: TickerV1 }): Promise<void> {
  if (generationRequest.status === GenerationRequestStatus.NotStarted) {
    console.log('Starting generation request for', generationRequest.ticker.symbol);
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.InProgress,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    console.log('Generation request does not need to be updated for', generationRequest.ticker.symbol, 'because it is already :', generationRequest.status);
  }
}

export async function markAsInProgress(generationRequest: TickerV1GenerationRequest & { ticker: TickerV1 }, reportToGenerate: ReportType): Promise<void> {
  if (generationRequest.status === GenerationRequestStatus.NotStarted) {
    console.log('Starting generation request for', generationRequest.ticker.symbol);
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        inProgressStep: reportToGenerate,
        lastInvocationTime: new Date(),
        status: GenerationRequestStatus.InProgress,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        inProgressStep: reportToGenerate,
        lastInvocationTime: new Date(),
        status: GenerationRequestStatus.InProgress,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

export async function markAsCompleted(generationRequest: TickerV1GenerationRequest): Promise<void> {
  // Before finalizing, give each failed step exactly ONE retry: move steps that
  // haven't been retried yet out of failedSteps (recording them in retriedSteps)
  // so calculatePendingSteps picks them up again, and keep the request open.
  // A step that fails again after its retry stays in failedSteps and is terminal.
  const stepsToRetry = generationRequest.failedSteps.filter((step) => !generationRequest.retriedSteps.includes(step));
  if (stepsToRetry.length > 0) {
    console.log('Retrying failed steps once for generation request', generationRequest.id, ':', stepsToRetry);
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        failedSteps: generationRequest.failedSteps.filter((step) => generationRequest.retriedSteps.includes(step)),
        retriedSteps: [...generationRequest.retriedSteps, ...stepsToRetry],
        inProgressStep: null,
        updatedAt: new Date(),
      },
    });
    return;
  }

  const hasFailed = generationRequest.failedSteps.length > 0;

  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequest.id,
    },
    data: {
      status: hasFailed ? GenerationRequestStatus.Failed : GenerationRequestStatus.Completed,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
