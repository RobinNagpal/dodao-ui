import { prisma } from '@/prisma';
import { IndustryTickersResponse } from '@/types/ticker-typesv1';
import { getTickerWithAllDetails, TickerV1ReportResponse } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; industryKey: string; subIndustryKey: string }> }
): Promise<IndustryTickersResponse> {
  const { spaceId, industryKey, subIndustryKey } = await context.params;

  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      industryKey,
      subIndustryKey,
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
    orderBy: {
      name: 'asc',
    },
  });

  const detailedTickers: TickerV1ReportResponse[] = [];
  for (const ticker of tickers) {
    detailedTickers.push(await getTickerWithAllDetails(ticker));
  }
  return {
    tickers: detailedTickers,
    count: tickers.length,
  };
}

export const GET = withErrorHandlingV2<IndustryTickersResponse>(getHandler);
