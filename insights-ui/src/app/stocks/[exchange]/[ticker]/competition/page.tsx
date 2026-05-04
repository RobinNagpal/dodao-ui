import Competition from '@/components/ticker-reportsv1/Competition';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { generateCompetitionArticleSchema, generateCompetitionBreadcrumbSchema } from '@/utils/metadata-generators';
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
const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Fetch competition data for a specific exchange+ticker (cached). Returns null ticker if exchange mismatch. */
async function fetchCompetitionByExchange(exchange: string, ticker: string): Promise<CompetitionResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/competition-tickers`;
  const res: Response = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) {
    throw new Error(`fetchCompetitionByExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as CompetitionResponse;
}

/** Fetch competition data for any exchange (uncached — used only as fallback). */
async function fetchCompetitionAnyExchange(ticker: string): Promise<CompetitionResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}/competition-tickers`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`fetchCompetitionAnyExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as CompetitionResponse;
}

/**
 * Exchange-aware fetch with uncached fallback + canonical redirect.
 * Mirrors the pattern used in stocks/[exchange]/[ticker]/page.tsx.
 */
async function getCompetitionOrRedirect(exchange: string, ticker: string): Promise<CompetitionResponse> {
  // Try the requested exchange first (cached)
  const data = await fetchCompetitionByExchange(exchange, ticker);

  // Ticker found on the correct exchange — happy path
  if (data.ticker) {
    return data;
  }

  // Ticker not found for this exchange — try any exchange (uncached)
  noStore();
  const fallback = await fetchCompetitionAnyExchange(ticker);

  // Ticker doesn't exist at all — show 404
  if (!fallback.ticker) {
    notFound();
  }

  // Found on a different exchange — redirect to the canonical competition URL
  const canonicalExchange: string = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/competition`);
  }

  return fallback;
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let competitionCreatedTime: string;
  let competitionUpdatedTime: string;

  try {
    const data = await fetchCompetitionByExchange(exchange, ticker);
    companyName = data.ticker?.name ?? companyName;
    industryName = data.ticker?.industry?.name || data.ticker?.industryKey || '';

    // Use competition table dates
    const createdAt = data.vsCompetition?.createdAt || data.ticker?.createdAt || new Date();
    const updatedAt = data.vsCompetition?.updatedAt || data.ticker?.updatedAt || new Date();
    competitionCreatedTime = new Date(createdAt).toISOString();
    competitionUpdatedTime = new Date(updatedAt).toISOString();
  } catch {
    // Fallback if API fails
    const now = new Date().toISOString();
    competitionCreatedTime = now;
    competitionUpdatedTime = now;
  }

  const year = new Date().getFullYear();

  const shortDesc: string = truncateForMeta(
    `Detailed competitive analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Compare ${companyName} against its key competitors across market position, financials, and growth prospects.`
  );

  const canonicalUrl: string = `https://koalagains.com/stocks/${exchange}/${ticker}/competition`;

  const keywords: string[] = [
    `${companyName} competitors`,
    `${companyName} competitive analysis`,
    `${ticker} competition`,
    `${companyName} vs competitors`,
    `${companyName} market position`,
    `${ticker} competitor comparison`,
    `${companyName} stock comparison`,
    'competitive analysis',
    'stock comparison',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Competitive Analysis & Comparison (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Competitive Analysis & Comparison | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: competitionCreatedTime,
      modifiedTime: competitionUpdatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Competitive Analysis & Comparison | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function CompetitionPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const competitionData = await getCompetitionOrRedirect(exchange, ticker);
  const tickerData = competitionData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const competitorNames: string[] = competitionData.competitorTickers?.map((c) => c.companyName) || [];

  const articleSchema = generateCompetitionArticleSchema(tickerData, competitorNames, competitionData.vsCompetition);
  const breadcrumbSchema = generateCompetitionBreadcrumbSchema(tickerData, country);

  const industryName: string = tickerData.industry?.name || tickerData.industryKey;

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: '/stocks', current: false },
          { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Competition', href: `/stocks/${exchange}/${ticker}/competition`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Competition', href: `/stocks/${exchange}/${ticker}/competition`, current: true },
        ]
      : [
          { name: 'Stocks', href: '/stocks', current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Competition', href: `/stocks/${exchange}/${ticker}/competition`, current: true },
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

      <Competition tickerData={tickerData} data={competitionData} />
    </PageWrapper>
  );
}
