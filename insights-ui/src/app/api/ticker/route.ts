import { prisma } from '@/prisma';
import { AllTickersResponse } from '@/types/public-equity/ticker';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

/**
 * ✅ Handler to GET all tickers from the database
 */
async function getHandler(): Promise<AllTickersResponse> {
  const tickers = await prisma.ticker.findMany();
  return { success: true, tickers };
}

// ✅ Use error handling middleware for API routes
export const GET = withErrorHandlingV2<AllTickersResponse>(getHandler);
