import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getTickerWithAllDetails, TickerV1ReportResponse } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface SimilarTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore: number;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1ReportResponse> {
  const { spaceId, ticker } = await context.params;

  // Get ticker from DB with all related data
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
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
    },
  });
  return await getTickerWithAllDetails(tickerRecord);
}

export const GET = withErrorHandlingV2<TickerV1ReportResponse>(getHandler);
