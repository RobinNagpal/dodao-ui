import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { ensureEtfPriceHistoryIsFresh } from '@/utils/etf-price-history-utils';

// Re-export so client components that want the ETF response shape can import
// it from here without having to reach into the stocks namespace.
export type { PriceHistoryResponse, PriceRangeKey } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';

export interface EtfPriceHistoryWrapper {
  priceHistory: PriceHistoryResponse | null;
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfPriceHistoryWrapper> {
  const { spaceId, exchange, etf } = await params;
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { priceHistory: null };
  }

  try {
    const etfRecord = await prisma.etf.findFirstOrThrow({
      where: whereClause,
    });

    const priceInfo = await ensureEtfPriceHistoryIsFresh(etfRecord);
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
        symbol: etfRecord.symbol,
        currency: priceInfo.currency ?? null,
        daily,
        weekly,
      },
    };
  } catch (error) {
    console.error(`Error fetching ETF price history for ${whereClause.symbol}:`, error);
    return { priceHistory: null };
  }
}

export const GET = withErrorHandlingV2<EtfPriceHistoryWrapper>(getHandler);
