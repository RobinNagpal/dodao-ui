import { prisma } from '@/prisma';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { trigggerGenerationOfAReport } from '@/utils/analysis-reports/generation-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface GenerationRequestsResponse {
  requests: TickerV1GenerationRequestWithTicker[];
  processedCount: number;
  message: string;
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // First, check how many InProgress requests exist
  const inProgressCount = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      spaceId,
      status: GenerationRequestStatus.InProgress,
    },
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
  });

  // If there are 10 or more InProgress requests, return nothing
  if (inProgressCount.length >= 10) {
    return {
      requests: [],
      processedCount: 0,
      message: `Already have ${inProgressCount} requests in progress. Skipping processing.`,
    };
  }

  // Calculate how many NotStarted requests we can fetch (max 10 total)
  const maxNotStartedRequests = 10 - inProgressCount.length;

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

  let processedCount = 0;
  const processedRequests: TickerV1GenerationRequestWithTicker[] = [];

  // Loop through each request and call Python backend
  for (const request of [...inProgressCount, ...notStartedRequests]) {
    try {
      console.log(`Processing request ${request.id} for ticker ${request.ticker.symbol}`);
      await trigggerGenerationOfAReport(request.ticker.symbol, request.id);
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
    }
  }

  return {
    requests: processedRequests,
    processedCount,
    message: `Processed ${processedCount} out of ${notStartedRequests.length} requests. ${inProgressCount} requests were already in progress.`,
  };
}

export const GET = withErrorHandlingV2<GenerationRequestsResponse>(getHandler);
