import { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import StockActions from '@/app/stocks/[exchange]/[ticker]/StockActions';
import TickerComparisonButton from '@/app/stocks/[exchange]/[ticker]/TickerComparisonButton';
import Competition from '@/components/ticker-reportsv1/Competition';
import FinancialInfo, { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SpiderGraphForTicker, SpiderGraphPie } from '@/types/public-equity/ticker-report-types';
import { CATEGORY_MAPPINGS, CompetitionResponse, EvaluationResult, INVESTOR_MAPPINGS, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { parseMarkdown } from '@/util/parse-markdown';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { getCountryByExchange } from '@/utils/countryUtils';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { FullTickerV1CategoryAnalysisResult, SimilarTicker, TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense, use } from 'react';
import { FloatingNavFromData } from './FloatingTickerNav';
import { TickerRadarChart } from './TickerRadarChart';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** For FULL_SSG prebuilds */
type TickerListItem = Readonly<{ symbol: string; exchange: string }>;
const TICKERS_INDEX_URL: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1` as const;

/** Build nothing by default; prebuild all when FULL_SSG=1 */
export async function generateStaticParams(): Promise<{ exchange: string; ticker: string }[]> {
  if (process.env.FULL_SSG !== '1') return [];
  const res: Response = await fetch(`${TICKERS_INDEX_URL}`, {
    next: { revalidate: 60 * 60, tags: ['ticker-list'] },
  });
  if (!res.ok) return [];
  const list: ReadonlyArray<TickerListItem> = (await res.json()) as ReadonlyArray<TickerListItem>;
  return list.map((t: TickerListItem) => ({
    exchange: t.exchange.toUpperCase(),
    ticker: t.symbol.toUpperCase(),
  }));
}

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Data fetchers */
async function fetchTickerByExchange(exchange: string, ticker: string): Promise<TickerV1FastResponse> {
  const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}`;
  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) throw new Error(`fetchTickerByExchange failed (${res.status}): ${url}`);
  const data: TickerV1FastResponse | null = (await res.json()) as TickerV1FastResponse | null;
  if (!data) throw new Error('fetchTickerByExchange returned empty payload');
  return data;
}

async function fetchTickerAnyExchange(ticker: string): Promise<TickerV1FastResponse> {
  const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTickerAnyExchange failed (${res.status}): ${url}`);
  const data: TickerV1FastResponse | null = (await res.json()) as TickerV1FastResponse | null;
  if (!data) throw new Error('fetchTickerAnyExchange returned empty payload');
  return data;
}

/** Exchange-aware fetch with uncached fallback + canonical redirect */
async function getTickerOrRedirect(params: RouteParams): Promise<TickerV1FastResponse> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };
  try {
    return await fetchTickerByExchange(exchange, ticker);
  } catch {
    noStore();
    let any: TickerV1FastResponse;
    try {
      any = await fetchTickerAnyExchange(ticker);
    } catch {
      notFound();
    }
    const canonicalExchange: string = any.exchange.toUpperCase();
    if (canonicalExchange !== exchange) {
      permanentRedirect(`/stocks/${canonicalExchange}/${any.symbol.toUpperCase()}`);
    }
    return any;
  }
}

/** Competition + Similar fetchers (promise-based for Suspense) */
export type VsCompetition = Readonly<{ overallAnalysisDetails: string }>;

async function fetchCompetition(exchange: string, ticker: string): Promise<CompetitionResponse> {
  const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/competition`;

  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) throw new Error(`fetchCompetition failed (${res.status}): ${url}`);

  const json: CompetitionResponse = (await res.json()) as CompetitionResponse;

  return json;
}

