import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1 } from '@prisma/client';

async function getHandler(
  req: NextRequest,
  context: {
    params: Promise<{
      spaceId: string;
      exchange: string;
      industryKey: string;
    }>;
  }
): Promise<TickerV1[]> {
  const { spaceId, exchange, industryKey } = await context.params;

  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      exchange: exchange,
      industryKey: industryKey,
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  return tickers;
}

export const GET = withErrorHandlingV2<TickerV1[]>(getHandler);
