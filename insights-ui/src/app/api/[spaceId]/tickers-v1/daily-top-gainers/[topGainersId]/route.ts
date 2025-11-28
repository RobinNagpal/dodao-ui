import { prisma } from '@/prisma';
import { TopGainerWithTicker } from '@/types/top-gainers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topGainersId: string }> }): Promise<TopGainerWithTicker> {
  const { topGainersId } = await context.params;

  const topGainer = await prisma.dailyTopGainer.findFirstOrThrow({
    where: {
      id: topGainersId,
    },
    include: {
      ticker: true,
    },
  });

  return topGainer;
}

export const GET = withErrorHandlingV2<TopGainerWithTicker>(getHandler);
