import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';

/**
 * Fetches the top similar companies for a ticker from the shared
 * `similar-tickers` API (same endpoint the main stock report page uses).
 *
 * Promise-based so callers can hand it to <SimilarTickers> via `use()` and keep
 * the Suspense boundary at the call site.
 */
export async function fetchSimilarTickers(exchange: string, ticker: string): Promise<SimilarTicker[]> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/similar-tickers`;

  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) throw new Error(`fetchSimilarTickers failed (${res.status}): ${url}`);

  return (await res.json()) as SimilarTicker[];
}
