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
    name: string;
    industry: {
      name: string;
      industryKey: string;
    };

    subIndustry: {
      name: string;
      subIndustryKey: string;
    };
  };
}

export interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequestWithTicker[];
  failed: TickerV1GenerationRequestWithTicker[];
  notStarted: TickerV1GenerationRequestWithTicker[];
  completed: TickerV1GenerationRequestWithTicker[];
  counts: {
    inProgress: number;
    failed: number;
    notStarted: number;
    completed: number;
  };
}

async function getRequests(status: GenerationRequestStatus): Promise<TickerV1GenerationRequestWithTicker[]> {
  return prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: status,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 15, // Limit to 15 results
    include: {
      ticker: {
        select: {
          symbol: true,
          exchange: true,
          name: true,
          industry: {
            select: {
              name: true,
              industryKey: true,
            },
          },
          subIndustry: {
            select: {
              name: true,
              subIndustryKey: true,
            },
          },
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

  // Get the failed requests
  const failedStatus = GenerationRequestStatus.Failed;
  const failedRequests = await getRequests(failedStatus);

  // Get the not started requests
  const notStartedStatus = GenerationRequestStatus.NotStarted;
  const notStartedRequests = await getRequests(notStartedStatus);

  // Get the completed requests
  const completedStatus = GenerationRequestStatus.Completed;
  const completedRequests = await getRequests(completedStatus);

  // Get total counts for each status
  const inProgressCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: inProgressStatus },
  });

  const failedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: failedStatus },
  });

  const notStartedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: notStartedStatus },
  });

  const completedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: completedStatus },
  });

  return {
    inProgress: inProgressRequests,
    failed: failedRequests,
    notStarted: notStartedRequests,
    completed: completedRequests,
    counts: {
      inProgress: inProgressCount,
      failed: failedCount,
      notStarted: notStartedCount,
      completed: completedCount,
    },
  };
}

export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
