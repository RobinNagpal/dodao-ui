import StockSubPageActions from '@/app/stocks/[exchange]/[ticker]/StockSubPageActions';
import SimilarTickersSection from '@/components/ticker-reportsv1/SimilarTickersSection';
import Stability from '@/components/ticker-reportsv1/Stability';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CanadaExchanges, getCountryByExchange, IndiaExchanges, SupportedCountries, UKExchanges, USExchanges } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { generateStabilityArticleSchema, generateStabilityBreadcrumbSchema } from '@/utils/metadata-generators';
import { enforceDeletedTicker } from '@/utils/ticker-deleted-handler';
import { enforceMovedRedirect } from '@/utils/ticker-moved-redirect';
import { tickerStabilityTag } from '@/utils/ticker-v1-cache-utils';
import { TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

const PAGE_SLUG = 'stability';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-dynamic';

export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

async function fetchTickerByExchange(exchange: string, ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { next: { tags: [tickerStabilityTag(ticker, exchange)] } });
  if (!res.ok) {
    throw new Error(`fetchTickerByExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerV1FastResponse | null;
}

async function fetchTickerAnyExchange(ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`fetchTickerAnyExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerV1FastResponse | null;
}

async function getTickerOrRedirect(exchange: string, ticker: string): Promise<TickerV1FastResponse> {
  const data = await fetchTickerByExchange(exchange, ticker);
  if (data) {
    enforceDeletedTicker(data);
    enforceMovedRedirect(data, exchange, ticker, `/${PAGE_SLUG}`);
    return data;
  }

  noStore();
  const fallback = await fetchTickerAnyExchange(ticker);
  if (!fallback) notFound();

  enforceDeletedTicker(fallback);

  const canonicalExchange: string = fallback.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.symbol.toUpperCase()}/${PAGE_SLUG}`);
  }
  enforceMovedRedirect(fallback, exchange, ticker, `/${PAGE_SLUG}`);
  return fallback;
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let createdTime: string;
  let updatedTime: string;

  try {
    const data = await fetchTickerByExchange(exchange, ticker);
    companyName = data?.name ?? companyName;
    industryName = data?.industry?.name || data?.industryKey || '';
    const report = data?.stabilityReports?.[0];
    const createdAt = report?.createdAt || data?.createdAt || new Date();
    const updatedAt = report?.updatedAt || data?.updatedAt || new Date();
    createdTime = new Date(createdAt).toISOString();
    updatedTime = new Date(updatedAt).toISOString();
  } catch {
    const now = new Date().toISOString();
    createdTime = now;
    updatedTime = now;
  }

  const year = new Date().getFullYear();
  const shortDesc = truncateForMeta(
    `What happens to ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    } if the market drops 5%, 10% or 20% — expected price, sector impact, and company impact in each scenario.`
  );
  const canonicalUrl = `https://koalagains.com/stocks/${exchange}/${ticker}/${PAGE_SLUG}`;
  const keywords: string[] = [
    `${companyName} stability`,
    `${companyName} drawdown`,
    `${ticker} downside risk`,
    `${companyName} market crash impact`,
    `${ticker} expected price if market drops`,
    `${companyName} recession resilience`,
    'drawdown resilience',
    'market correction',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Stability & Market Drawdown Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Stability & Market Drawdown Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Stability & Market Drawdown Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    keywords,
  };
}

export default async function StabilityPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const tickerData = await getTickerOrRedirect(exchange, ticker);
  const report = tickerData.stabilityReports?.[0];
  if (!report) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);
  const industryName: string = tickerData.industry?.name || tickerData.industryKey;
  const sectorName: string = tickerData.subIndustry?.name || industryName;

  const articleSchema = generateStabilityArticleSchema(tickerData, report);
  const breadcrumbSchema = generateStabilityBreadcrumbSchema(tickerData, country);

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: '/stocks', current: false },
          { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Stability', href: `/stocks/${exchange}/${ticker}/${PAGE_SLUG}`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Stability', href: `/stocks/${exchange}/${ticker}/${PAGE_SLUG}`, current: true },
        ]
      : [
          { name: 'Stocks', href: '/stocks', current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Stability', href: `/stocks/${exchange}/${ticker}/${PAGE_SLUG}`, current: true },
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

      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        hideHomeIcon={true}
        mobileBackOnly={true}
        rightButton={<StockSubPageActions tickerId={tickerData.id} tickerSymbol={tickerData.symbol} tickerName={tickerData.name} />}
      />

      <Stability tickerData={tickerData} report={report} sectorName={sectorName} />

      <SimilarTickersSection exchange={tickerData.exchange} ticker={tickerData.symbol} subPageSlug={PAGE_SLUG} />
    </PageWrapper>
  );
}
