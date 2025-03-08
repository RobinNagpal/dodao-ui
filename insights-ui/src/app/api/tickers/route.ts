import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';

/**
 * ✅ Handler to GET all tickers from the database
 */
async function getHandler(): Promise<Ticker[]> {
  const tickers = await prisma.ticker.findMany();
  return tickers;
}

// ✅ Use error handling middleware for API routes
export const GET = withErrorHandlingV2<Ticker[]>(getHandler);
