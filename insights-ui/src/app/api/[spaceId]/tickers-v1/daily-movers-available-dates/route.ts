import { prisma } from '@/prisma';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { buildTickerWhereClause } from '@/utils/daily-stock-movers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface AvailableDatesResponse {
  dates: string[];
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<AvailableDatesResponse> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const type = url.searchParams.get('type') as DailyMoverType | null;
  const tickerWhere = buildTickerWhereClause(country);

  const where = {
    spaceId,
    ticker: tickerWhere,
  };
  const selectAndOrder = {
    select: { createdAt: true as const },
    orderBy: { createdAt: 'desc' as const },
    distinct: ['createdAt' as const],
  };

  const records =
    type === DailyMoverType.LOSER
      ? await prisma.dailyTopLoser.findMany({ where, ...selectAndOrder })
      : await prisma.dailyTopGainer.findMany({ where, ...selectAndOrder });

  // Extract unique date strings (YYYY-MM-DD)
  const dateSet = new Set<string>();
  records.forEach((r) => {
    dateSet.add(new Date(r.createdAt).toISOString().split('T')[0]);
  });

  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

  return { dates };
}

export const GET = withErrorHandlingV2<AvailableDatesResponse>(getHandler);
