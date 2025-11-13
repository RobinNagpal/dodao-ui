import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { fetchAndUpdateStockAnalyzerData } from '@/utils/stock-analyzer-scraper-utils';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';

interface FetchFinancialDataRequest {
  tickerIds: string[];
}

interface FetchFinancialDataResponse {
  success: boolean;
  processed: number;
  errors: Array<{ tickerId: string; error: string }>;
}

const postHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<FetchFinancialDataResponse> => {
  const { spaceId } = await params;
  const body: FetchFinancialDataRequest = await req.json();
  const { tickerIds } = body;

  if (!tickerIds || !Array.isArray(tickerIds) || tickerIds.length === 0) {
    throw new Error('tickerIds array is required');
  }

  const errors: Array<{ tickerId: string; error: string }> = [];
  let processed = 0;

  // Process tickers sequentially to avoid overwhelming the Lambda
  for (const tickerId of tickerIds) {
    try {
      const ticker = await prisma.tickerV1.findUnique({
        where: { id: tickerId },
      });

      if (!ticker) {
        errors.push({ tickerId, error: 'Ticker not found' });
        continue;
      }

      if (ticker.spaceId !== spaceId) {
        errors.push({ tickerId, error: 'Ticker does not belong to this space' });
        continue;
      }

      if (!ticker.stockAnalyzeUrl) {
        errors.push({ tickerId, error: 'Ticker does not have a stockAnalyzeUrl' });
        continue;
      }

      await fetchAndUpdateStockAnalyzerData(ticker);
      processed++;
    } catch (error: any) {
      errors.push({
        tickerId,
        error: error.message || 'Unknown error occurred',
      });
    }
  }

  return {
    success: errors.length === 0,
    processed,
    errors,
  };
};

export const POST = withLoggedInAdmin<FetchFinancialDataResponse>(postHandler);
