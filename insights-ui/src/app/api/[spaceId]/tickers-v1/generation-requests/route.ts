import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequest[];
  failed: TickerV1GenerationRequest[];
  notStarted: TickerV1GenerationRequest[];
  completed: TickerV1GenerationRequest[];
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // Get in progress requests
  const inProgressRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: GenerationRequestStatus.InProgress,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
  });

  // Get the last 10 failed requests
  const failedRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: GenerationRequestStatus.Failed,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
  });

  // Get the last 10 not started requests
  const notStartedRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: GenerationRequestStatus.NotStarted,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
  });

  const completedRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: GenerationRequestStatus.Completed,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
  });

  // Map the requests to include the ticker symbol
  const mapRequests = (requests: Array<TickerV1GenerationRequest & { ticker: { symbol: string } }>): TickerV1GenerationRequest[] => {
    return requests.map((request) => {
      const { ticker, ...rest } = request;
      return {
        ...rest,
        tickerId: ticker.symbol, // Replace tickerId with the ticker symbol for display
      } as TickerV1GenerationRequest;
    });
  };

  return {
    inProgress: mapRequests(inProgressRequests),
    failed: mapRequests(failedRequests),
    notStarted: mapRequests(notStartedRequests),
    completed: mapRequests(completedRequests),
  };
}

export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
