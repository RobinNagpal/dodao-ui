import { prisma } from '@/prisma';
import { settleReportCredit } from '@/utils/credits/credit-service';
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
    case ReportType.STABILITY:
      return request.regenerateStability;
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

/**
 * Starts `reportToGenerate`. Guarded on an open status (`updateMany` + count), so
 * a stale trigger — e.g. a late step's save on a request that already ended —
 * can't reopen a Completed / Failed request (its credit is already settled).
 * Returns false when the request is no longer open; the caller must stop.
 */
export async function markAsInProgress(generationRequest: TickerV1GenerationRequest & { ticker: TickerV1 }, reportToGenerate: ReportType): Promise<boolean> {
  if (generationRequest.status === GenerationRequestStatus.NotStarted) {
    console.log('Starting generation request for', generationRequest.ticker.symbol);
  }
  const started = await prisma.tickerV1GenerationRequest.updateMany({
    where: {
      id: generationRequest.id,
      status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] },
    },
    data: {
      inProgressStep: reportToGenerate,
      lastInvocationTime: new Date(),
      status: GenerationRequestStatus.InProgress,
      startedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  if (started.count === 0) {
    console.log('Generation request has already ended - not starting', reportToGenerate, 'for', generationRequest.ticker.symbol, generationRequest.id);
    return false;
  }
  return true;
}

/**
 * A step saved after its request already ended (e.g. a step that ran past the
 * stale-step timeout, so the request ended Failed without it) rewrote part of the
 * report, so it still moves the "Report generated on ..." date — but nothing
 * else: the status and the credit were settled when the request ended.
 *
 * Detected as the request row changing after it ended (`updatedAt > completedAt`;
 * the save writes `completedSteps`, and ending sets both to the same instant).
 * The date is set to that change's time and only ever moved forward, so calling
 * this again for the same request is a no-op.
 */
export async function moveReportDateForSaveAfterEnd(generationRequest: TickerV1GenerationRequest): Promise<void> {
  const { completedAt, updatedAt } = generationRequest;
  if (!completedAt || generationRequest.completedSteps.length === 0 || updatedAt.getTime() <= completedAt.getTime()) {
    return;
  }
  const moved = await prisma.tickerV1.updateMany({
    where: { id: generationRequest.tickerId, OR: [{ lastReportGeneratedAt: null }, { lastReportGeneratedAt: { lt: updatedAt } }] },
    data: { lastReportGeneratedAt: updatedAt },
  });
  if (moved.count > 0) {
    console.log('Moved the report date for a step saved after its generation request ended', generationRequest.id);
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
  const completedAt = new Date();

  // Atomic claim: the heartbeat and the step-save trigger can both reach here for
  // the same request. Only the caller that moves it out of an open status ends
  // it; the other stops, so the follow-up work below runs once per request.
  const ended = await prisma.tickerV1GenerationRequest.updateMany({
    where: {
      id: generationRequest.id,
      status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] },
    },
    data: {
      status: hasFailed ? GenerationRequestStatus.Failed : GenerationRequestStatus.Completed,
      completedAt,
      updatedAt: completedAt,
    },
  });
  if (ended.count === 0) {
    console.log('Generation request was already ended by another caller - skipping', generationRequest.id);
    await moveReportDateForSaveAfterEnd(generationRequest);
    return;
  }

  // The single "Report generated on ..." date shown to visitors. Any completed
  // step rewrote part of the report, so a partial run still moves the date.
  if (generationRequest.completedSteps.length > 0) {
    await prisma.tickerV1.update({
      where: { id: generationRequest.tickerId },
      data: { lastReportGeneratedAt: completedAt },
    });
  }

  // Settles the credit a user reserved for this request, from the status just
  // stored: charged in Stripe on Completed, released uncharged on Failed. This
  // is the only place a stock run settles. No-op for admin/cron requests.
  await settleReportCredit(generationRequest.id);
}
