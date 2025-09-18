import { prisma } from '@/prisma';
import { BasicTickersResponse } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; industryKey: string; subIndustryKey: string }> }
): Promise<BasicTickersResponse> {
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
      cachedScore: true,
      websiteUrl: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    tickers,
    count: tickers.length,
  };
}

export const GET = withErrorHandlingV2<BasicTickersResponse>(getHandler);
