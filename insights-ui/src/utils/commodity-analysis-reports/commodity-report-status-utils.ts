import { prisma } from '@/prisma';
import { CommodityGenerationRequestStatus, CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { CommodityGenerationRequest } from '@prisma/client';

export async function markCommodityRequestAsInProgress(generationRequest: CommodityGenerationRequest, reportToGenerate: CommodityReportType): Promise<void> {
  await prisma.commodityGenerationRequest.update({
    where: { id: generationRequest.id },
    data: {
      inProgressStep: reportToGenerate,
      status: CommodityGenerationRequestStatus.InProgress,
      startedAt: generationRequest.startedAt || new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function markCommodityRequestAsCompleted(generationRequest: CommodityGenerationRequest): Promise<void> {
  const hasFailed = generationRequest.failedSteps.length > 0;

  await prisma.commodityGenerationRequest.update({
    where: { id: generationRequest.id },
    data: {
      status: hasFailed ? CommodityGenerationRequestStatus.Failed : CommodityGenerationRequestStatus.Completed,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
