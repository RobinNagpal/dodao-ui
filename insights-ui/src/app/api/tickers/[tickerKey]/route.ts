import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const ticker = await prisma.ticker.findUniqueOrThrow({
    where: {
      spaceId_tickerKey: {
        tickerKey,
        spaceId: KoalaGainsSpaceId,
      },
    },
    include: {
      criteriaMatchesOfLatest10Q: {
        include: {
          criterionMatches: true,
        },
      },
      evaluationsOfLatest10Q: {
        include: {
          reports: true,
          importantMetricsEvaluation: {
            include: {
              metrics: true,
            },
          },
          performanceChecklistEvaluation: {
            include: {
              performanceChecklistItems: true,
            },
          },
        },
      },
    },
  });

  return ticker;
}

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const deletedTicker = await prisma.ticker.delete({
    where: { tickerKey },
  });

  return deletedTicker;
}

async function putHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;
  const { tickerKey: newTickerKey, sectorId, industryGroupId, companyName, shortDescription } = await req.json();

  const updatedTicker = await prisma.ticker.update({
    where: {
      spaceId_tickerKey: {
        tickerKey,
        spaceId: KoalaGainsSpaceId,
      },
    },
    data: {
      tickerKey: newTickerKey,
      sectorId,
      industryGroupId,
      companyName,
      shortDescription,
    },
  });

  return updatedTicker;
}

export const GET = withErrorHandlingV2<Ticker>(getHandler);
export const DELETE = withErrorHandlingV2<Ticker>(deleteHandler);
export const PUT = withErrorHandlingV2<Ticker>(putHandler);
