import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { fetchCommodityBySlug } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { loadCommodityPriceHistory } from '@/utils/commodity-price-history-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * On-demand price history for a commodity (daily + weekly OHLC), refreshed from
 * Yahoo when stale. Kept as its own endpoint — separate from `/report` — because
 * it can hit Yahoo over the network; the report page fetches it behind Suspense.
 * Mirrors the ETF `/chart-data` split. Returns `null` when the commodity has no
 * price symbol or no usable data.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<PriceHistoryResponse | null> {
  const { slug } = await context.params;
  const commodity = await fetchCommodityBySlug(slug);
  return loadCommodityPriceHistory(commodity);
}

export const GET = withErrorHandlingV2<PriceHistoryResponse | null>(getHandler);
