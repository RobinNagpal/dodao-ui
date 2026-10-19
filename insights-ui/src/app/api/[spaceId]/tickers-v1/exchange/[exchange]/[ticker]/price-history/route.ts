import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { getTickerPriceHistory } from '@/utils/ticker-v1-page-data';
import { PriceHistoryPoint } from '@/types/prismaTypes';

export type PriceRangeKey = '1M' | '6M' | '1Y' | '3Y' | '5Y';

export interface PriceHistoryResponse {
  symbol: string;
  currency: string | null;
  // Daily OHLC used by the 1M and 6M range tabs.
  daily: PriceHistoryPoint[];
  // Weekly OHLC used by the 1Y, 3Y and 5Y range tabs.
  weekly: PriceHistoryPoint[];
}

export interface PriceHistoryWrapper {
  priceHistory: PriceHistoryResponse | null;
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<PriceHistoryWrapper> {
  const { spaceId, exchange, ticker } = await params;
  return getTickerPriceHistory(spaceId, exchange, ticker);
}

export const GET = withErrorHandlingV2<PriceHistoryWrapper>(getHandler);
