import Competition from '@/components/ticker-reportsv1/Competition';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerCompetitionTag } from '@/utils/ticker-v1-cache-utils';
import { enforceMovedRedirect } from '@/utils/ticker-moved-redirect';
import { enforceDeletedTicker } from '@/utils/ticker-deleted-handler';
import { generateCompetitionArticleSchema, generateCompetitionBreadcrumbSchema } from '@/utils/metadata-generators';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-dynamic';

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Fetch competition data for a specific exchange+ticker (cached). Returns null ticker if exchange mismatch. */
async function fetchCompetitionByExchange(exchange: string, ticker: string): Promise<CompetitionResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/competition-tickers`;
  const res: Response = await fetch(url, { next: { tags: [tickerCompetitionTag(ticker, exchange)] } });
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
    enforceDeletedTicker(data.ticker);
    enforceMovedRedirect(data.ticker, exchange, ticker, '/competition');
    return data;
  }

  // Ticker not found for this exchange — try any exchange (uncached)
  noStore();
  const fallback = await fetchCompetitionAnyExchange(ticker);

  // Ticker doesn't exist at all — show 404
  if (!fallback.ticker) {
    notFound();
  }

  enforceDeletedTicker(fallback.ticker);

  // Found on a different exchange — redirect to the canonical competition URL
  const canonicalExchange: string = fallback.ticker.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.ticker.symbol.toUpperCase()}/competition`);
  }

  enforceMovedRedirect(fallback.ticker, exchange, ticker, '/competition');
  return fallback;
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryLabel: string = '';
  let topCompetitorNames: string[] = [];
  let countryTag: string = '';
  let competitionCreatedTime: string | undefined;
  let competitionUpdatedTime: string | undefined;

  try {
    const data = await fetchCompetitionByExchange(exchange, ticker);
    companyName = data.ticker?.name ?? companyName;

    // Prefer sub-industry — it's more specific and usually shorter than industry,
    // which matters because industry names like "Building Systems, Materials & Infrastructure"
    // alone push past Google's ~70-char SERP cutoff.
    industryLabel = data.ticker?.subIndustry?.name || data.ticker?.industry?.name || '';

    topCompetitorNames = (data.competitorTickers ?? [])
      .map((c) => c.companyName)
      .filter((n): n is string => Boolean(n))
      .slice(0, 3);

    // Non-US country tag for title — gives same-industry pages a per-exchange differentiator
    // without lengthening the title for the US majority. Defensive try around unknown exchanges.
    try {
      const country = getCountryByExchange(data.ticker?.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);
      if (country && country !== 'US') countryTag = ` | ${country}`;
    } catch {
      /* unknown exchange — leave countryTag empty */
    }

    competitionCreatedTime = data.vsCompetition?.createdAt
      ? new Date(data.vsCompetition.createdAt).toISOString()
      : data.ticker?.createdAt
      ? new Date(data.ticker.createdAt).toISOString()
      : undefined;
    competitionUpdatedTime = data.vsCompetition?.updatedAt
      ? new Date(data.vsCompetition.updatedAt).toISOString()
      : data.ticker?.updatedAt
      ? new Date(data.ticker.updatedAt).toISOString()
      : competitionCreatedTime;
  } catch {
    // Network error — leave fields empty rather than synthesizing today's date,
    // which would push a false freshness signal into the page.
  }

  // Year from the report's modified date so the title doesn't claim "2026" on a
  // 2025-vintage page — that contradiction is one of the freshness signals Google
  // uses to demote pages into "Crawled — currently not indexed".
  const yearForTitle = competitionUpdatedTime ? new Date(competitionUpdatedTime).getFullYear() : new Date().getFullYear();

  // Per-ticker fallback description so two competition pages don't share a
  // byte-identical meta description. Even when the company name is the only
  // varying token, mixing in the top competitor names breaks the template.
  const competitorPhrase = topCompetitorNames.length > 0 ? `vs ${topCompetitorNames.join(', ')}` : 'against key industry peers';
  const industryPhrase = industryLabel ? ` in ${industryLabel}` : '';
  const shortDesc: string = truncateForMeta(
    `${companyName} (${ticker}) ${competitorPhrase}${industryPhrase} — quality vs value scores, market position, ` + `and competitive strengths on ${exchange}.`
  );

  const canonicalUrl: string = `https://koalagains.com/stocks/${exchange}/${ticker}/competition`;

  // Build the most-differentiated title that still fits Google's ~70-char SERP
  // cutoff. Industry-bearing form first; if it would be truncated we drop the
  // industry from the title (still present in description + h1 + JSON-LD).
  const TITLE_MAX = 70;
  const titleWithIndustry = industryLabel ? `${companyName} (${ticker}) Competitors in ${industryLabel} (${yearForTitle})${countryTag}` : '';
  const titleWithoutIndustry = `${companyName} (${ticker}) Competitive Analysis (${yearForTitle})${countryTag}`;
  const titleBase = titleWithIndustry && titleWithIndustry.length <= TITLE_MAX ? titleWithIndustry : titleWithoutIndustry;
  const ogTwitterTitle = `${titleBase} | KoalaGains`;

  return {
    title: titleBase,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: ogTwitterTitle,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: competitionCreatedTime,
      modifiedTime: competitionUpdatedTime ?? competitionCreatedTime,
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTwitterTitle,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
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
