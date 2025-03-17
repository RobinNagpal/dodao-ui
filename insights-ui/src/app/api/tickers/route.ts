import { prisma } from '@/prisma';
import { TickerCreateRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

async function postHandler(req: NextRequest): Promise<Ticker> {
  const { sectorId, industryGroupId, tickerKey }: TickerCreateRequest = await req.json();

  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (existingTicker) {
    console.log(`Ticker already exists for ${tickerKey}`);
    return existingTicker;
  }

  const newTicker = await prisma.ticker.create({
    data: {
      tickerKey,
      sectorId,
      industryGroupId,
    },
  });

  console.log(`Created new ticker for ${tickerKey}`);
  return newTicker;
}

export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);
