import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1GenerationRequestWithTicker, TickerV1GenerationRequestFrontend } from '@/types/public-equity/analysis-factors-types';

interface GenerationRequestsResponse {
  requests: TickerV1GenerationRequestWithTicker[];
  moreExist: boolean;
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // Get latest 10 NotStarted requests with ticker information
  const requests = await prisma.tickerV1GenerationRequest.findMany({
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
    take: 11, // Get 11 to check if there are more
  });

  // Check if there are more than 10 records
  const moreExist = requests.length > 10;

  // Return only first 10 records
  const limitedRequests = requests.slice(0, 10);

  return {
    requests: limitedRequests.map(
      (request): TickerV1GenerationRequestWithTicker => ({
        id: request.id,
        tickerId: request.tickerId,
        spaceId: request.spaceId,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        startedAt: request.startedAt,
        completedAt: request.completedAt,
        regenerateCompetition: request.regenerateCompetition,
        regenerateFinancialAnalysis: request.regenerateFinancialAnalysis,
        regenerateBusinessAndMoat: request.regenerateBusinessAndMoat,
        regeneratePastPerformance: request.regeneratePastPerformance,
        regenerateFutureGrowth: request.regenerateFutureGrowth,
        regenerateFairValue: request.regenerateFairValue,
        regenerateFutureRisk: request.regenerateFutureRisk,
        regenerateWarrenBuffett: request.regenerateWarrenBuffett,
        regenerateCharlieMunger: request.regenerateCharlieMunger,
        regenerateBillAckman: request.regenerateBillAckman,
        regenerateFinalSummary: request.regenerateFinalSummary,
        regenerateCachedScore: request.regenerateCachedScore,
        ticker: request.ticker ?? undefined,
      })
    ),
    moreExist,
  };
}

export const GET = withErrorHandlingV2<GenerationRequestsResponse>(getHandler);
