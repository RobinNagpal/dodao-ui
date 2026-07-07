import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { getCommodityBasicInfo } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { loadCommodityPriceHistory } from '@/utils/commodity-price-history-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * On-demand price history for a commodity (daily + weekly OHLC), fetched live
 * from Yahoo. Kept as its own endpoint — separate from `/report` — because it
 * hits Yahoo over the network; the report page fetches it behind Suspense.
 * Returns `null` when the commodity has no price symbol or no usable data.
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; slug: string }> }): Promise<PriceHistoryResponse | null> {
  const { slug } = await context.params;
  const commodity = getCommodityBasicInfo(slug);
  if (!commodity) return null;
  return loadCommodityPriceHistory(commodity);
}

export const GET = withErrorHandlingV2<PriceHistoryResponse | null>(getHandler);
