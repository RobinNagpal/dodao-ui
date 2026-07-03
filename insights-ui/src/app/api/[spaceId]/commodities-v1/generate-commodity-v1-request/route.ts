import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CommodityGenerationRequestStatus, CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { triggerCommodityGenerationOfAReport } from '@/utils/commodity-analysis-reports/commodity-generation-report-utils';
import { markCommodityRequestAsCompleted } from '@/utils/commodity-analysis-reports/commodity-report-status-utils';
import { calculateCommodityPendingSteps } from '@/utils/commodity-analysis-reports/commodity-report-steps-statuses';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CommodityGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

interface CommodityGenerationResponse {
  inProgressRequests: (CommodityGenerationRequest & { pendingSteps: CommodityReportType[] })[];
  justStartedRequests: CommodityGenerationRequest[];
  processedCount: number;
  message: string;
}

async function getInProgressRequests() {
  return prisma.commodityGenerationRequest.findMany({
    where: { spaceId: KoalaGainsSpaceId, status: CommodityGenerationRequestStatus.InProgress },
    include: { commodity: { select: { slug: true } } },
  });
}

/**
 * Resume/advance any pending commodity generation requests. Commodities have no
 * cron (only ~20-30 of them, generated on demand from the admin page), but this
 * endpoint exists so a stuck/interrupted request can be nudged forward — same
 * shape as the ETF `generate-etf-v1-request` route.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<CommodityGenerationResponse> {
  const { spaceId } = await params;

  let inProgressRequests = await getInProgressRequests();
  for (const request of inProgressRequests) {
    if (calculateCommodityPendingSteps(request).length === 0) {
      await markCommodityRequestAsCompleted(request);
    }
  }
  inProgressRequests = await getInProgressRequests();

  const maxNotStarted = 10 - inProgressRequests.length;
  const notStartedRequests = await prisma.commodityGenerationRequest.findMany({
    where: { spaceId, status: CommodityGenerationRequestStatus.NotStarted },
    include: { commodity: { select: { slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: Math.max(0, maxNotStarted),
  });

  let processedCount = 0;
  for (const request of [...inProgressRequests, ...notStartedRequests]) {
    try {
      await triggerCommodityGenerationOfAReport(request.commodity.slug, request.id);
      processedCount++;
    } catch (error) {
      console.error(`Error processing commodity request ${request.id}:`, error);
    }
  }

  const updatedInProgress = await getInProgressRequests();
  return {
    inProgressRequests: updatedInProgress.map((r) => ({ ...r, pendingSteps: calculateCommodityPendingSteps(r) })),
    justStartedRequests: notStartedRequests,
    processedCount,
    message: `Processed ${processedCount} commodity requests. ${inProgressRequests.length} were already in progress.`,
  };
}

export const GET = withErrorHandlingV2<CommodityGenerationResponse>(getHandler);
