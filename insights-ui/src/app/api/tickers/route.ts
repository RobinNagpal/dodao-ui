import { prisma } from '@/prisma';
import { TickerCreateRequest, TickerUpsertRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * ✅ Handler to GET all tickers from the database
 */
async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

async function postHandler(req: NextRequest): Promise<Ticker> {
  const { sectorId, industryGroupId, tickerKey, reportUrl }: TickerCreateRequest = await req.json();

  const newTicker = await prisma.ticker.create({
    data: {
      tickerKey,
      sectorId,
      industryGroupId,
      reportUrl: reportUrl,
    },
  });

  return newTicker;
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);
