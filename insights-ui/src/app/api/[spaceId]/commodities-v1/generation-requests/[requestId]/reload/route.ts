import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CommodityGenerationRequestStatus } from '@/types/commodity/commodity-analysis-types';
import { triggerCommodityGenerationOfAReport } from '@/utils/commodity-analysis-reports/commodity-generation-report-utils';
import { CommodityGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Retry a failed/stuck commodity generation request: clear its failed + in-progress
 * markers, reset it to NotStarted, and re-trigger processing in the background.
 */
async function postHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; requestId: string }> }
): Promise<CommodityGenerationRequest> {
  const { requestId } = await params;

  const existing = await prisma.commodityGenerationRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { commodity: { select: { slug: true } } },
  });

  const updated = await prisma.commodityGenerationRequest.update({
    where: { id: requestId },
    data: {
      status: CommodityGenerationRequestStatus.NotStarted,
      failedSteps: [],
      inProgressStep: null,
      completedAt: null,
      updatedAt: new Date(),
    },
  });

  void triggerCommodityGenerationOfAReport(existing.commodity.slug, requestId).catch((error) => {
    console.error(`Failed to reload commodity generation for ${existing.commodity.slug}:`, error);
  });

  return updated;
}

export const POST = withAdminOrToken<CommodityGenerationRequest>(postHandler);
