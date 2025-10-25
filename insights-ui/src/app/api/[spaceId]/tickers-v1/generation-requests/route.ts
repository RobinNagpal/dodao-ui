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
  pagination: {
    inProgress: { skip: number; take: number };
    failed: { skip: number; take: number };
    notStarted: { skip: number; take: number };
    completed: { skip: number; take: number };
  };
}

async function getRequests(status: GenerationRequestStatus, skip: number = 0, take: number = 15): Promise<TickerV1GenerationRequestWithTicker[]> {
  return prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: status,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
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
  // Parse pagination parameters from URL
  const url = new URL(req.url);

  // Get pagination parameters for each status
  const inProgressSkip = parseInt(url.searchParams.get('inProgressSkip') || '0', 10);
  const inProgressTake = parseInt(url.searchParams.get('inProgressTake') || '15', 10);

  const failedSkip = parseInt(url.searchParams.get('failedSkip') || '0', 10);
  const failedTake = parseInt(url.searchParams.get('failedTake') || '15', 10);

  const notStartedSkip = parseInt(url.searchParams.get('notStartedSkip') || '0', 10);
  const notStartedTake = parseInt(url.searchParams.get('notStartedTake') || '15', 10);

  const completedSkip = parseInt(url.searchParams.get('completedSkip') || '0', 10);
  const completedTake = parseInt(url.searchParams.get('completedTake') || '15', 10);

  // Get in progress requests
  const inProgressStatus = GenerationRequestStatus.InProgress;
  const inProgressRequests = await getRequests(inProgressStatus, inProgressSkip, inProgressTake);

  // Get the failed requests
  const failedStatus = GenerationRequestStatus.Failed;
  const failedRequests = await getRequests(failedStatus, failedSkip, failedTake);

  // Get the not started requests
  const notStartedStatus = GenerationRequestStatus.NotStarted;
  const notStartedRequests = await getRequests(notStartedStatus, notStartedSkip, notStartedTake);

  // Get the completed requests
  const completedStatus = GenerationRequestStatus.Completed;
  const completedRequests = await getRequests(completedStatus, completedSkip, completedTake);

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
    pagination: {
      inProgress: { skip: inProgressSkip, take: inProgressTake },
      failed: { skip: failedSkip, take: failedTake },
      notStarted: { skip: notStartedSkip, take: notStartedTake },
      completed: { skip: completedSkip, take: completedTake },
    },
  };
}

export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
