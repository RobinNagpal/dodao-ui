import AdminTimestamp from '@/components/auth/AdminTimestamp';
import { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { QuarterlyChartDataResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/quarterly-chart-data/route';
import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import StockActions from '@/app/stocks/[exchange]/[ticker]/StockActions';
import CompetitionAnalysisButton from '@/app/stocks/[exchange]/[ticker]/CompetitionAnalysisButton';
import TickerComparisonButton from '@/app/stocks/[exchange]/[ticker]/TickerComparisonButton';
import FavouriteButton from '@/app/stocks/[exchange]/[ticker]/FavouriteButton';
import NotesButton from '@/app/stocks/[exchange]/[ticker]/NotesButton';
import CompetitionChartSection from '@/components/ticker-reportsv1/CompetitionChartSection';
import FinancialInfo, { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
// Lazy wrappers — chart.js + react-chartjs-2 deferred out of the main bundle.
// See PriceChartLazy.tsx / QuarterlyMetricsChartLazy.tsx for the dynamic config.
import PriceChart from '@/components/ticker-reportsv1/PriceChartLazy';
import QuarterlyMetricsChart from '@/components/ticker-reportsv1/QuarterlyMetricsChartLazy';
import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SpiderGraphForTicker, SpiderGraphPie } from '@/types/public-equity/ticker-report-types';
import {
  CATEGORY_MAPPINGS,
  CompetitionResponse,
  EvaluationResult,
  MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS,
  ManagementTeamAlignmentVerdict,
  ReportType,
  TickerAnalysisCategory,
} from '@/types/ticker-typesv1';
import { parseMarkdown } from '@/util/parse-markdown';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import {
  getCountryByExchange,
  USExchanges,
  CanadaExchanges,
  IndiaExchanges,
  UKExchanges,
  SupportedCountries,
  formatExchangeWithCountry,
} from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { generateStockReportArticleSchema, generateStockReportBreadcrumbSchema } from '@/utils/metadata-generators';
import { enforceMovedRedirect } from '@/utils/ticker-moved-redirect';
import { enforceDeletedTicker } from '@/utils/ticker-deleted-handler';
import { FullTickerV1CategoryAnalysisResult, SimilarTicker, TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense, use } from 'react';

import { TickerRadarChart } from './TickerRadarChart';

/**
 * Render dynamically per request. Pages were flipped from `force-static` to
 * `force-dynamic` in the broader ISR-disable migration (see
 * `docs/insights-ui/cloudfront-deploy-skew.md`). CloudFront in front of Vercel
 * absorbs hot-path traffic at the edge; long-tail requests pay an SSR cost.
 *
 * Suspense + per-slice fetches below stream the page shell + skeletons to the
 * client immediately, then fill in each section as its data resolves. This is
 * the per-slice streaming pattern that the May-15 `/full-render` consolidation
 * had removed, and that the user-perceived performance metrics depend on.
 */
export const dynamic = 'force-dynamic';

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Data fetchers */
async function fetchTickerByExchange(exchange: string, ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) {
    // Server error (DB down, etc.) - throw to show error.tsx
    throw new Error(`fetchTickerByExchange failed (${res.status}): ${url}`);
  }
  const data: TickerV1FastResponse | null = (await res.json()) as TickerV1FastResponse | null;
  return data;
}

async function fetchTickerAnyExchange(ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    // Server error (DB down, etc.) - throw to show error.tsx
    throw new Error(`fetchTickerAnyExchange failed (${res.status}): ${url}`);
  }
  const data: TickerV1FastResponse | null = (await res.json()) as TickerV1FastResponse | null;
  return data;
}

