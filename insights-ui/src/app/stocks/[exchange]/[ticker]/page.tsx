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
import PriceChart from '@/components/ticker-reportsv1/PriceChart';
import QuarterlyMetricsChart from '@/components/ticker-reportsv1/QuarterlyMetricsChart';
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
import { TickerFullRenderResponse } from '@/utils/ticker-full-render-utils';
import { FullTickerV1CategoryAnalysisResult, SimilarTicker, TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import { TickerRadarChart } from './TickerRadarChart';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Refresh window for the consolidated render fetch. The underlying scraper /
 * Yahoo upserts use a 7-day staleness threshold (`yahoo-price-history.ts` /
 * `stock-analyzer-scraper-utils.ts` FETCH_CONFIGS). 8 days — one full day
 * beyond the staleness window — guarantees that when the cache entry expires
 * the next request sees DB rows older than 7 days, so the freshness check
 * actually fires. The umbrella tag is invalidated independently by savers /
 * admin actions; this time-based revalidate is only a backstop for dormant
 * tickers.
 */
const EIGHT_DAYS_IN_SECONDS = 8 * 24 * 60 * 60;

/**
 * Single consolidated fetch for everything the page renders. Replaces the six
 * separately-tagged fetches the page used to issue (ticker, similar,
 * financial-info, quarterly-chart, price-history, competition) — each of
 * which was one Data Cache entry. Folding them into one entry cuts the per-
 * rebuild cache-write count from ~7 (1 HTML + 6 Data Cache) to ~2 (1 HTML +
 * 1 Data Cache). See `docs/insights-ui/stock-page-caching.md`.
 */
async function fetchFullRender(exchange: string, ticker: string): Promise<TickerFullRenderResponse> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/full-render`;
  const res: Response = await fetch(url, {
    next: { tags: [tickerAndExchangeTag(ticker, exchange)], revalidate: EIGHT_DAYS_IN_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`fetchFullRender failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerFullRenderResponse;
}

/** Uncached fallback used only when the canonical exchange is unknown — same shape as the cached endpoint. */
async function fetchFullRenderAnyExchange(ticker: string): Promise<TickerV1FastResponse | null> {
  // No full-render endpoint exists for the "any exchange" lookup — fall back
  // to the lighter ticker-only endpoint just to discover the canonical
  // exchange, then let the cached path handle the actual data load on the
  // redirected URL.
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`fetchFullRenderAnyExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerV1FastResponse | null;
}

/** Exchange-aware fetch with uncached fallback + canonical redirect. */
async function getFullRenderOrRedirect(params: RouteParams): Promise<TickerFullRenderResponse> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const cached = await fetchFullRender(exchange, ticker);
  if (cached.ticker) {
    enforceDeletedTicker(cached.ticker);
    enforceMovedRedirect(cached.ticker, exchange, ticker);
    return cached;
  }

  // Not found on the specified exchange — try any exchange (uncached).
  noStore();
  const tickerAnyExchange = await fetchFullRenderAnyExchange(ticker);

  if (!tickerAnyExchange) {
    notFound();
  }

  enforceDeletedTicker(tickerAnyExchange);

  const canonicalExchange: string = tickerAnyExchange.exchange.toUpperCase();
  if (canonicalExchange !== exchange) {
    permanentRedirect(`/stocks/${canonicalExchange}/${tickerAnyExchange.symbol.toUpperCase()}`);
  }

  enforceMovedRedirect(tickerAnyExchange, exchange, ticker);

  // Same-exchange case with a stale cache miss — load the consolidated payload
  // directly so we still render a complete page.
  return fetchFullRender(canonicalExchange, tickerAnyExchange.symbol.toUpperCase());
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
    // Shares the umbrella-tagged cache entry with the page render — Next.js
    // dedupes the fetch within a request, so metadata generation costs nothing
    // extra after the page itself has hit (or built) the cache.
    const data = await fetchFullRender(exchange, ticker);
    const t = data.ticker;
    if (t) {
      companyName = t.name ?? companyName;
      summary = t.summary ?? summary;
      metaDescription = t.metaDescription ?? '';
      createdTime = t.createdAt?.toISOString();
      updatedTime = t.updatedAt?.toISOString() ?? createdTime;
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
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Stock Analysis & Key Metrics | KoalaGains`,
      description: shortDesc,
    },
    keywords,
  };
}

/* =============================================================================
   SHARED SKELETONS (typed, minimal)
============================================================================= */
function FinancialInfoSkeleton(): JSX.Element {
  return (
    <section id="financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
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

/* =============================================================================
   CHILD SERVER COMPONENTS (strictly typed, minimal)
============================================================================= */

function BreadcrumbsFromData({ data }: { data: TickerV1FastResponse }): JSX.Element {
  const d: TickerV1FastResponse = data;
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
    />
  );
}

function TickerSummaryInfo({ data }: { data: TickerV1FastResponse }): JSX.Element {
  const d: TickerV1FastResponse = data;

  return (
    <section id="introduction" className="text-left mb-2">
      {/* About Report - displayed above the main heading */}
      {d.aboutReport && <div className="text-gray-400 markdown-body text-sm pb-4" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.aboutReport) }} />}

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
          <span className="text-sm font-medium text-gray-400">{formatExchangeWithCountry(d.exchange)}</span>
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
  financialData,
  quarterlyChartData,
  priceHistoryData,
}: {
  data: TickerV1FastResponse;
  financialData: FinancialInfoResponse | null;
  quarterlyChartData: QuarterlyChartDataResponse | null;
  priceHistoryData: PriceHistoryResponse | null;
}): JSX.Element {
  const d: TickerV1FastResponse = data;

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
        <div className="lg:w-1/2 flex justify-center">
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
      return 'bg-green-900 text-green-200';
    case ManagementTeamAlignmentVerdict.ALIGNED:
      return 'bg-blue-900 text-blue-200';
    case ManagementTeamAlignmentVerdict.WEAKLY_ALIGNED:
      return 'bg-yellow-900 text-yellow-200';
    case ManagementTeamAlignmentVerdict.MISALIGNED:
      return 'bg-red-900 text-red-200';
    default:
      return 'bg-gray-800 text-gray-200';
  }
}