async function fetchSimilar(exchange: string, ticker: string): Promise<SimilarTicker[]> {
  const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/similar`;

  const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) throw new Error(`fetchSimilar failed (${res.status}): ${url}`);

  const arr = (await res.json()) as SimilarTicker[];
  return arr;
}

async function fetchFinancialInfo(exchange: string, ticker: string): Promise<FinancialInfoResponse | null> {
  const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}/financial-info`;

  try {
    const res: Response = await fetch(url, { next: { tags: [tickerAndExchangeTag(ticker, exchange)] } });
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

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let summary: string = `Financial analysis and reports for ${ticker}. Explore key metrics, insights, and evaluations.`;
  let metaDescription: string = '';

  try {
    const data: TickerV1FastResponse = await fetchTickerByExchange(exchange, ticker);
    companyName = data?.name ?? companyName;
    summary = data?.summary ?? summary;
    metaDescription = data?.metaDescription ?? '';
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

type BarSkeletonProps = Readonly<{ widthClass?: string }>;
function BarSkeleton({ widthClass = 'w-full' }: BarSkeletonProps): JSX.Element {
  return <div className={`h-6 ${widthClass} rounded bg-gray-800 animate-pulse mb-4`} />;
}

function SectionCardSkeleton(): JSX.Element {
  return <div className="h-24 rounded-md bg-gray-800 animate-pulse" />;
}

function SummaryInfoSkeleton(): JSX.Element {
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <div className="h-6 w-56 rounded bg-gray-800 animate-pulse mb-4" />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
    </div>
  );
}

function DetailsInfoSkeleton(): JSX.Element {
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <div className="h-6 w-56 rounded bg-gray-800 animate-pulse mb-4" />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
    </div>
  );
}

function CompetitionSkeleton(): JSX.Element {
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <div className="h-6 w-56 rounded bg-gray-800 animate-pulse mb-4" />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
      <SectionCardSkeleton />
    </div>
  );
}

function SimilarSkeleton(): JSX.Element {
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <div className="h-6 w-64 rounded bg-gray-800 animate-pulse mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCardSkeleton />
        <SectionCardSkeleton />
        <SectionCardSkeleton />
      </div>
    </div>
  );
}

