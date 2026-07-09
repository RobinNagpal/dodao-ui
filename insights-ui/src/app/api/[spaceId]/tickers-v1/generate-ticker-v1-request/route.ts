import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { triggerGenerationOfAReportSimplified } from '@/utils/analysis-reports/generation-report-utils';
import { markAsCompleted } from '@/utils/analysis-reports/report-status-utils';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

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
          exchange: true,
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
          exchange: true,
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

  // Loop through each request
  for (const request of [...inProgressRequests, ...notStartedRequests]) {
    try {
      console.log(`Processing request ${request.id} for ticker ${request.ticker.symbol} on exchange ${request.ticker.exchange}`);
      await triggerGenerationOfAReportSimplified(request.ticker.symbol, request.ticker.exchange, request.id);

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
