import { prisma } from '@/prisma';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import { buildTickerWhereClause } from '@/utils/daily-stock-movers';
import { buildDateWhereClause } from '@/utils/daily-movers-date-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TopLoserWithTicker[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const date = url.searchParams.get('date');
  const tickerWhere = buildTickerWhereClause(country);
  const dateWhere = buildDateWhereClause(date);

  const topLosers = await prisma.dailyTopLoser.findMany({
    where: {
      spaceId,
      ticker: tickerWhere,
      ...dateWhere,
    },
    include: {
      ticker: true,
    },
    orderBy: [{ createdAt: 'desc' }, { percentageChange: 'asc' }],
  });

  return topLosers;
}

export const GET = withErrorHandlingV2<TopLoserWithTicker[]>(getHandler);
