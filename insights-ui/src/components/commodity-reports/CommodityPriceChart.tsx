import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import PriceChartLazy from '@/components/ticker-reportsv1/PriceChartLazy';
import { use } from 'react';

/**
 * Renders the shared price chart (used by stocks/ETFs) for a commodity.
 *
 * Takes the promise from `loadCommodityPriceHistory` and unwraps it with
 * `use()` so the parent can start the on-demand Yahoo fetch early and stream the
 * chart in under a `<Suspense>` boundary. Renders nothing when no data resolves.
 */
export default function CommodityPriceChart({ promise }: { promise: Promise<PriceHistoryResponse | null> }): JSX.Element | null {
  const data = use(promise);
  if (!data) return null;
  return <PriceChartLazy data={data} />;
}