/** Exchange-aware fetch with uncached fallback + canonical redirect */
async function getTickerOrRedirect(params: RouteParams): Promise<TickerV1FastResponse> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  // Try fetching by specific exchange first
  const tickerByExchange = await fetchTickerByExchange(exchange, ticker);
  if (tickerByExchange) {
    enforceDeletedTicker(tickerByExchange);
    enforceMovedRedirect(tickerByExchange, exchange, ticker);
    return tickerByExchange;
  }

  // Not found on specified exchange, try any exchange (uncached)
  noStore();
  const tickerAnyExchange = await fetchTickerAnyExchange(ticker);

  // Ticker doesn't exist at all - show 404
  if (!tickerAnyExchange) {
    notFound();
  }

  enforceDeletedTicker(tickerAnyExchange);

  // Found on a different exchange - redirect to canonical URL
  const canonicalExchange: string = tickerAnyExchange.exchange.toUpperCase();
  if (canonicalExchange !== exchange) {
    permanentRedirect(`/stocks/${canonicalExchange}/${tickerAnyExchange.symbol.toUpperCase()}`);
  }

  enforceMovedRedirect(tickerAnyExchange, exchange, ticker);
  return tickerAnyExchange;
}

/**
 * Refresh window for time-driven scraper / market-data fetches. These hit
 * external services (Stock Analyzer Lambda, Yahoo Finance) whose underlying
 * upserts use a 7-day staleness threshold (`yahoo-price-history.ts` /
 * `stock-analyzer-scraper-utils.ts` FETCH_CONFIGS).
 *
 * We deliberately pick 8 days — one full day beyond the staleness threshold —
 * so that when this fetch's cache does expire and the API route runs, the DB
 * row's `lastUpdatedAt*` is guaranteed to be older than 7 days, which makes
 * the freshness check fire and the upstream Lambda/Yahoo call actually
 * happen. At exactly 7 days the comparison (`ageInDays > 7`) can fall on the
 * wrong side and skip the refresh.
 *
 * Only the 3 fetches that depend on external freshness (price-history,
 * financial-info, quarterly-chart) carry this revalidate. The umbrella tag
 * is invalidated independently by savers/admin actions; the time-based
 * revalidate is purely a backstop for dormant tickers.
 */
const EIGHT_DAYS_IN_SECONDS = 8 * 24 * 60 * 60;

/** Similar + financial fetchers (promise-based for Suspense) */
async function fetchSimilar(exchange: string, ticker: string): Promise<SimilarTicker[]> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/similar-tickers`;

  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) throw new Error(`fetchSimilar failed (${res.status}): ${url}`);

  const arr = (await res.json()) as SimilarTicker[];
  return arr;
}

async function fetchFinancialInfo(exchange: string, ticker: string): Promise<FinancialInfoResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/financial-info`;

  try {
    const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)], revalidate: EIGHT_DAYS_IN_SECONDS } });
    if (!res.ok) {
      console.error(`fetchFinancialInfo failed (${res.status}): ${url}`);
      return null;
    }

    const wrapper = (await res.json()) as { financialInfo: FinancialInfoResponse | null };
    return wrapper.financialInfo;
  } catch (error) {
    console.error(`fetchFinancialInfo error for ${ticker}:`, error);
    return null;
  }
}

async function fetchQuarterlyChartData(exchange: string, ticker: string): Promise<QuarterlyChartDataResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/quarterly-chart-data`;

  try {
    const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)], revalidate: EIGHT_DAYS_IN_SECONDS } });
    if (!res.ok) {
      console.error(`fetchQuarterlyChartData failed (${res.status}): ${url}`);
      return null;
    }

    const wrapper = (await res.json()) as { chartData: QuarterlyChartDataResponse | null };
    return wrapper.chartData;
  } catch (error) {
    console.error(`fetchQuarterlyChartData error for ${ticker}:`, error);
    return null;
  }
}

async function fetchPriceHistory(exchange: string, ticker: string): Promise<PriceHistoryResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/price-history`;

  try {
    const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)], revalidate: EIGHT_DAYS_IN_SECONDS } });
    if (!res.ok) {
      console.error(`fetchPriceHistory failed (${res.status}): ${url}`);
      return null;
    }

    const wrapper = (await res.json()) as { priceHistory: PriceHistoryResponse | null };
    return wrapper.priceHistory;
  } catch (error) {
    console.error(`fetchPriceHistory error for ${ticker}:`, error);
    return null;
  }
}

