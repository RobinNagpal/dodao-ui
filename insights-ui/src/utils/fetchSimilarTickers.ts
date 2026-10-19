import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ssrRequestData } from '@/utils/ssr-data-cache';
import { getSimilarTickers } from '@/utils/ticker-v1-page-data';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';

/**
 * Loads the top similar companies for a ticker — the same query the `similar-tickers` API serves,
 * called in-process (no self-fetch; see `src/utils/ssr-data-cache.ts`). Used by the main stock
 * report page and every stock sub-page.
 *
 * Was a `next: { tags }`-only fetch, which `force-dynamic` never stored in the Data Cache, so it
 * stays per-request. Throws when the ticker doesn't exist (the API answered 404/500 and the old
 * helper threw), which callers rely on to retry with the canonical exchange/symbol.
 *
 * Promise-based so callers can hand it to <SimilarTickers> via `use()` and keep
 * the Suspense boundary at the call site.
 */
export async function fetchSimilarTickers(exchange: string, ticker: string): Promise<SimilarTicker[]> {
  return ssrRequestData(() => getSimilarTickers(KoalaGainsSpaceId, exchange.toUpperCase(), ticker.toUpperCase()));
}
