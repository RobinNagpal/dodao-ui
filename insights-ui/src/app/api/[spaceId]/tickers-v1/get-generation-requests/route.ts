import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';

interface GenerationRequestsResponse {
  requests: TickerV1GenerationRequestWithTicker[];
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // First, check how many InProgress requests exist
  const inProgressCount = await prisma.tickerV1GenerationRequest.count({
    where: {
      spaceId,
      status: GenerationRequestStatus.InProgress,
    },
  });

  // If there are more than 10 InProgress requests, return nothing
  if (inProgressCount > 10) {
    return {
      requests: [],
    };
  }

  // Calculate how many NotStarted requests we can fetch (max 20 total, min 1)
  const maxNotStartedRequests = Math.max(1, 20 - inProgressCount);

  // Get NotStarted requests with ticker information
  const notStartedRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      spaceId,
      status: GenerationRequestStatus.NotStarted,
    },
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: maxNotStartedRequests,
  });

  return {
    requests: notStartedRequests as TickerV1GenerationRequestWithTicker[],
  };
}

export const GET = withErrorHandlingV2<GenerationRequestsResponse>(getHandler);