const CATEGORY_DETAIL_LINKS: Record<TickerAnalysisCategory, { href: (exchange: string, symbol: string) => string; label: string }> = {
  [TickerAnalysisCategory.BusinessAndMoat]: {
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/business-and-moat`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.FinancialStatementAnalysis]: {
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/financial-statement-analysis`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.PastPerformance]: {
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/past-performance`,
    label: 'View Detailed Analysis →',
  },
  [TickerAnalysisCategory.FutureGrowth]: {
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/future-performance`,
    label: 'Show Detailed Future Analysis →',
  },
  [TickerAnalysisCategory.FairValue]: {
    href: (exchange, symbol) => `/stocks/${exchange}/${symbol}/fair-value`,
    label: 'View Detailed Fair Value →',
  },
};

function CategorySummaryCard({ categoryKey, d }: { categoryKey: TickerAnalysisCategory; d: TickerV1FastResponse }): JSX.Element {
  const categoryResult: FullTickerV1CategoryAnalysisResult | undefined = d.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
  const link = CATEGORY_DETAIL_LINKS[categoryKey];
  return (
    <div className="bg-gray-900 p-3 sm:p-4 rounded-md shadow-sm">
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
        className="text-gray-300 markdown markdown-body"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.overallAnalysisDetails || 'No summary available.') }}
      />
    </div>
  );
}

function TickerAnalysisInfo({
  data,
  competitionData,
  exchange,
  ticker,
}: {
  data: TickerV1FastResponse;
  competitionData: CompetitionResponse | null;
  exchange: string;
  ticker: string;
}): JSX.Element {
  const d: TickerV1FastResponse = data;
  const managementTeamReport = d.managementTeamReports?.[0];

  return (
    <section id="summary-analysis" className="bg-gray-800 rounded-lg shadow-sm mb-8 sm:py-6" itemProp="abstract">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Summary Analysis</h2>
      <div className="space-y-4">
        <CategorySummaryCard categoryKey={TickerAnalysisCategory.BusinessAndMoat} d={d} />

        <CompetitionChartSection dataPromise={Promise.resolve(competitionData)} exchange={exchange} ticker={ticker} />

        {managementTeamReport && (
          <div className="bg-gray-900 p-3 sm:p-4 rounded-md shadow-sm">
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
              className="text-gray-300 markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(managementTeamReport.summary || 'No summary available.') }}
            />
          </div>
        )}

        <CategorySummaryCard categoryKey={TickerAnalysisCategory.FinancialStatementAnalysis} d={d} />
        <CategorySummaryCard categoryKey={TickerAnalysisCategory.PastPerformance} d={d} />
        <CategorySummaryCard categoryKey={TickerAnalysisCategory.FutureGrowth} d={d} />
        <CategorySummaryCard categoryKey={TickerAnalysisCategory.FairValue} d={d} />
      </div>
    </section>
  );
}

function TickerArticleFooter({ modifiedDate, formattedModifiedDate }: { modifiedDate: Date; formattedModifiedDate: string }): JSX.Element {
  return (
    <footer className="mt-8 pt-6 border-t border-color">
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
          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
            Stock Analysis
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
            Investment Report
          </span>
        </div>
      </div>
    </footer>
  );
}
/** PAGE */
export default async function TickerDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const fullRender = await getFullRenderOrRedirect(params);
  const tickerData = fullRender.ticker;
  if (!tickerData) {
    notFound();
  }

  const country = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  // Generate structured data
  const articleSchema = generateStockReportArticleSchema(tickerData);
  const breadcrumbSchema = generateStockReportBreadcrumbSchema(tickerData, country);

  const exchange: string = tickerData.exchange.toUpperCase();
  const ticker: string = tickerData.symbol.toUpperCase();

  const similarTickersForChild: SimilarTicker[] = fullRender.similar;

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
      <BreadcrumbsFromData data={tickerData} />

      <article itemScope itemType="https://schema.org/Article">
        {/* Hidden datePublished for schema - machine readable only */}
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        {/* Summary info - server rendered, no skeleton needed */}
        <TickerSummaryInfo data={tickerData} />

        <TickerChartsInfo
          data={tickerData}
          financialData={fullRender.financialInfo}
          quarterlyChartData={fullRender.quarterlyChart}
          priceHistoryData={fullRender.priceHistory}
        />

        {/* Analysis info - server rendered, no skeleton needed */}
        <TickerAnalysisInfo data={tickerData} competitionData={fullRender.competition} exchange={exchange} ticker={ticker} />

        <section className="mb-6">
          <SimilarTickers dataPromise={Promise.resolve(similarTickersForChild)} />
        </section>

        <TickerArticleFooter modifiedDate={modifiedDate} formattedModifiedDate={formattedModifiedDate} />
      </article>
    </PageWrapper>
  );
}
