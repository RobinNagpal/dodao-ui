import { prisma } from '@/prisma';
import { TopLoserWithRelated } from '@/types/daily-stock-movers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topLosersId: string }> }): Promise<TopLoserWithRelated> {
  const { spaceId, topLosersId } = await context.params;

  const topLoser = await prisma.dailyTopLoser.findFirstOrThrow({
    where: {
      id: topLosersId,
    },
    include: {
      ticker: true,
    },
  });

  // Get the date of this loser (normalize to date string)
  const moverDate = new Date(topLoser.createdAt);
  const startOfDay = new Date(moverDate.getFullYear(), moverDate.getMonth(), moverDate.getDate());
  const endOfDay = new Date(moverDate.getFullYear(), moverDate.getMonth(), moverDate.getDate() + 1);

  // Fetch 3 other losers from the same date, excluding current one
  const relatedMovers = await prisma.dailyTopLoser.findMany({
    where: {
      spaceId,
      id: { not: topLosersId },
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      ticker: true,
    },
    orderBy: {
      percentageChange: 'asc', // Most negative for losers
    },
    take: 3,
  });

  return {
    mover: topLoser,
    relatedMovers,
  };
}

export const GET = withErrorHandlingV2<TopLoserWithRelated>(getHandler);
