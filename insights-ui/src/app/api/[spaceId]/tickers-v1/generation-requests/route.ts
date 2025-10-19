import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface TickerV1GenerationRequestWithTicker extends TickerV1GenerationRequest {
  ticker: {
    symbol: string;
    exchange: string;
  };
}

export interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequestWithTicker[];
  failed: TickerV1GenerationRequestWithTicker[];
  notStarted: TickerV1GenerationRequestWithTicker[];
  completed: TickerV1GenerationRequestWithTicker[];
}

async function getRequests(status: GenerationRequestStatus): Promise<TickerV1GenerationRequestWithTicker[]> {
  return prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: status,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      ticker: {
        select: {
          symbol: true,
          exchange: true,
        },
      },
    },
  });
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<GenerationRequestsResponse> {
  // Get in progress requests
  const inProgressStatus = GenerationRequestStatus.InProgress;
  const inProgressRequests = await getRequests(inProgressStatus);

  // Get the last 10 failed requests
  const failedStatus = GenerationRequestStatus.Failed;
  const failedRequests = await getRequests(failedStatus);

  // Get the last 10 not started requests
  const notStartedStatus = GenerationRequestStatus.NotStarted;
  const notStartedRequests = await getRequests(notStartedStatus);

  const completedStatus = GenerationRequestStatus.Completed;
  const completedRequests = await getRequests(completedStatus);

  // Map the requests to include the ticker symbol

  return {
    inProgress: inProgressRequests,
    failed: failedRequests,
    notStarted: notStartedRequests,
    completed: completedRequests,
  };
}

export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
