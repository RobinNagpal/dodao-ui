import { prisma } from '@/prisma';
import { TickerUpsertRequest } from '@/types/public-equity/ticker';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const ticker = await prisma.ticker.findUniqueOrThrow({
    where: { tickerKey },
  });

  return ticker;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { sectorId, industryGroupId }: TickerUpsertRequest = await req.json();
  const { tickerKey } = await params;

  const newTicker = await prisma.ticker.upsert({
    where: { tickerKey },
    update: { sectorId, industryGroupId },
    create: { tickerKey, sectorId, industryGroupId },
  });

  return newTicker;
}

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  const updated = await prisma.ticker.delete({
    where: { tickerKey },
  });

  return updated;
}

export const GET = withErrorHandlingV2<Ticker>(getHandler);
export const POST = withErrorHandlingV2<Ticker>(postHandler);
export const DELETE = withErrorHandlingV2<Ticker>(deleteHandler);