async function fetchCompetitionData(exchange: string, ticker: string): Promise<CompetitionResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/competition-tickers`;

  try {
    const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
    if (!res.ok) {
      console.error(`fetchCompetitionData failed (${res.status}): ${url}`);
      return null;
    }

    return (await res.json()) as CompetitionResponse;
  } catch (error) {
    console.error(`fetchCompetitionData error for ${ticker}:`, error);
    return null;
  }
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let summary: string = `Financial analysis and reports for ${ticker}. Explore key metrics, insights, and evaluations.`;
  let metaDescription: string = '';
  let createdTime: string | undefined;
  let updatedTime: string | undefined;

  try {
    const data = await fetchTickerByExchange(exchange, ticker);
    if (data) {
      companyName = data.name ?? companyName;
      summary = data.summary ?? summary;
      metaDescription = data.metaDescription ?? '';
      createdTime = data.createdAt?.toISOString();
      updatedTime = data.updatedAt?.toISOString() ?? createdTime;
    }
  } catch {
    /* keep generic */
  }

  const year = new Date().getFullYear();

  // Use metaDescription if available, otherwise truncate summary
  const shortDesc: string = metaDescription || truncateForMeta(summary);
  const canonicalUrl: string = `https://koalagains.com/stocks/${exchange}/${ticker}`;
  const keywords: string[] = [
    companyName,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} analysis`,
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Stock Analysis & Key Metrics (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Stock Analysis & Key Metrics | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime ?? updatedTime,
      modifiedTime: updatedTime ?? createdTime,
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Stock Analysis & Key Metrics | KoalaGains`,
      description: shortDesc,
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    keywords,
  };
}

/* =============================================================================
   SHARED SKELETONS (typed, minimal)
============================================================================= */
function FinancialInfoSkeleton(): JSX.Element {
  return (
    <section id="financial-info" className="bg-surface rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FinancialCard label="Current Price" isLoading={true} />
        <FinancialCard label="52 Week Range" isLoading={true} />
        <FinancialCard label="Market Cap" isLoading={true} />
        <FinancialCard label="EPS (Diluted TTM)" isLoading={true} />
        <FinancialCard label="P/E Ratio" isLoading={true} />
        <FinancialCard label="Forward P/E" isLoading={true} />
        <FinancialCard label="Beta" isLoading={true} />
        <FinancialCard label="Day Volume" isLoading={true} />
        <FinancialCard label="Total Revenue (TTM)" isLoading={true} />
        <FinancialCard label="Net Income (TTM)" isLoading={true} />
        <FinancialCard label="Annual Dividend" isLoading={true} />
        <FinancialCard label="Dividend Yield" isLoading={true} />
      </div>
    </section>
  );
}

function QuarterlyChartSkeleton(): JSX.Element {
  return (
    <section id="quarterly-metrics-chart" className="bg-surface rounded-lg shadow-sm px-2 py-3 sm:p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="h-6 w-48 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-32 rounded bg-surface-2 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 rounded-md bg-surface-2 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-surface-2 animate-pulse" />
    </section>
  );
}

