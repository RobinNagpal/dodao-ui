import { prisma } from '@/prisma';
import { TopGainerWithRelated } from '@/types/daily-stock-movers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { validate as isValidUuid } from 'uuid';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topGainersId: string }> }): Promise<TopGainerWithRelated | null> {
  const { spaceId, topGainersId } = await context.params;

  // A malformed or missing id (e.g. crawler probes) is a quiet 404, not a logged Prisma
  // "record not found" error. Return null (200) and let the page render its not-found state.
  if (!isValidUuid(topGainersId)) {
    return null;
  }

  const topGainer = await prisma.dailyTopGainer.findFirst({
    where: {
      id: topGainersId,
    },
    include: {
      ticker: true,
    },
  });

  if (!topGainer) {
    return null;
  }

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

export const GET = withErrorHandlingV2<TopGainerWithRelated | null>(getHandler);
