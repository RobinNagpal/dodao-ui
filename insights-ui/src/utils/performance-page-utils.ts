import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PerformanceResponse, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerCategoryReportTag } from '@/utils/ticker-v1-cache-utils';
import { enforceMovedRedirect } from '@/utils/ticker-moved-redirect';
import { enforceDeletedTicker } from '@/utils/ticker-deleted-handler';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

const EMPTY_RESPONSE: PerformanceResponse = { categoryResult: null, ticker: undefined };

export function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Fetch performance data for a specific exchange+ticker (cached). */
export async function fetchPerformanceByExchange(
  exchange: string,
  ticker: string,
  dataSlug: string,
  category: TickerAnalysisCategory
): Promise<PerformanceResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/${dataSlug}`;
  try {
    // Subscribe to the narrow per-category tag only. The umbrella tag would
    // pull this page into every unrelated ticker-data invalidation (price
    // history, scraper refresh, competition save, ...) and explode ISR
    // writes — see knowledge/cache-invalidation.md if added.
    const res = await fetch(url, { next: { tags: [tickerCategoryReportTag(ticker, exchange, category)] } });
    if (res.status >= 500) {
      // A 5xx (e.g. the DB is momentarily down) must NOT be collapsed into an
      // empty response. Doing so renders a soft "ticker not found" page that
      // still carries HTTP 200/404, which CloudFront then pins at the edge for
      // its 6-day TTL — a transient outage would de-index a live ticker.
      // Re-throw so the page returns a genuine 500 (uncached, refetched on the
      // next request). See docs/insights-ui/cloudfront-error-caching.md.
      throw new Error(`fetchPerformanceByExchange ${res.status} for ${url}`);
    }
    if (!res.ok) {
      // 404 / other non-OK = genuine "no such ticker on this exchange". Return
      // soft-empty so the caller can fall back to the any-exchange lookup and
      // ultimately notFound() (a real, legitimately-cacheable 404).
      console.warn(`fetchPerformanceByExchange not-ok (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PerformanceResponse;
  } catch (err) {
    // Network/transport failure talking to our own API is transient, not a
    // not-found — propagate so the page returns 500 rather than a cacheable
    // soft error.
    console.error('fetchPerformanceByExchange error:', err);
    throw err;
  }
}

/** Fetch performance data for any exchange (uncached fallback). */
export async function fetchPerformanceAnyExchange(ticker: string, dataSlug: string): Promise<PerformanceResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}/${dataSlug}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status >= 500) {
      // See fetchPerformanceByExchange: a transient 5xx must surface as a real
      // 500, not a cacheable soft not-found.
      throw new Error(`fetchPerformanceAnyExchange ${res.status} for ${url}`);
    }
    if (!res.ok) {
      console.warn(`fetchPerformanceAnyExchange not-ok (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PerformanceResponse;
  } catch (err) {
    console.error('fetchPerformanceAnyExchange error:', err);
    throw err;
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
  const fallback = await fetchPerformanceAnyExchange(ticker, dataSlug);

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
