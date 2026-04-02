import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import { getCompetitorTickers } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { TickerV1VsCompetition, TickerV1Industry, TickerV1SubIndustry, TickerV1CachedScore } from '@prisma/client';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<CompetitionResponse> {
  const { spaceId, ticker } = await context.params;

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
  };

  const tickerRecord:
    | (TickerV1 & {
        vsCompetition?: TickerV1VsCompetition | null;
        industry: TickerV1Industry | null;
        subIndustry: TickerV1SubIndustry | null;
        cachedScoreEntry?: TickerV1CachedScore | null;
      })
    | null = await prisma.tickerV1.findFirst({
    where: whereClause,
    include: {
      vsCompetition: true,
      industry: true,
      subIndustry: true,
      cachedScoreEntry: true,
    },
  });

  if (!tickerRecord) {
    return { vsCompetition: null, competitorTickers: [], ticker: undefined };
  }

  const competitorTickers = await getCompetitorTickers(tickerRecord);

  return {
    vsCompetition: tickerRecord.vsCompetition || null,
    competitorTickers,
    ticker: tickerRecord,
  };
}

export const GET = withErrorHandlingV2<CompetitionResponse>(getHandler);
