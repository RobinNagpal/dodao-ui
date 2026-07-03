import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CommodityGenerationRequestStatus, CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { triggerCommodityGenerationOfAReport } from '@/utils/commodity-analysis-reports/commodity-generation-report-utils';
import { calculateCommodityPendingSteps } from '@/utils/commodity-analysis-reports/commodity-report-steps-statuses';
import { CommodityGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface CommodityGenerationRequestPayload {
  slug: string;
  regenerateSupplyAndDemand?: boolean;
  regeneratePriceAndValue?: boolean;
  regenerateVolatilityAndRisk?: boolean;
  regenerateFutureOutlook?: boolean;
  regenerateKeyFacts?: boolean;
  regenerateFinalSummary?: boolean;
}

export interface CommodityGenerationRequestWithCommodity extends CommodityGenerationRequest {
  commodity: { slug: string; name: string; commodityGroup: string };
  pendingSteps?: CommodityReportType[];
}

export interface CommodityGenerationRequestsResponse {
  inProgress: CommodityGenerationRequestWithCommodity[];
  failed: CommodityGenerationRequestWithCommodity[];
  notStarted: CommodityGenerationRequestWithCommodity[];
  completed: CommodityGenerationRequestWithCommodity[];
  counts: { inProgress: number; failed: number; notStarted: number; completed: number };
}

async function getRequests(status: CommodityGenerationRequestStatus, skip: number, take: number): Promise<CommodityGenerationRequestWithCommodity[]> {
  const requests = await prisma.commodityGenerationRequest.findMany({
    where: { status },
    orderBy: { updatedAt: 'desc' },
    skip,
    take,
    include: { commodity: { select: { slug: true, name: true, commodityGroup: true } } },
  });
  return requests.map((request) => ({ ...request, pendingSteps: calculateCommodityPendingSteps(request) }));
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  _ctx: { params: Promise<{ spaceId: string }> }
): Promise<CommodityGenerationRequestsResponse> {
  const url = new URL(req.url);
  const take = parseInt(url.searchParams.get('take') || '100', 10);

  const [inProgress, failed, notStarted, completed, inProgressCount, failedCount, notStartedCount, completedCount] = await Promise.all([
    getRequests(CommodityGenerationRequestStatus.InProgress, 0, take),
    getRequests(CommodityGenerationRequestStatus.Failed, 0, take),
    getRequests(CommodityGenerationRequestStatus.NotStarted, 0, take),
    getRequests(CommodityGenerationRequestStatus.Completed, 0, take),
    prisma.commodityGenerationRequest.count({ where: { status: CommodityGenerationRequestStatus.InProgress } }),
    prisma.commodityGenerationRequest.count({ where: { status: CommodityGenerationRequestStatus.Failed } }),
    prisma.commodityGenerationRequest.count({ where: { status: CommodityGenerationRequestStatus.NotStarted } }),
    prisma.commodityGenerationRequest.count({ where: { status: CommodityGenerationRequestStatus.Completed } }),
  ]);

  return {
    inProgress,
    failed,
    notStarted,
    completed,
    counts: { inProgress: inProgressCount, failed: failedCount, notStarted: notStartedCount, completed: completedCount },
  };
}

/**
 * Create a generation request per payload and immediately kick it off. Because
 * commodities have no cron, the admin "Generate" button relies on this endpoint
 * both to create the request AND to start processing it in the background — the
 * `void trigger…` call runs the first step and the in-process chain handles the
 * rest. Any regenerate flag left unset defaults to true (generate everything).
 */
async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<CommodityGenerationRequest[]> {
  const { spaceId } = await params;
  const payloads = (await req.json()) as CommodityGenerationRequestPayload[];
  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('Request body must be a non-empty array of generation requests');
  }

  const results: CommodityGenerationRequest[] = [];

  for (const payload of payloads) {
    if (!payload.slug) throw new Error('Each generation request needs a commodity slug');

    const commodity = await prisma.commodity.findFirstOrThrow({
      where: { spaceId, slug: payload.slug },
      select: { id: true, slug: true },
    });

    const flags = {
      regenerateSupplyAndDemand: payload.regenerateSupplyAndDemand ?? true,
      regeneratePriceAndValue: payload.regeneratePriceAndValue ?? true,
      regenerateVolatilityAndRisk: payload.regenerateVolatilityAndRisk ?? true,
      regenerateFutureOutlook: payload.regenerateFutureOutlook ?? true,
      regenerateKeyFacts: payload.regenerateKeyFacts ?? true,
      regenerateFinalSummary: payload.regenerateFinalSummary ?? true,
    };

    const result = await prisma.commodityGenerationRequest.create({
      data: {
        commodityId: commodity.id,
        spaceId,
        status: CommodityGenerationRequestStatus.NotStarted,
        ...flags,
      },
    });

    // Fire-and-forget: start processing immediately (no cron for commodities).
    void triggerCommodityGenerationOfAReport(commodity.slug, result.id).catch((error) => {
      console.error(`Failed to start commodity generation for ${commodity.slug}:`, error);
    });

    results.push(result);
  }

  return results;
}

export const GET = withAdminOrToken<CommodityGenerationRequestsResponse>(getHandler);
export const POST = withAdminOrToken<CommodityGenerationRequest[]>(postHandler);