function PriceChartSkeleton(): JSX.Element {
  return (
    <section id="price-chart" className="bg-surface rounded-lg shadow-sm px-2 py-3 sm:p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="h-6 w-36 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-24 rounded bg-surface-2 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['1M', '6M', '1Y', '3Y', '5Y'].map((label) => (
            <div key={label} className="h-8 w-12 rounded-md bg-surface-2 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-surface-2 animate-pulse" />
    </section>
  );
}

/** Skeleton for TickerChartsInfo: Financial table (left) + Radar chart (right) + Quarterly chart (below) */
function ChartsInfoSkeleton(): JSX.Element {
  return (
    <section className="mb-8">
      {/* Financial Info (left) and Spider Chart (right) side by side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Financial Information Skeleton */}
        <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
          <FinancialInfoSkeleton />
        </div>

        {/* Right: Spider Chart Skeleton */}
        <div className="lg:w-1/2 flex justify-center">
          <div className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
            <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
              <div className="h-8 w-12 rounded bg-surface-2 animate-pulse" />
            </div>
            <RadarSkeleton />
          </div>
        </div>
      </div>

      {/* Price Chart Skeleton (rendered above the quarterly chart) */}
      <div style={{ minHeight: '320px' }}>
        <PriceChartSkeleton />
      </div>

      {/* Quarterly Metrics Chart Skeleton */}
      <div style={{ minHeight: '320px' }}>
        <QuarterlyChartSkeleton />
      </div>
    </section>
  );
}

/* =============================================================================
   CHILD SERVER COMPONENTS (strictly typed, minimal)
============================================================================= */

function BreadcrumbsFromData({ data }: { data: Promise<TickerV1FastResponse> }): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  const exchange: string = d.exchange.toUpperCase();
  const ticker: string = d.symbol.toUpperCase();
  const country: SupportedCountries = getCountryByExchange(d.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);
  const industryName: string = d.industry.name || d.industryKey;
  const subIndustryName: string = d.industry.name || d.subIndustryKey;

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: `/stocks`, current: false },
          { name: industryName, href: `/stocks/industries/${d.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${d.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: true },
        ]
      : [
          { name: 'Stocks', href: `/stocks`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: true },
        ];

  return (
    <Breadcrumbs
      breadcrumbs={breadcrumbs}
      rightButton={
        <StockActions
          ticker={{ symbol: d.symbol, exchange: d.exchange as TickerIdentifier['exchange'] }}
          movedExchange={d.movedExchange ?? null}
          movedSymbol={d.movedSymbol ?? null}
          isDeleted={d.isDeleted ?? false}
          websiteUrl={d.websiteUrl ?? null}
          mobileActions={{
            tickerId: d.id,
            tickerSymbol: d.symbol,
            tickerName: d.name,
            tickerIndustryKey: d.industryKey,
            tickerSubIndustryKey: d.subIndustryKey,
            tickerIndustryName: industryName,
            tickerSubIndustryName: subIndustryName,
          }}
        >
          <FavouriteButton tickerId={d.id} tickerSymbol={d.symbol} tickerName={d.name} />
          <NotesButton tickerId={d.id} tickerSymbol={d.symbol} tickerName={d.name} />
          <TickerComparisonButton
            tickerSymbol={d.symbol}
            tickerName={d.name}
            tickerIndustryKey={d.industryKey}
            tickerSubIndustryKey={d.subIndustryKey}
            tickerIndustryName={industryName}
            tickerSubIndustryName={subIndustryName}
          />
        </StockActions>
      }
      hideHomeIcon={true}
      mobileBackOnly={true}
    />
  );
}

function TickerSummaryInfo({ data }: { data: Promise<TickerV1FastResponse> }): JSX.Element {
  const d: TickerV1FastResponse = use(data);

  return (
    <section id="introduction" className="text-left mb-2">
      {/* About Report - displayed above the main heading */}
      {d.aboutReport && <div className="text-muted markdown-body text-sm pb-4" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.aboutReport) }} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl min-w-0" itemProp="headline">
          {d.name} ({d.symbol}){' '}
          {d.websiteUrl && (
            <a href={d.websiteUrl} target="_blank" rel="noopener noreferrer" title={"website of the company's homepage"}>
              <ArrowTopRightOnSquareIcon className="size-6 sm:size-8 cursor-pointer inline link-color" />
            </a>
          )}
        </h1>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-muted">{formatExchangeWithCountry(d.exchange)}</span>
          <CompetitionAnalysisButton exchange={d.exchange.toUpperCase()} ticker={d.symbol.toUpperCase()} />
        </div>
      </div>

      {/* Company Summary */}
      <div className="mb-2" itemProp="description">
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.summary ?? 'Not yet populated') }} />
      </div>
    </section>
  );
}

function TickerChartsInfo({
  data,
  financialInfoPromise,
  quarterlyChartPromise,
  priceHistoryPromise,
}: {
  data: Promise<TickerV1FastResponse>;
  financialInfoPromise: Promise<FinancialInfoResponse | null>;
  quarterlyChartPromise: Promise<QuarterlyChartDataResponse | null>;
  priceHistoryPromise: Promise<PriceHistoryResponse | null>;
}): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  const financialData: FinancialInfoResponse | null = use(financialInfoPromise);
  const quarterlyChartData: QuarterlyChartDataResponse | null = use(quarterlyChartPromise);
  const priceHistoryData: PriceHistoryResponse | null = use(priceHistoryPromise);

  const spiderGraph: SpiderGraphForTicker = Object.fromEntries(
    Object.entries(CATEGORY_MAPPINGS).map(([categoryKey, categoryTitle]: [string, string]) => {
      const report: FullTickerV1CategoryAnalysisResult | undefined = (d.categoryAnalysisResults || []).find((r) => r.categoryKey === categoryKey);
      const pieData: SpiderGraphPie = {
        key: categoryKey,
        name: categoryTitle,
        summary: report?.summary || 'No summary available.',
        scores: report?.factorResults?.map((fr) => ({
          score: fr.result === EvaluationResult.Pass ? 1 : 0,
          comment: `${fr.analysisCategoryFactor?.factorAnalysisTitle}: ${fr.oneLineExplanation}`,
        })) || [{ score: 0, comment: 'No analysis available' }],
      };
      return [categoryKey, pieData];
    })
  ) as SpiderGraphForTicker;

  const score: number = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <section className="mb-8">
      {/* Financial Info (left) and Spider Chart (right) side by side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Financial Information - Always reserve space to prevent layout shift */}
        <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
          {financialData ? <FinancialInfo data={financialData} /> : <FinancialInfoSkeleton />}
        </div>

        {/* Right: Spider Chart */}
        <div id="spider-chart" className="lg:w-1/2 flex justify-center">
          <div className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
            <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-color, blue)' }}>
                {score.toFixed(0)}%
              </div>
              <SpiderChartFlyoutMenu />
            </div>
            {/* Suspense needed here for dynamic import of TickerRadarChart */}
            <Suspense fallback={<RadarSkeleton />}>
              <TickerRadarChart data={spiderGraph} scorePercentage={score} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Price Chart (rendered above Quarterly Metrics) */}
      {priceHistoryData && <PriceChart data={priceHistoryData} />}

      {/* Quarterly Metrics Chart - skeleton handles CLS during streaming; once resolved, only render when data exists */}
      {quarterlyChartData && <QuarterlyMetricsChart data={quarterlyChartData} />}
    </section>
  );
}

function getManagementTeamVerdictBadgeClasses(verdict: ManagementTeamAlignmentVerdict): string {
  switch (verdict) {
    case ManagementTeamAlignmentVerdict.OWNER_OPERATOR:
    case ManagementTeamAlignmentVerdict.STRONGLY_ALIGNED:
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
    case ManagementTeamAlignmentVerdict.ALIGNED:
      return 'bg-sky-500/15 text-sky-300 border border-sky-500/40';
    case ManagementTeamAlignmentVerdict.WEAKLY_ALIGNED:
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/40';
    case ManagementTeamAlignmentVerdict.MISALIGNED:
      return 'bg-red-500/15 text-red-300 border border-red-500/40';
    default:
      return 'bg-gray-500/15 text-body border border-gray-500/40';
  }
}

const CATEGORY_DETAIL_LINKS: Record<TickerAnalysisCategory, { id: ReportType; href: (exchange: string, symbol: string) => string; label: string }> = {
  [TickerAnalysisCategory.BusinessAndMoat]: {
    id: ReportType.BUSINESS_AND_MOAT,
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/business-and-moat`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.FinancialStatementAnalysis]: {
    id: ReportType.FINANCIAL_ANALYSIS,
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/financial-statement-analysis`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.PastPerformance]: {
    id: ReportType.PAST_PERFORMANCE,
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/past-performance`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.FutureGrowth]: {
    id: ReportType.FUTURE_GROWTH,
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/future-performance`,
    label: 'Show Detailed Future Analysis →',
  },
  [TickerAnalysisCategory.FairValue]: {
    id: ReportType.FAIR_VALUE,
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/fair-value`,
    label: 'View Detailed Fair Value →',
  },
};