function FinancialInfoSkeleton(): JSX.Element {
  return (
    <section id="financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        <FinancialCard label="Current Price" isLoading={true} />
        <FinancialCard label="52 Week Range" isLoading={true} />
        <FinancialCard label="Market Cap" isLoading={true} />
        <FinancialCard label="EPS (Diluted TTM)" isLoading={true} />
        <FinancialCard label="P/E Ratio" isLoading={true} />
        <FinancialCard label="Net Profit Margin" isLoading={true} />
        <FinancialCard label="Avg Volume (3M)" isLoading={true} />
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

function BreadcrumbsFromData({ data }: { data: Promise<TickerV1FastResponse> }): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  const exchange: string = d.exchange.toUpperCase();
  const ticker: string = d.symbol.toUpperCase();
  const country: string | null = getCountryByExchange(d.exchange);
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
        <StockActions tickerSymbol={d.symbol}>
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

function TickerSummaryInfo({
  data,
  financialInfoPromise,
}: {
  data: Promise<TickerV1FastResponse>;
  financialInfoPromise: Promise<FinancialInfoResponse | null>;
}): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  const financialData: FinancialInfoResponse | null = use(financialInfoPromise);

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
    <>
      <section className="text-left mb-6">
        {/* About Report - displayed above the main heading */}
        {d.aboutReport && <div className="text-gray-400 markdown-body text-sm pb-4" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.aboutReport) }} />}

        <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl mb-6">
          {d.name} ({d.symbol}){' '}
          {d.websiteUrl && (
            <a href={d.websiteUrl} target="_blank" rel="noopener noreferrer" title={"website of the company's homepage"}>
              <ArrowTopRightOnSquareIcon className="size-8 cursor-pointer inline link-color" />
            </a>
          )}
        </h1>

        <div className="flex flex-col gap-x-5 gap-y-6 lg:flex-row">
          {/* Left: summary */}
          <div className="lg:w/full lg:max-w-2xl lg:flex-auto min-h-[240px]">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.summary ?? 'Not yet populated') }} />
          </div>

          {/* Right: Radar (Suspense retained only here) */}
          <div className="lg:flex lg:flex-auto lg:justify-center relative lg:mb-16">
            <div className="lg:absolute lg:top-4 lg:left-0 lg:flex lg:items-center lg:w-full lg:h-full">
              <div className="w-full max-w-lg mx-auto relative">
                <div className="absolute top-20 right-0 flex space-x-2">
                  <div className="text-2xl font-bold -z-10" style={{ color: 'var(--primary-color, blue)' }}>
                    {score.toFixed(0)}%
                  </div>
                  <SpiderChartFlyoutMenu />
                </div>
                <Suspense fallback={<RadarSkeleton />}>
                  <TickerRadarChart data={spiderGraph} scorePercentage={score} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information - after radar chart */}
        {financialData && (
          <Suspense fallback={<FinancialInfoSkeleton />}>
            <FinancialInfo data={financialData} />
          </Suspense>
        )}
      </section>
      <section id="summary-analysis" className="bg-gray-800 rounded-lg shadow-sm mb-8 sm:p-y6">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Summary Analysis</h2>
        <div className="space-y-4">
          {Object.values(TickerAnalysisCategory).map((categoryKey: TickerAnalysisCategory) => {
            const categoryResult: FullTickerV1CategoryAnalysisResult | undefined = d.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
            return (
              <div key={categoryKey} className="bg-gray-900 p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{CATEGORY_MAPPINGS[categoryKey]}</h3>
                  {categoryResult && (
                    <div
                      className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                    >
                      {categoryResult.factorResults?.filter((fr) => fr.result === EvaluationResult.Pass).length || 0}/5
                    </div>
                  )}
                </div>
                <div
                  className="text-gray-300 markdown markdown-body"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.overallAnalysisDetails || 'No summary available.') }}
                />
              </div>
            );
          })}
        </div>
      </section>
      {d.futureRisks.length > 0 && (
        <section id="future-risks" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Future Risks</h2>
          <ul className="space-y-3">
            {d.futureRisks.map((futureRisk) => (
              <li key={futureRisk.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                <div className="flex flex-col gap-y-2">{futureRisk.summary}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.investorAnalysisResults.length > 0 && (
        <section id="investor-summaries" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Investor Reports Summaries</h2>
          <div className="space-y-4">
            {d.investorAnalysisResults.map((result) => (
              <div key={result.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(result.summary) }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function TickerDetailsInfo({ data }: { data: Promise<TickerV1FastResponse> }): JSX.Element {
  const d: TickerV1FastResponse = use(data);

  return (
    <>
      <section id="detailed-analysis" className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>
        {Object.values(TickerAnalysisCategory).map((categoryKey: TickerAnalysisCategory) => {
          const categoryResult: FullTickerV1CategoryAnalysisResult | undefined = d.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
          if (!categoryResult) return null;

          return (
            <div key={`detail-${categoryKey}`} id={`detailed-${categoryKey}`} className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
                <h3 className="text-xl font-bold">{CATEGORY_MAPPINGS[categoryKey]}</h3>
                <div
                  className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                >
                  {categoryResult.factorResults?.filter((fr) => fr.result === EvaluationResult.Pass).length || 0}/5
                </div>
              </div>

              {categoryResult.summary && (
                <div className="mb-4">
                  <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.summary) }} />
                </div>
              )}

              {categoryResult.factorResults?.length ? (
                <ul className="space-y-3">
                  {categoryResult.factorResults.map((factor) => (
                    <li key={factor.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {factor.result === EvaluationResult.Pass ? (
                              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                            )}
                            <h4 className="font-semibold">{factor.analysisCategoryFactor?.factorAnalysisTitle}</h4>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              factor.result === EvaluationResult.Pass ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {factor.result}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{factor.oneLineExplanation}</p>
                        <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(factor.detailedExplanation) }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </section>

      {d.futureRisks.length > 0 && (
        <section id="detailed-future-risks" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Detailed Future Risks</h2>
          <div className="space-y-3">
            {d.futureRisks.map((futureRisk) => (
              <div key={futureRisk.id} className="bg-gray-800 p-4 rounded-md">
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(futureRisk.detailedAnalysis) }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
/** PAGE */
export default async function TickerDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  // Main ticker data (promise for selective Suspense usage)
  const tickerInfo = getTickerOrRedirect(params);

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
  const competitionPromise = retryWithCanonical(fetchCompetition);
  const similarPromise = retryWithCanonical(fetchSimilar);
  const financialInfoPromise = retryWithCanonical(fetchFinancialInfo);

  return (
    <PageWrapper>
      {/* Breadcrumbs can stream independently */}
      <Suspense fallback={<BarSkeleton widthClass="w-64" />}>
        <BreadcrumbsFromData data={tickerInfo} />
      </Suspense>

      <Suspense fallback={<SummaryInfoSkeleton />}>
        <TickerSummaryInfo data={tickerInfo} financialInfoPromise={financialInfoPromise} />
      </Suspense>

      <div className="mx-auto max-w-7xl py-2">
        <section className="mb-8">
          <Suspense fallback={<CompetitionSkeleton />}>
            <Competition exchange={exchange} ticker={ticker} dataPromise={competitionPromise} />
          </Suspense>
        </section>

        <section className="mb-8">
          <Suspense fallback={<SimilarSkeleton />}>
            <SimilarTickers dataPromise={similarPromise} />
          </Suspense>
        </section>
      </div>
      <Suspense fallback={<DetailsInfoSkeleton />}>
        <TickerDetailsInfo data={tickerInfo} />
      </Suspense>

      {/* Floating nav after sections are known */}
      <Suspense fallback={null}>
        <FloatingNavFromData data={tickerInfo} />
      </Suspense>
    </PageWrapper>
  );
}
