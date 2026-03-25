import PastPerformance from '@/components/ticker-reportsv1/PastPerformance';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PastPerformanceResponse } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { generatePastPerformanceArticleSchema, generatePastPerformanceBreadcrumbSchema } from '@/utils/metadata-generators';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Cache revalidation constants */
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Empty response returned when the API is unavailable or returns an error. */
const EMPTY_RESPONSE: PastPerformanceResponse = { categoryResult: null, ticker: undefined };

/** Fetch past performance data for a specific exchange+ticker (cached). */
async function fetchPastPerformanceByExchange(exchange: string, ticker: string): Promise<PastPerformanceResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/past-performance-data`;
  try {
    const res: Response = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [tickerAndExchangeTag(ticker, exchange)] } });
    if (!res.ok) {
      console.warn(`fetchPastPerformanceByExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PastPerformanceResponse;
  } catch (err) {
    console.warn('fetchPastPerformanceByExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/** Fetch past performance data for any exchange (uncached fallback). */
async function fetchPastPerformanceAnyExchange(ticker: string): Promise<PastPerformanceResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}/past-performance-data`;
  try {
    const res: Response = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`fetchPastPerformanceAnyExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as PastPerformanceResponse;
  } catch (err) {
    console.warn('fetchPastPerformanceAnyExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/**
 * Exchange-aware fetch with uncached fallback + canonical redirect.
 * Mirrors the pattern used in `competition/page.tsx`.
 */
async function getPastPerformanceOrRedirect(exchange: string, ticker: string): Promise<PastPerformanceResponse> {
  // Try the requested exchange first (cached)
  const data = await fetchPastPerformanceByExchange(exchange, ticker);

  // Ticker found on the correct exchange — happy path
  if (data.ticker) {
    return data;
  }

  // Ticker not found for this exchange — try any exchange (uncached)
  noStore();
  const fallback = await fetchPastPerformanceAnyExchange(ticker);

  // Ticker doesn't exist at all — show 404
  if (!fallback.ticker) {
    notFound();
  }

  // Found on a different exchange — redirect to the canonical past-performance URL
  const canonicalExchange: string = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/past-performance`);
  }

  return fallback;
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let pastPerfCreatedTime: string;
  let pastPerfUpdatedTime: string;

  try {
    const data = await fetchPastPerformanceByExchange(exchange, ticker);
    companyName = data.ticker?.name ?? companyName;
    industryName = data.ticker?.industry?.name || data.ticker?.industryKey || '';

    const createdAt = data.categoryResult?.createdAt || data.ticker?.createdAt || new Date();
    const updatedAt = data.categoryResult?.updatedAt || data.ticker?.updatedAt || new Date();
    pastPerfCreatedTime = new Date(createdAt).toISOString();
    pastPerfUpdatedTime = new Date(updatedAt).toISOString();
  } catch {
    const now = new Date().toISOString();
    pastPerfCreatedTime = now;
    pastPerfUpdatedTime = now;
  }

  const year = new Date().getFullYear();

  const shortDesc: string = truncateForMeta(
    `Detailed historical performance analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Evaluate earnings growth, revenue trends, return on equity, and other key historical metrics.`
  );

  const canonicalUrl: string = `https://koalagains.com/stocks/${exchange}/${ticker}/past-performance`;

  const keywords: string[] = [
    `${companyName} past performance`,
    `${companyName} historical analysis`,
    `${ticker} earnings growth`,
    `${companyName} revenue trends`,
    `${companyName} return on equity`,
    `${ticker} financial history`,
    `${companyName} stock history`,
    'past performance analysis',
    'historical stock analysis',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Past Performance Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Past Performance Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: pastPerfCreatedTime,
      modifiedTime: pastPerfUpdatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Past Performance Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function PastPerformancePage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const pastPerformanceData = await getPastPerformanceOrRedirect(exchange, ticker);
  const tickerData = pastPerformanceData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const articleSchema = generatePastPerformanceArticleSchema(tickerData, pastPerformanceData.categoryResult);
  const breadcrumbSchema = generatePastPerformanceBreadcrumbSchema(tickerData, country);

  const industryName: string = tickerData.industry?.name || tickerData.industryKey;

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: '/stocks', current: false },
          { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Past Performance', href: `/stocks/${exchange}/${ticker}/past-performance`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Past Performance', href: `/stocks/${exchange}/${ticker}/past-performance`, current: true },
        ]
      : [
          { name: 'Stocks', href: '/stocks', current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Past Performance', href: `/stocks/${exchange}/${ticker}/past-performance`, current: true },
        ];

  return (
    <PageWrapper>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />

      <PastPerformance tickerData={tickerData} data={pastPerformanceData} />
    </PageWrapper>
  );
}
