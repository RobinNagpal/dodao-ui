import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { ensurePriceHistoryIsFresh } from '@/utils/price-history-utils';

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
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();

  if (!t || !e) {
    return { priceHistory: null };
  }

  try {
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: {
        spaceId,
        symbol: t,
        exchange: e,
      },
    });

    const priceInfo = await ensurePriceHistoryIsFresh(tickerRecord);
    if (!priceInfo) {
      return { priceHistory: null };
    }

    const daily = (priceInfo.dailyData as unknown as PriceHistoryPoint[] | null) ?? [];
    const weekly = (priceInfo.weeklyData as unknown as PriceHistoryPoint[] | null) ?? [];

    if (daily.length === 0 && weekly.length === 0) {
      return { priceHistory: null };
    }

    return {
      priceHistory: {
        symbol: tickerRecord.symbol,
        currency: priceInfo.currency ?? null,
        daily,
        weekly,
      },
    };
  } catch (error) {
    console.error(`Error fetching price history for ${t}:`, error);
    return { priceHistory: null };
  }
}

export const GET = withErrorHandlingV2<PriceHistoryWrapper>(getHandler);
