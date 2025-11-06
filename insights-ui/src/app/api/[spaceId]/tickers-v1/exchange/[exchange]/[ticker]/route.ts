import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import { TickerV1FastResponse, TickerV1WithRelations } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerV1FastResponse | null> {
  const { spaceId, ticker, exchange } = await context.params;

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
    exchange: exchange.toUpperCase(),
  };

  const tickerRecord: (TickerV1WithRelations & { industry: TickerV1Industry; subIndustry: TickerV1SubIndustry }) | null = await prisma.tickerV1.findFirst({
    where: whereClause,
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      investorAnalysisResults: true,
      futureRisks: true,
      vsCompetition: true,
      industry: true,
      subIndustry: true,
    },
  });

  if (!tickerRecord) {
    return null;
  }

  // Get missing reports for this ticker
  const missingReports = await getMissingReportsForTicker(spaceId, tickerRecord.id);

  if (!missingReports) {
    throw new Error(`Failed to get missing reports for ticker ${ticker}`);
  }

  return { ...tickerRecord, ...missingReports };
}

export const GET = withErrorHandlingV2<TickerV1FastResponse | null>(getHandler);
