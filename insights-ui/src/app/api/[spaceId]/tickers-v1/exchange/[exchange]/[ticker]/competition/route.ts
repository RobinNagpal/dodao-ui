import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import { getCompetitorTickers } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { TickerV1VsCompetition } from '.prisma/client';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }): Promise<CompetitionResponse> {
  const { spaceId, ticker, exchange } = await context.params;

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
    exchange: exchange.toUpperCase(),
  };

  const tickerRecord: TickerV1 & {
    vsCompetition?: TickerV1VsCompetition | null;
  } = await prisma.tickerV1.findFirstOrThrow({
    where: whereClause,
    include: {
      vsCompetition: true,
    },
  });

  const competitorTickers = await getCompetitorTickers(tickerRecord);

  return { vsCompetition: tickerRecord.vsCompetition || null, competitorTickers };
}

export const GET = withErrorHandlingV2<CompetitionResponse>(getHandler);
