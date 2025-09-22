import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface TickerLastmod {
  symbol: string;
  exchange: string;
  industryKey: string;
  lastmod: string;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerLastmod[]> {
  const { spaceId } = await context.params;

  // Get all tickers with their latest updatedAt from related tables
  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
    },
    select: {
      id: true,
      symbol: true,
      exchange: true,
      industryKey: true,
      updatedAt: true,
      categoryAnalysisResults: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      },
      factorResults: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      },
      investorAnalysisResults: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      },
      futureRisks: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      },
      vsCompetition: {
        select: {
          updatedAt: true,
        },
      },
    },
  });

  // Calculate the latest updatedAt for each ticker
  const tickersWithLastmod: TickerLastmod[] = tickers.map((ticker) => {
    const allUpdatedAts = [
      ticker.updatedAt,
      ...ticker.categoryAnalysisResults.map((r) => r.updatedAt),
      ...ticker.factorResults.map((r) => r.updatedAt),
      ...ticker.investorAnalysisResults.map((r) => r.updatedAt),
      ...ticker.futureRisks.map((r) => r.updatedAt),
      ...(ticker.vsCompetition ? [ticker.vsCompetition.updatedAt] : []),
    ];

    const latestUpdatedAt = new Date(Math.max(...allUpdatedAts.map((date) => date.getTime())));

    return {
      symbol: ticker.symbol,
      exchange: ticker.exchange,
      industryKey: ticker.industryKey,
      lastmod: latestUpdatedAt.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  });

  return tickersWithLastmod;
}

export const GET = withErrorHandlingV2<TickerLastmod[]>(getHandler);