function CategorySummaryCard({ categoryKey, d }: { categoryKey: TickerAnalysisCategory; d: TickerV1FastResponse }): JSX.Element {
  const categoryResult: FullTickerV1CategoryAnalysisResult | undefined = d.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
  const link = CATEGORY_DETAIL_LINKS[categoryKey];
  return (
    <div id={link.id} className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{CATEGORY_MAPPINGS[categoryKey]}</h3>
          {categoryResult && (
            <div
              className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
            >
              {categoryResult.factorResults?.filter((fr) => fr.result === EvaluationResult.Pass).length || 0}/5
            </div>
          )}
          {categoryResult?.updatedAt && <AdminTimestamp date={categoryResult.updatedAt} />}
        </div>
        <Link
          href={link.href(d.exchange.toUpperCase(), d.symbol.toUpperCase())}
          prefetch={false}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
        >
          {link.label}
        </Link>
      </div>
      <div
        className="text-body markdown markdown-body"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.overallAnalysisDetails || 'No summary available.') }}
      />
    </div>
  );
}

function TickerAnalysisInfo({
  data,
  competitionPromise,
  exchange,
  ticker,
}: {
  data: Promise<TickerV1FastResponse>;
  competitionPromise: Promise<CompetitionResponse | null>;
  exchange: string;
  ticker: string;
}): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  const managementTeamReport = d.managementTeamReports?.[0];

  return (
    <section id="summary-analysis" className="mb-4 sm:py-6" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Summary Analysis</h2>
      <div className="space-y-4">
        <CategorySummaryCard categoryKey={TickerAnalysisCategory.BusinessAndMoat} d={d} />

        {/*
          content-visibility: auto — defers layout/paint for everything below the Business & Moat card
          until it nears the viewport. HTML is fully rendered server-side so crawlers still index every
          section. contain-intrinsic-size reserves a height estimate to avoid scrollbar jumps before
          first paint; the browser remembers the actual measured size after that.
        */}
        <div className="space-y-4 [content-visibility:auto] [contain-intrinsic-size:auto_2500px]">
          <CompetitionChartSection dataPromise={competitionPromise} exchange={exchange} ticker={ticker} />

          {managementTeamReport && (
            <div id={ReportType.MANAGEMENT_TEAM} className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">Management Team Experience &amp; Alignment</h3>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium ${getManagementTeamVerdictBadgeClasses(
                      managementTeamReport.alignmentVerdict as ManagementTeamAlignmentVerdict
                    )}`}
                  >
                    {MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS[managementTeamReport.alignmentVerdict as ManagementTeamAlignmentVerdict] ||
                      managementTeamReport.alignmentVerdict}
                  </span>
                  {managementTeamReport.updatedAt && <AdminTimestamp date={managementTeamReport.updatedAt} />}
                </div>
                <Link
                  href={`/stocks/${d.exchange.toUpperCase()}/${d.symbol.toUpperCase()}/management-team`}
                  prefetch={false}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                >
                  View Detailed Analysis →
                </Link>
              </div>
              <div
                className="text-body markdown markdown-body"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(managementTeamReport.summary || 'No summary available.') }}
              />
            </div>
          )}

          <CategorySummaryCard categoryKey={TickerAnalysisCategory.FinancialStatementAnalysis} d={d} />
          <CategorySummaryCard categoryKey={TickerAnalysisCategory.PastPerformance} d={d} />
          <CategorySummaryCard categoryKey={TickerAnalysisCategory.FutureGrowth} d={d} />
          <CategorySummaryCard categoryKey={TickerAnalysisCategory.FairValue} d={d} />
        </div>
      </div>
    </section>
  );
}

function TickerArticleFooter({ modifiedDate, formattedModifiedDate }: { modifiedDate: Date; formattedModifiedDate: string }): JSX.Element {
  return (
    <footer className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span>Last updated by </span>
          <span itemProp="author" itemScope itemType="https://schema.org/Organization">
            <span itemProp="name">KoalaGains</span>
          </span>
          <span> on </span>
          <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
            {formattedModifiedDate}
          </time>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full bg-sky-500/15 border border-sky-500/40 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            Stock Analysis
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-500/15 border border-indigo-500/40 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            Investment Report
          </span>
        </div>
      </div>
    </footer>
  );
}
/** PAGE */
export default async function TickerDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  // Main ticker data (promise for selective Suspense usage)
  const tickerInfo = getTickerOrRedirect(params);

  // Get ticker data for structured data generation
  const tickerData = await tickerInfo;
  const country = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  // Generate structured data
  const articleSchema = generateStockReportArticleSchema(tickerData);
  const breadcrumbSchema = generateStockReportBreadcrumbSchema(tickerData, country);

  // We only need params (not data) to kick off Competition/Similar fetch promises up front
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const exchange: string = routeParams.exchange.toUpperCase();
  const ticker: string = routeParams.ticker.toUpperCase();

  // Helper: try with route {exchange,ticker}; on error, wait for canonical then retry
  const retryWithCanonical: <T>(fn: (ex: string, tk: string) => Promise<T>) => Promise<T> = <T,>(fn: (ex: string, tk: string) => Promise<T>): Promise<T> =>
    (async () => {
      try {
        return await fn(exchange, ticker); // optimistic, fastest when route is already canonical
      } catch {
        const d = await tickerInfo; // wait for canonical only if first attempt fails
        return fn(d.exchange.toUpperCase(), d.symbol.toUpperCase());
      }
    })();

  // Promises consumed by child components via `use()` under Suspense
  const similarPromise = retryWithCanonical(fetchSimilar);
  const financialInfoPromise = retryWithCanonical(fetchFinancialInfo);
  const quarterlyChartPromise = retryWithCanonical(fetchQuarterlyChartData);
  const priceHistoryPromise = retryWithCanonical(fetchPriceHistory);
  const competitionPromise = retryWithCanonical(fetchCompetitionData);

  // Derive dates for semantic footer (based solely on tickerData)
  const createdAtRaw = tickerData.createdAt || new Date();
  const updatedAtRaw = tickerData.updatedAt || tickerData.createdAt || new Date();
  const publishedDate = new Date(createdAtRaw);
  const modifiedDate = new Date(updatedAtRaw);
  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageWrapper>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      {/* Breadcrumbs - server rendered, no skeleton needed */}
      <BreadcrumbsFromData data={tickerInfo} />

      <article itemScope itemType="https://schema.org/Article">
        {/* Hidden datePublished for schema - machine readable only */}
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        {/* Summary info - server rendered, no skeleton needed */}
        <TickerSummaryInfo data={tickerInfo} />

        <Suspense fallback={<ChartsInfoSkeleton />}>
          <TickerChartsInfo
            data={tickerInfo}
            financialInfoPromise={financialInfoPromise}
            quarterlyChartPromise={quarterlyChartPromise}
            priceHistoryPromise={priceHistoryPromise}
          />
        </Suspense>

        {/* Analysis info - server rendered, no skeleton needed */}
        <TickerAnalysisInfo data={tickerInfo} competitionPromise={competitionPromise} exchange={exchange} ticker={ticker} />

        {/* content-visibility: auto — see TickerAnalysisInfo for rationale. Each below-fold block
            gets its own wrapper so the browser can paint them independently as they scroll in. */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
          <SimilarTickers dataPromise={similarPromise} />
        </div>

        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_200px]">
          <TickerArticleFooter modifiedDate={modifiedDate} formattedModifiedDate={formattedModifiedDate} />
        </div>
      </article>
    </PageWrapper>
  );
}
