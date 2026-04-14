import { prisma } from '@/prisma';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { Etf, EtfGenerationRequest } from '@prisma/client';

export async function markEtfRequestAsInProgress(
  generationRequest: EtfGenerationRequest & { etf: Etf },
  reportToGenerate: EtfReportType
): Promise<void> {
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
