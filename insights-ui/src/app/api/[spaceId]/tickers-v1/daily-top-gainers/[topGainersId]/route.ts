import { prisma } from '@/prisma';
import { TopGainerWithRelated } from '@/types/daily-stock-movers';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { validate as isValidUuid } from 'uuid';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topGainersId: string }> }): Promise<TopGainerWithRelated> {
  const { spaceId, topGainersId } = await context.params;

  // The id always comes from the URL path, so reject anything that isn't a well-formed UUID up front.
  // This short-circuits malformed input (e.g. automated scanner probes) with a clean 404 instead of a
  // Prisma "record not found" error that would otherwise leak internal query details.
  if (!isValidUuid(topGainersId)) {
    throw notFoundError('Daily top gainer not found');
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
    throw notFoundError('Daily top gainer not found');
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

export const GET = withErrorHandlingV2<TopGainerWithRelated>(getHandler);
