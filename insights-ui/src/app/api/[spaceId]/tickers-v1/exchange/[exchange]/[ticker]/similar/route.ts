import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SimilarTicker } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }): Promise<SimilarTicker[]> {
  const { spaceId, ticker, exchange } = await context.params;

  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });
  const similarTickers: SimilarTicker[] = await prisma.tickerV1.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      id: {
        not: tickerRecord.id, // Exclude current ticker
      },
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      cachedScore: true,
    },
    orderBy: {
      cachedScore: 'desc',
    },
    take: 3,
  });

  return similarTickers;
}

export const GET = withErrorHandlingV2<SimilarTicker[]>(getHandler);
