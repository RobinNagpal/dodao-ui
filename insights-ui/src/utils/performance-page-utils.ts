import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PerformanceResponse } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

const EMPTY_RESPONSE: PerformanceResponse = { categoryResult: null, ticker: undefined };

export function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Fetch performance data for a specific exchange+ticker (cached). */
export async function fetchPerformanceByExchange(exchange: string, ticker: string, dataSlug: string): Promise<PerformanceResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/${dataSlug}`;
  try {
    const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [tickerAndExchangeTag(ticker, exchange)] } });
    if (!res.ok) {
      console.warn(`fetchPerformanceByExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PerformanceResponse;
  } catch (err) {
    console.warn('fetchPerformanceByExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/** Fetch performance data for any exchange (uncached fallback). */
export async function fetchPerformanceAnyExchange(ticker: string, dataSlug: string): Promise<PerformanceResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}/${dataSlug}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`fetchPerformanceAnyExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PerformanceResponse;
  } catch (err) {
    console.warn('fetchPerformanceAnyExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/**
 * Exchange-aware fetch with uncached fallback + canonical redirect.
 * @param dataSlug  API data segment, e.g. "past-performance-data" or "future-performance-data"
 * @param pageSlug  Page segment for the redirect URL, e.g. "past-performance" or "future-performance"
 */
export async function getPerformanceOrRedirect(exchange: string, ticker: string, dataSlug: string, pageSlug: string): Promise<PerformanceResponse> {
  const data = await fetchPerformanceByExchange(exchange, ticker, dataSlug);

  if (data.ticker) {
    return data;
  }

  noStore();
  const fallback = await fetchPerformanceAnyExchange(ticker, dataSlug);

  if (!fallback.ticker) {
    notFound();
  }

  const canonicalExchange = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/${pageSlug}`);
  }

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
