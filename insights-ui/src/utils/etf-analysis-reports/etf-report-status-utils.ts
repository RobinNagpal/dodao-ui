import { prisma } from '@/prisma';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { Etf, EtfGenerationRequest } from '@prisma/client';

export async function markEtfRequestAsInProgress(generationRequest: EtfGenerationRequest & { etf: Etf }, reportToGenerate: EtfReportType): Promise<void> {
  await prisma.etfGenerationRequest.update({
    where: { id: generationRequest.id },
    data: {
      inProgressStep: reportToGenerate,
      lastInvocationTime: new Date(),
      status: EtfGenerationRequestStatus.InProgress,
      startedAt: generationRequest.startedAt || new Date(),
      updatedAt: new Date(),
    },
  });
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

  await prisma.etfGenerationRequest.update({
    where: { id: generationRequest.id },
    data: {
      status: hasFailed ? EtfGenerationRequestStatus.Failed : EtfGenerationRequestStatus.Completed,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
