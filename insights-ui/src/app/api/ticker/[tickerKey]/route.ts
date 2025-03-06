import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { CreateTickerRequest, TickerResponse } from '@/types/public-equity/ticker';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

/**
 * ✅ Handler to GET a specific ticker
 */
async function getHandler(req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<TickerResponse> {
  const { tickerKey } = params;

  if (!tickerKey) {
    return { success: false, error: 'Ticker key is required.' };
  }

  const ticker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });

  if (!ticker) {
    return { success: false, error: 'Ticker not found.' };
  }

  return { success: true, ticker };
}

/**
 * ✅ Handler to CREATE (UPSERT) a specific ticker
 */
async function postHandler(req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<TickerResponse> {
  const { sector, industryGroup }: CreateTickerRequest = await req.json();
  const { tickerKey } = params;

  if (!tickerKey || !sector || !industryGroup) {
    return { success: false, error: 'All fields (tickerKey, sector, industryGroup) are required.' };
  }

  const newTicker = await prisma.ticker.upsert({
    where: { tickerKey },
    update: { sector, industryGroup },
    create: { tickerKey, sector, industryGroup },
  });

  return { success: true, ticker: newTicker };
}

/**
 * ✅ Handler to DELETE a specific ticker
 */
async function deleteHandler(req: NextRequest, { params }: { params: { tickerKey: string } }): Promise<TickerResponse> {
  const { tickerKey } = params;

  if (!tickerKey) {
    return { success: false, error: 'Ticker key is required.' };
  }

  await prisma.ticker.delete({
    where: { tickerKey },
  });

  return { success: true, message: 'Ticker deleted successfully.' };
}

// ✅ Use error handling middleware for API routes
export const GET = withErrorHandlingV2<TickerResponse>(getHandler);
export const POST = withErrorHandlingV2<TickerResponse>(postHandler);
export const DELETE = withErrorHandlingV2<TickerResponse>(deleteHandler);
