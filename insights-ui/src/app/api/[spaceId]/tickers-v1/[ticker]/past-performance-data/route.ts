import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PastPerformanceResponse } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<PastPerformanceResponse> {
  const { spaceId, ticker } = await context.params;

  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
    },
  });

  if (!tickerRecord) {
    return { categoryResult: null, ticker: undefined };
  }

  const categoryResult = await prisma.tickerV1CategoryAnalysisResult.findFirst({
    where: {
      tickerId: tickerRecord.id,
      categoryKey: 'PastPerformance',
      spaceId: spaceId || KoalaGainsSpaceId,
    },
    include: {
      factorResults: {
        include: {
          analysisCategoryFactor: {
            select: {
              factorAnalysisKey: true,
              factorAnalysisTitle: true,
              factorAnalysisDescription: true,
            },
          },
        },
      },
    },
  });

  return {
    categoryResult,
    ticker: tickerRecord,
  };
}

export const GET = withErrorHandlingV2<PastPerformanceResponse>(getHandler);
