import { prisma } from '@/prisma';
import { ComparisonTickerResponse } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<ComparisonTickerResponse> {
  const { spaceId, ticker } = await context.params;

  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      cachedScore: true,
      categoryAnalysisResults: {
        select: {
          categoryKey: true,
          factorResults: {
            select: {
              result: true,
              oneLineExplanation: true,
              analysisCategoryFactor: {
                select: {
                  factorAnalysisKey: true,
                  factorAnalysisTitle: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!tickerRecord) {
    throw new Error(`Ticker ${ticker} not found`);
  }

  // Transform the data to match ComparisonTickerInfo format
  const categoryAnalysisResults = tickerRecord.categoryAnalysisResults.map((category) => ({
    categoryKey: category.categoryKey,
    factorResults: category.factorResults.map((factor) => ({
      result: factor.result as 'Pass' | 'Fail',
      oneLineExplanation: factor.oneLineExplanation,
      factorAnalysisTitle: factor.analysisCategoryFactor?.factorAnalysisTitle || 'Unknown Factor',
      factorAnalysisKey: factor.analysisCategoryFactor?.factorAnalysisKey || '',
    })),
  }));

  return {
    ticker: {
      id: tickerRecord.id,
      name: tickerRecord.name,
      symbol: tickerRecord.symbol,
      exchange: tickerRecord.exchange,
      cachedScore: tickerRecord.cachedScore,
      categoryAnalysisResults,
    },
  };
}

export const GET = withErrorHandlingV2<ComparisonTickerResponse>(getHandler);
