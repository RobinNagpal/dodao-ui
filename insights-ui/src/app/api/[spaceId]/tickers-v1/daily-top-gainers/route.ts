import { prisma } from '@/prisma';
import { TopGainerWithTicker } from '@/types/top-gainers';
import { getExchangesByCountry, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TopGainerWithTicker[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const countryParam = url.searchParams.get('country');
  const country = toSupportedCountry(countryParam);

  // Build where clause for ticker filtering
  const tickerWhere: Prisma.TickerV1WhereInput = country
    ? {
        exchange: {
          in: getExchangesByCountry(country),
        },
      }
    : {};

  const topGainers = await prisma.dailyTopGainer.findMany({
    where: {
      spaceId,
      ticker: tickerWhere,
    },
    include: {
      ticker: true,
    },
    orderBy: [{ createdAt: 'desc' }, { percentageChange: 'desc' }],
  });

  return topGainers;
}

export const GET = withErrorHandlingV2<TopGainerWithTicker[]>(getHandler);
