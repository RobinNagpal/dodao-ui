import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PerformanceResponse, TickerAnalysisCategory } from '@/types/ticker-typesv1';

/** Shared query for performance data by exchange+ticker and category key. */
export async function fetchPerformanceCategoryByExchange(
  spaceId: string,
  ticker: string,
  exchange: string,
  categoryKey: TickerAnalysisCategory
): Promise<PerformanceResponse> {
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    include: { industry: true },
  });

  if (!tickerRecord) {
    return { categoryResult: null, ticker: undefined };
  }

  const categoryResult = await prisma.tickerV1CategoryAnalysisResult.findFirst({
    where: {
      tickerId: tickerRecord.id,
      categoryKey,
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

  return { categoryResult, ticker: tickerRecord };
}

/** Shared query for performance data by ticker only (any exchange) and category key. */
export async function fetchPerformanceCategoryByTicker(spaceId: string, ticker: string, categoryKey: TickerAnalysisCategory): Promise<PerformanceResponse> {
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
    include: { industry: true },
  });

  if (!tickerRecord) {
    return { categoryResult: null, ticker: undefined };
  }

  const categoryResult = await prisma.tickerV1CategoryAnalysisResult.findFirst({
    where: {
      tickerId: tickerRecord.id,
      categoryKey,
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

  return { categoryResult, ticker: tickerRecord };
}
