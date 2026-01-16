import { prisma } from '@/prisma';
import { TopGainerWithRelated } from '@/types/daily-stock-movers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topGainersId: string }> }): Promise<TopGainerWithRelated> {
  const { spaceId, topGainersId } = await context.params;

  const topGainer = await prisma.dailyTopGainer.findFirstOrThrow({
    where: {
      id: topGainersId,
    },
    include: {
      ticker: true,
    },
  });

  // Get the date of this gainer (normalize to date string)
  const moverDate = new Date(topGainer.createdAt);
  const startOfDay = new Date(moverDate.getFullYear(), moverDate.getMonth(), moverDate.getDate());
  const endOfDay = new Date(moverDate.getFullYear(), moverDate.getMonth(), moverDate.getDate() + 1);

  // Fetch 3 other gainers from the same date, excluding current one
  const relatedMovers = await prisma.dailyTopGainer.findMany({
    where: {
      spaceId,
      id: { not: topGainersId },
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      ticker: true,
    },
    orderBy: {
      percentageChange: 'desc',
    },
    take: 3,
  });

  return {
    mover: topGainer,
    relatedMovers,
  };
}

export const GET = withErrorHandlingV2<TopGainerWithRelated>(getHandler);
