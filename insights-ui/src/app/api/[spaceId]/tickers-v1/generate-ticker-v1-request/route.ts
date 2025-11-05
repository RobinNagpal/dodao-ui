import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { calculatePendingSteps } from '@/utils/analysis-reports/calculate-pending-steps';
import { triggerGenerationOfAReport } from '@/utils/analysis-reports/generation-report-utils';
import { markAsCompleted } from '@/utils/analysis-reports/report-status-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerV1GenerationRequest } from '@prisma/client';

interface GenerationRequestsResponse {
  inProgressRequests: (TickerV1GenerationRequest & { pendingSteps: ReportType[] })[];
  justStartedRequests: TickerV1GenerationRequest[];
  requests: TickerV1GenerationRequestWithTicker[];
  processedCount: number;
  message: string;
}

async function getInProgressRequests() {
  return await prisma.tickerV1GenerationRequest.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
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
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // First, check how many InProgress requests exist
  let inProgressRequests = await getInProgressRequests();

  for (const request of inProgressRequests) {
    const allStepsCompleted = calculatePendingSteps(request).length === 0;
    if (allStepsCompleted) {
      await markAsCompleted(request);
    }
  }

  inProgressRequests = await getInProgressRequests();

  // If there are 10 or more InProgress requests, return nothing
  if (inProgressRequests.length >= 10) {
    return {
      inProgressRequests: inProgressRequests.map((r) => {
        return {
          ...r,
          pendingSteps: calculatePendingSteps(r),
        };
      }),
      justStartedRequests: [],
      requests: [],
      processedCount: 0,
      message: `Already have ${inProgressRequests.length} requests in progress. Skipping processing.`,
    };
  }

  // Calculate how many NotStarted requests we can fetch (max 10 total)
  const maxNotStartedRequests = 10 - inProgressRequests.length;

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
  for (const request of [...inProgressRequests, ...notStartedRequests]) {
    try {
      console.log(`Processing request ${request.id} for ticker ${request.ticker.symbol}`);
      await triggerGenerationOfAReport(request.ticker.symbol, request.id);

      // Get the updated request to include in the response
      const updatedRequest = await prisma.tickerV1GenerationRequest.findUnique({
        where: { id: request.id },
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

      if (updatedRequest) {
        // Add pending steps to the request
        const requestWithPendingSteps = {
          ...updatedRequest,
          pendingSteps: calculatePendingSteps(updatedRequest),
        };

        processedRequests.push(requestWithPendingSteps as TickerV1GenerationRequestWithTicker);
        processedCount++;
      }
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
    }
  }

  return {
    inProgressRequests: inProgressRequests.map((r) => {
      return {
        ...r,
        pendingSteps: calculatePendingSteps(r),
      };
    }),
    justStartedRequests: notStartedRequests,
    requests: processedRequests,
    processedCount,
    message: `Processed ${processedCount} out of ${notStartedRequests.length} requests. ${inProgressRequests.length} requests were already in progress.`,
  };
}

export const GET = withErrorHandlingV2<GenerationRequestsResponse>(getHandler);
