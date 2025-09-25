import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getTickerV1AnalysisStatus, TickerV1FastResponse, TickerV1WithRelations } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1FastResponse> {
  const { spaceId, ticker } = await context.params;

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
  };

  const tickerRecord: TickerV1WithRelations & { industry: TickerV1Industry; subIndustry: TickerV1SubIndustry } = await prisma.tickerV1.findFirstOrThrow({
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

  return { ...tickerRecord, analysisStatus: getTickerV1AnalysisStatus(tickerRecord) };
}

export const GET = withErrorHandlingV2<TickerV1FastResponse>(getHandler);
