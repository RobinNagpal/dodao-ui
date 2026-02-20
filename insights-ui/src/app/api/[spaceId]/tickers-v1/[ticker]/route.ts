import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1FastResponse, TickerV1WithRelations } from '@/utils/ticker-v1-model-utils';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1FastResponse | null> {
  const { spaceId, ticker } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
  };

  const tickerRecord: (TickerV1WithRelations & { industry: TickerV1Industry; subIndustry: TickerV1SubIndustry }) | null = allowNull
    ? await prisma.tickerV1.findFirst({
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
          futureRisks: true,
          vsCompetition: true,
          industry: true,
          subIndustry: true,
          cachedScoreEntry: true,
        },
      })
    : await prisma.tickerV1.findFirstOrThrow({
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
          futureRisks: true,
          vsCompetition: true,
          industry: true,
          subIndustry: true,
          cachedScoreEntry: true,
        },
      });

  // Return null if ticker not found and allowNull is true
  if (!tickerRecord) {
    return null;
  }

  // Get missing reports for this ticker
  const missingReports = await getMissingReportsForTicker(spaceId, tickerRecord.id);

  if (!missingReports) {
    throw new Error(`Failed to get missing reports for ticker ${ticker}`);
  }

  // Combine the ticker record with missing reports data
  return {
    ...tickerRecord,
    ...missingReports,
  };
}

export const GET = withErrorHandlingV2<TickerV1FastResponse | null>(getHandler);
