import { prisma } from '@/prisma';
import { TickerUpsertRequest } from '@/types/public-equity/ticker-request-response';
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

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Ticker> {
  const { tickerKey } = await params;

  // Also delete the s3 file. Test it with
  const updated = await prisma.ticker.delete({
    where: { tickerKey },
  });

  return updated;
}

export const GET = withErrorHandlingV2<Ticker>(getHandler);
export const DELETE = withErrorHandlingV2<Ticker>(deleteHandler);
