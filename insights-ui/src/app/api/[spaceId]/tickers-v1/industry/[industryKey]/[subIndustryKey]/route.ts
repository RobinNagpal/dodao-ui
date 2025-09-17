import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { IndustryTickersResponse } from '@/types/ticker-typesv1';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; industryKey: string; subIndustryKey: string }> }
): Promise<IndustryTickersResponse> {
  const { spaceId, industryKey, subIndustryKey } = await context.params;

  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      industryKey,
      subIndustryKey,
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      industryKey: true,
      subIndustryKey: true,
      cachedScore: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    tickers: tickers.map((ticker) => ({
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      exchange: ticker.exchange,
      industryKey: ticker.industryKey,
      subIndustryKey: ticker.subIndustryKey,
      cachedScore: ticker.cachedScore,
    })),
    count: tickers.length,
  };
}

export const GET = withErrorHandlingV2<IndustryTickersResponse>(getHandler);
