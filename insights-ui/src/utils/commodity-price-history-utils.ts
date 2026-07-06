import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { CommodityBasicInfo } from '@/types/commodity/commodity-analysis-types';
import { DAILY_LOOKBACK_DAYS, ONE_DAY_MS, WEEKLY_LOOKBACK_DAYS, fetchPriceHistoryFromYahoo } from '@/utils/yahoo-price-history';

/**
 * Resolve a commodity's price history into the shared `PriceHistoryResponse`
 * shape consumed by the price chart (reused from stocks/ETFs).
 *
 * Commodity report content is now static JSON, but the price chart still shows
 * *live* market data, so this fetches OHLC history directly from Yahoo Finance on
 * demand. A commodity's `priceSymbol` (e.g. "GC=F", "CL=F") is already a Yahoo
 * ticker, so it is passed through with no exchange conversion. Freshness is
 * handled by the caller's Next.js data-cache `revalidate` window rather than a
 * database snapshot.
 *
 * - Daily series: last ~6.5 months (covers the 1M and 6M range tabs).
 * - Weekly series: last ~5 years (covers the 1Y, 3Y and 5Y range tabs).
 *
 * Returns null when the commodity has no `priceSymbol` or when Yahoo returns no
 * usable data. Kick this off (without awaiting) in the report page and unwrap it
 * inside a `<Suspense>` boundary so the fetch streams in without blocking render.
 */
export async function loadCommodityPriceHistory(
  commodity: Pick<CommodityBasicInfo, 'slug' | 'priceSymbol' | 'currency'>
): Promise<PriceHistoryResponse | null> {
  const symbol = commodity.priceSymbol;
  if (!symbol) return null;

  try {
    const [dailyResult, weeklyResult] = await Promise.all([
      fetchPriceHistoryFromYahoo(symbol, '1d', new Date(Date.now() - DAILY_LOOKBACK_DAYS * ONE_DAY_MS)),
      fetchPriceHistoryFromYahoo(symbol, '1wk', new Date(Date.now() - WEEKLY_LOOKBACK_DAYS * ONE_DAY_MS)),
    ]);

    const daily = dailyResult?.points ?? [];
    const weekly = weeklyResult?.points ?? [];
    if (daily.length === 0 && weekly.length === 0) return null;

    const currency = dailyResult?.currency ?? weeklyResult?.currency ?? commodity.currency ?? null;
    return { symbol, currency, daily, weekly };
  } catch (error) {
    console.error(`Failed to load price history for commodity ${commodity.slug} (${symbol}):`, error);
    return null;
  }
}
