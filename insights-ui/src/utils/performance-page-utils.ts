import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PerformanceResponse, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchPerformanceCategoryByExchange, fetchPerformanceCategoryByTicker } from '@/utils/performance-api-utils';
import { ssrRequestData } from '@/utils/ssr-data-cache';
import { enforceMovedRedirect } from '@/utils/ticker-moved-redirect';
import { enforceDeletedTicker } from '@/utils/ticker-deleted-handler';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';

const EMPTY_RESPONSE: PerformanceResponse = { categoryResult: null, ticker: undefined };

export function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Performance data for a specific exchange+ticker — the same query the `{dataSlug}` API route
 * serves, called in-process (no self-fetch; see `src/utils/ssr-data-cache.ts`).
 *
 * The old `fetch()` carried only `next: { tags: [tickerCategoryReportTag(...)] }`, which
 * `force-dynamic` never stored in the Data Cache, so this stays per-request. React `cache()` keeps
 * the dedupe between `generateMetadata` and the page body. Errors degrade to an empty response,
 * as before. `dataSlug` is kept in the signature for the callers; `category` selects the query.
 */
export const fetchPerformanceByExchange = cache(
  async (exchange: string, ticker: string, dataSlug: string, category: TickerAnalysisCategory): Promise<PerformanceResponse> => {
    try {
      return await ssrRequestData(() => fetchPerformanceCategoryByExchange(KoalaGainsSpaceId, ticker, exchange, category));
    } catch (err) {
      console.warn(`fetchPerformanceByExchange error (${dataSlug}):`, err);
      return EMPTY_RESPONSE;
    }
  }
);

/** Performance data for any exchange (uncached fallback), in-process. */
export async function fetchPerformanceAnyExchange(ticker: string, dataSlug: string, category: TickerAnalysisCategory): Promise<PerformanceResponse> {
  try {
    return await ssrRequestData(() => fetchPerformanceCategoryByTicker(KoalaGainsSpaceId, ticker, category));
  } catch (err) {
    console.warn(`fetchPerformanceAnyExchange error (${dataSlug}):`, err);
    return EMPTY_RESPONSE;
  }
}

/**
 * Exchange-aware fetch with uncached fallback + canonical redirect.
 * @param dataSlug  API data segment, e.g. "past-performance-data" or "future-performance-data"
 * @param pageSlug  Page segment for the redirect URL, e.g. "past-performance" or "future-performance"
 * @param category  TickerAnalysisCategory for cache-tag scoping (one tag per subpage, not the umbrella)
 */
export async function getPerformanceOrRedirect(
  exchange: string,
  ticker: string,
  dataSlug: string,
  pageSlug: string,
  category: TickerAnalysisCategory
): Promise<PerformanceResponse> {
  const data = await fetchPerformanceByExchange(exchange, ticker, dataSlug, category);

  if (data.ticker) {
    enforceDeletedTicker(data.ticker);
    enforceMovedRedirect(data.ticker, exchange, ticker, `/${pageSlug}`);
    return data;
  }

  noStore();
  const fallback = await fetchPerformanceAnyExchange(ticker, dataSlug, category);

  if (!fallback.ticker) {
    notFound();
  }

  enforceDeletedTicker(fallback.ticker);

  const canonicalExchange = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/${pageSlug}`);
  }

  enforceMovedRedirect(fallback.ticker, exchange, ticker, `/${pageSlug}`);
  return fallback;
}

/** Build breadcrumbs for a performance page. */
export function buildPerformanceBreadcrumbs(
  exchange: string,
  ticker: string,
  tickerData: { industryKey: string; industry?: { name: string } | null; exchange: string },
  pageName: string,
  pageSlug: string
): BreadcrumbsOjbect[] {
  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);
  const industryName = tickerData.industry?.name || tickerData.industryKey;

  if (country === 'US') {
    return [
      { name: 'US Stocks', href: '/stocks', current: false },
      { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
      { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
      { name: pageName, href: `/stocks/${exchange}/${ticker}/${pageSlug}`, current: true },
    ];
  }

  if (country) {
    return [
      { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
      { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
      { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
      { name: pageName, href: `/stocks/${exchange}/${ticker}/${pageSlug}`, current: true },
    ];
  }

  return [
    { name: 'Stocks', href: '/stocks', current: false },
    { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
    { name: pageName, href: `/stocks/${exchange}/${ticker}/${pageSlug}`, current: true },
  ];
}

/** Extract common metadata timestamps from performance data. */
export function extractPerformanceTimestamps(data: PerformanceResponse): { createdTime: string; updatedTime: string } {
  const createdAt = data.categoryResult?.createdAt || data.ticker?.createdAt || new Date();
  const updatedAt = data.categoryResult?.updatedAt || data.ticker?.updatedAt || new Date();
  return {
    createdTime: new Date(createdAt).toISOString(),
    updatedTime: new Date(updatedAt).toISOString(),
  };
}
