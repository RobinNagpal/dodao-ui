import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<TickerV1GenerationRequestWithTicker[]> {
  const { spaceId } = await params;

  // Fetch the last 30 generation requests with ticker information
  const requests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      spaceId,
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
    take: 30,
  });

  return requests as TickerV1GenerationRequestWithTicker[];
}

export const GET = withErrorHandlingV2<TickerV1GenerationRequestWithTicker[]>(getHandler);
