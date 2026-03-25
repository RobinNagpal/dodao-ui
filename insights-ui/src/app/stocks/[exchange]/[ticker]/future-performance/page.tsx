import FuturePerformance from '@/components/ticker-reportsv1/FuturePerformance';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FuturePerformanceResponse } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { generateFuturePerformanceArticleSchema, generateFuturePerformanceBreadcrumbSchema } from '@/utils/metadata-generators';
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
const EMPTY_RESPONSE: FuturePerformanceResponse = { categoryResult: null, ticker: undefined };

/** Fetch future performance data for a specific exchange+ticker (cached). */
async function fetchFuturePerformanceByExchange(exchange: string, ticker: string): Promise<FuturePerformanceResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/future-performance-data`;
  try {
    const res: Response = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [tickerAndExchangeTag(ticker, exchange)] } });
    if (!res.ok) {
      console.warn(`fetchFuturePerformanceByExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as FuturePerformanceResponse;
  } catch (err) {
    console.warn('fetchFuturePerformanceByExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/** Fetch future performance data for any exchange (uncached fallback). */
async function fetchFuturePerformanceAnyExchange(ticker: string): Promise<FuturePerformanceResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}/future-performance-data`;
  try {
    const res: Response = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`fetchFuturePerformanceAnyExchange failed (${res.status}): ${url}`);
      return EMPTY_RESPONSE;
    }
    return (await res.json()) as FuturePerformanceResponse;
  } catch (err) {
    console.warn('fetchFuturePerformanceAnyExchange error:', err);
    return EMPTY_RESPONSE;
  }
}

/**
 * Exchange-aware fetch with uncached fallback + canonical redirect.
 */
async function getFuturePerformanceOrRedirect(exchange: string, ticker: string): Promise<FuturePerformanceResponse> {
  // Try the requested exchange first (cached)
  const data = await fetchFuturePerformanceByExchange(exchange, ticker);

  // Ticker found on the correct exchange — happy path
  if (data.ticker) {
    return data;
  }

  // Ticker not found for this exchange — try any exchange (uncached)
  noStore();
  const fallback = await fetchFuturePerformanceAnyExchange(ticker);

  // Ticker doesn't exist at all — show 404
  if (!fallback.ticker) {
    notFound();
  }

  // Found on a different exchange — redirect to the canonical future-performance URL
  const canonicalExchange: string = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/future-performance`);
  }

  return fallback;
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let futurePerfCreatedTime: string;
  let futurePerfUpdatedTime: string;

  try {
    const data = await fetchFuturePerformanceByExchange(exchange, ticker);
    companyName = data.ticker?.name ?? companyName;
    industryName = data.ticker?.industry?.name || data.ticker?.industryKey || '';

    const createdAt = data.categoryResult?.createdAt || data.ticker?.createdAt || new Date();
    const updatedAt = data.categoryResult?.updatedAt || data.ticker?.updatedAt || new Date();
    futurePerfCreatedTime = new Date(createdAt).toISOString();
    futurePerfUpdatedTime = new Date(updatedAt).toISOString();
  } catch {
    const now = new Date().toISOString();
    futurePerfCreatedTime = now;
    futurePerfUpdatedTime = now;
  }

  const year = new Date().getFullYear();

  const shortDesc: string = truncateForMeta(
    `Detailed future growth and performance analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Evaluate projected earnings, revenue growth forecasts, expansion plans, and other key forward-looking metrics.`
  );

  const canonicalUrl: string = `https://koalagains.com/stocks/${exchange}/${ticker}/future-performance`;

  const keywords: string[] = [
    `${companyName} future performance`,
    `${companyName} future growth`,
    `${ticker} earnings forecast`,
    `${companyName} revenue projections`,
    `${companyName} growth prospects`,
    `${ticker} forward-looking analysis`,
    `${companyName} stock forecast`,
    'future performance analysis',
    'stock growth forecast',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Future Performance Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Future Performance Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: futurePerfCreatedTime,
      modifiedTime: futurePerfUpdatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Future Performance Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function FuturePerformancePage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const futurePerformanceData = await getFuturePerformanceOrRedirect(exchange, ticker);
  const tickerData = futurePerformanceData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const articleSchema = generateFuturePerformanceArticleSchema(tickerData, futurePerformanceData.categoryResult);
  const breadcrumbSchema = generateFuturePerformanceBreadcrumbSchema(tickerData, country);

  const industryName: string = tickerData.industry?.name || tickerData.industryKey;

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: '/stocks', current: false },
          { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Future Performance', href: `/stocks/${exchange}/${ticker}/future-performance`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Future Performance', href: `/stocks/${exchange}/${ticker}/future-performance`, current: true },
        ]
      : [
          { name: 'Stocks', href: '/stocks', current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Future Performance', href: `/stocks/${exchange}/${ticker}/future-performance`, current: true },
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

      <FuturePerformance tickerData={tickerData} data={futurePerformanceData} />
    </PageWrapper>
  );
}
