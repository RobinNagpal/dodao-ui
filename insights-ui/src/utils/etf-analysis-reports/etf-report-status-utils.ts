import { prisma } from '@/prisma';
import { settleReportCredit } from '@/utils/credits/credit-service';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { Etf, EtfGenerationRequest } from '@prisma/client';

/**
 * Starts `reportToGenerate`, guarded on an open status like the stock
 * `markAsInProgress`: a stale trigger can't reopen a Completed / Failed request.
 * Returns false when the request is no longer open; the caller must stop.
 */
export async function markEtfRequestAsInProgress(generationRequest: EtfGenerationRequest & { etf: Etf }, reportToGenerate: EtfReportType): Promise<boolean> {
  const started = await prisma.etfGenerationRequest.updateMany({
    where: {
      id: generationRequest.id,
      status: { in: [EtfGenerationRequestStatus.NotStarted, EtfGenerationRequestStatus.InProgress] },
    },
    data: {
      inProgressStep: reportToGenerate,
      lastInvocationTime: new Date(),
      status: EtfGenerationRequestStatus.InProgress,
      startedAt: generationRequest.startedAt || new Date(),
      updatedAt: new Date(),
    },
  });
  if (started.count === 0) {
    console.log('ETF generation request has already ended - not starting', reportToGenerate, 'for', generationRequest.etf.symbol, generationRequest.id);
    return false;
  }
  return true;
}

/** ETF twin of the stock `moveReportDateForSaveAfterEnd`: a step saved after the request ended still moves the report date, nothing else. */
export async function moveEtfReportDateForSaveAfterEnd(generationRequest: EtfGenerationRequest): Promise<void> {
  const { completedAt, updatedAt } = generationRequest;
  if (!completedAt || generationRequest.completedSteps.length === 0 || updatedAt.getTime() <= completedAt.getTime()) {
    return;
  }
  const moved = await prisma.etf.updateMany({
    where: { id: generationRequest.etfId, OR: [{ lastReportGeneratedAt: null }, { lastReportGeneratedAt: { lt: updatedAt } }] },
    data: { lastReportGeneratedAt: updatedAt },
  });
  if (moved.count > 0) {
    console.log('Moved the ETF report date for a step saved after its generation request ended', generationRequest.id);
  }
}

export async function markEtfRequestAsCompleted(generationRequest: EtfGenerationRequest): Promise<void> {
  // Before finalizing, give each failed step exactly ONE retry: move steps that
  // haven't been retried yet out of failedSteps (recording them in retriedSteps)
  // so calculateEtfPendingSteps picks them up again, and keep the request open.
  // A step that fails again after its retry stays in failedSteps and is terminal.
  // Mirrors the stock markAsCompleted retry model — the ETF steps most affected by
  // transient failures (a killed in-flight call, a one-off short/malformed LLM
  // response) are risk-analysis and the final-summary that cascade-fails with it.
  const stepsToRetry = generationRequest.failedSteps.filter((step) => !generationRequest.retriedSteps.includes(step));
  if (stepsToRetry.length > 0) {
    console.log('Retrying failed ETF steps once for generation request', generationRequest.id, ':', stepsToRetry);
    await prisma.etfGenerationRequest.update({
      where: { id: generationRequest.id },
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

  // Atomic claim, as in the stock markAsCompleted: only the caller that moves the
  // request out of an open status ends it and runs the follow-up work below.
  const ended = await prisma.etfGenerationRequest.updateMany({
    where: {
      id: generationRequest.id,
      status: { in: [EtfGenerationRequestStatus.NotStarted, EtfGenerationRequestStatus.InProgress] },
    },
    data: {
      status: hasFailed ? EtfGenerationRequestStatus.Failed : EtfGenerationRequestStatus.Completed,
      completedAt,
      updatedAt: completedAt,
    },
  });
  if (ended.count === 0) {
    console.log('ETF generation request was already ended by another caller - skipping', generationRequest.id);
    await moveEtfReportDateForSaveAfterEnd(generationRequest);
    return;
  }

  // Mirrors the stock path: any completed step rewrote part of the report, so
  // the single "Report generated on ..." date moves even for a partial run.
  if (generationRequest.completedSteps.length > 0) {
    await prisma.etf.update({
      where: { id: generationRequest.etfId },
      data: { lastReportGeneratedAt: completedAt },
    });
  }

  // Charges the reserved credit on success, releases it uncharged when the
  // request ends in Failed. No-op for admin/cron requests, which never held a credit.
  await settleReportCredit(generationRequest.id);
}
