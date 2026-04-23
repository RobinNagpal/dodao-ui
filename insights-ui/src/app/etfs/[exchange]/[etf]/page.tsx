import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfFinancialInfoResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/financial-info/route';
import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { PriceHistoryResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/price-history/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import { EtfScoresResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores/route';
import { SimilarEtf } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/similar-etfs/route';
import EtfActions from '@/app/etfs/[exchange]/[etf]/EtfActions';
import EtfAnalysisSections from '@/components/etf-reportsv1/analysis/EtfAnalysisSections';
import EtfRadarChart from '@/components/etf-reportsv1/analysis/EtfRadarChart';
import EtfFinancialInfo from '@/components/etf-reportsv1/EtfFinancialInfo';
import EtfHoldings from '@/components/etf-reportsv1/EtfHoldings';
import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import PriceChart from '@/components/ticker-reportsv1/PriceChart';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCountryByExchange, SupportedCountries, formatExchangeWithCountry, toExchange } from '@/utils/countryExchangeUtils';
import { generateEtfDetailMetadata, generateEtfDetailArticleJsonLd, generateEtfDetailBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
import { splitMarkdownAtParagraph } from '@/utils/etf-display-format-utils';
import { RadarSkeleton } from '@/app/stocks/[exchange]/[ticker]/RadarSkeleton';
import { parseMarkdown } from '@/util/parse-markdown';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense, use } from 'react';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

/** Cache revalidation constants */
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

/** Data fetchers */
async function fetchEtfByExchange(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) {
    // Server error (DB down, etc.) - throw to show error.tsx
    throw new Error(`fetchEtfByExchange failed (${res.status}): ${url}`);
  }
  const data: EtfFastResponse | null = (await res.json()) as EtfFastResponse | null;
  return data;
}

/** ETF fetch (exchange in route is always correct) */
async function getEtfOr404(params: RouteParams): Promise<EtfFastResponse> {
  const routeParams: Readonly<{ exchange: string; etf: string }> = await params;
  const { exchange, etf } = { exchange: routeParams.exchange.toUpperCase(), etf: routeParams.etf.toUpperCase() };

  const etfByExchange = await fetchEtfByExchange(exchange, etf);
  if (!etfByExchange) {
    notFound();
  }
  return etfByExchange;
}

/** Financial info fetcher */
async function fetchEtfFinancialInfo(exchange: string, etf: string): Promise<EtfFinancialInfoResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/financial-info`;

  try {
    const res: Response = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) {
      console.error(`fetchEtfFinancialInfo failed (${res.status}): ${url}`);
      return null;
    }

    const wrapper = (await res.json()) as { financialInfo: EtfFinancialInfoResponse | null };
    return wrapper.financialInfo;
  } catch (error) {
    console.error(`fetchEtfFinancialInfo error for ${etf}:`, error);
    return null;
  }
}

async function fetchEtfAnalysis(exchange: string, etf: string): Promise<EtfAnalysisResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/analysis`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) return { categories: [] };
    return (await res.json()) as EtfAnalysisResponse;
  } catch {
    return { categories: [] };
  }
}

async function fetchEtfScores(exchange: string, etf: string): Promise<EtfScoresResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/scores`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) return null;
    return (await res.json()) as EtfScoresResponse | null;
  } catch {
    return null;
  }
}

async function fetchSimilarEtfs(exchange: string, etf: string): Promise<SimilarEtf[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/similar-etfs`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) {
      console.error(`fetchSimilarEtfs failed (${res.status}): ${url}`);
      return [];
    }
    return (await res.json()) as SimilarEtf[];
  } catch (error) {
    console.error(`fetchSimilarEtfs error for ${etf}:`, error);
    return [];
  }
}

async function fetchEtfPortfolioHoldings(exchange: string, etf: string): Promise<EtfPortfolioHoldingsResponse['holdings']> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/portfolio-holdings`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) {
      console.error(`fetchEtfPortfolioHoldings failed (${res.status}): ${url}`);
      return null;
    }
    const wrapper = (await res.json()) as EtfPortfolioHoldingsResponse;
    return wrapper.holdings;
  } catch (error) {
    console.error(`fetchEtfPortfolioHoldings error for ${etf}:`, error);
    return null;
  }
}

async function fetchEtfPriceHistory(exchange: string, etf: string): Promise<PriceHistoryResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/price-history`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) {
      console.error(`fetchEtfPriceHistory failed (${res.status}): ${url}`);
      return null;
    }
    const wrapper = (await res.json()) as { priceHistory: PriceHistoryResponse | null };
    return wrapper.priceHistory;
  } catch (error) {
    console.error(`fetchEtfPriceHistory error for ${etf}:`, error);
    return null;
  }
}

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const exchange = routeParams.exchange.toUpperCase();
  const etf = routeParams.etf.toUpperCase();

  let etfName = etf;
  let createdTime: string | undefined;
  let updatedTime: string | undefined;

  try {
    const data = await fetchEtfByExchange(exchange, etf);
    if (data) {
      etfName = data.name ?? etfName;
      createdTime = data.createdAt?.toISOString();
      updatedTime = data.updatedAt?.toISOString() ?? createdTime;
    }
  } catch {
    /* keep generic */
  }

  return generateEtfDetailMetadata({ etfName, symbol: etf, exchange, createdTime, updatedTime });
}

/* =============================================================================
   SHARED SKELETONS (typed, minimal)
============================================================================= */
function EtfFinancialInfoSkeleton(): JSX.Element {
  return (
    <section id="etf-financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FinancialCard label="AUM" isLoading={true} />
        <FinancialCard label="Expense Ratio" isLoading={true} />
        <FinancialCard label="P/E Ratio" isLoading={true} />
        <FinancialCard label="Shares Outstanding" isLoading={true} />
        <FinancialCard label="Dividend TTM" isLoading={true} />
        <FinancialCard label="Dividend Yield" isLoading={true} />
        <FinancialCard label="Payout Frequency" isLoading={true} />
        <FinancialCard label="Payout Ratio" isLoading={true} />
        <FinancialCard label="Volume" isLoading={true} />
        <FinancialCard label="52 Week Range" isLoading={true} />
        <FinancialCard label="Beta" isLoading={true} />
        <FinancialCard label="Holdings" isLoading={true} />
      </div>
    </section>
  );
}

function PriceChartSkeleton(): JSX.Element {
  return (
    <section id="price-chart" className="bg-gray-900 rounded-lg shadow-sm px-3 py-4 sm:p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="h-6 w-36 rounded bg-gray-800 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-800 animate-pulse mt-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['1M', '6M', '1Y', '3Y', '5Y'].map((label) => (
            <div key={label} className="h-8 w-12 rounded-md bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72 rounded bg-gray-800 animate-pulse" />
    </section>
  );
}

/** Matches stock `ChartsInfoSkeleton`: financial table (left) + radar placeholder (right) + price chart below. */
function EtfChartsInfoSkeleton(): JSX.Element {
  return (
    <section className="mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
          <EtfFinancialInfoSkeleton />
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="w-full max-w-lg relative pb-4" style={{ minHeight: '400px', contain: 'layout size' }}>
            <div className="absolute top-20 right-0 flex space-x-2" style={{ zIndex: 10 }}>
              <div className="h-8 w-12 rounded bg-gray-800 animate-pulse" />
            </div>
            <RadarSkeleton />
          </div>
        </div>
      </div>
      <div style={{ minHeight: '320px' }}>
        <PriceChartSkeleton />
      </div>
    </section>
  );
}

/* =============================================================================
   CHILD SERVER COMPONENTS (strictly typed, minimal)
============================================================================= */

function BreadcrumbsFromData({ data }: { data: Promise<EtfFastResponse> }): JSX.Element {
  const d: EtfFastResponse = use(data);
  const exchange: string = d.exchange.toUpperCase();
  const etf: string = d.symbol.toUpperCase();
  const country: SupportedCountries = getCountryByExchange(toExchange(d.exchange));

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === SupportedCountries.US
      ? [
          { name: 'US ETFs', href: `/etfs`, current: false },
          { name: etf, href: `/etfs/${exchange}/${etf}`, current: true },
        ]
      : country
      ? [
          { name: `${country} ETFs`, href: `/etfs/countries/${country}`, current: false },
          { name: etf, href: `/etfs/${exchange}/${etf}`, current: true },
        ]
      : [
          { name: 'ETFs', href: `/etfs`, current: false },
          { name: etf, href: `/etfs/${exchange}/${etf}`, current: true },
        ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} rightButton={<EtfActions etf={{ symbol: etf, exchange }} />} />;
}

function EtfSummaryInfo({ data }: { data: Promise<EtfFastResponse> }): JSX.Element {
  const d: EtfFastResponse = use(data);
  const { head: indexStrategyHead } = splitMarkdownAtParagraph(d.indexStrategy, 2);

  return (
    <section id="introduction" className="text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl min-w-0" itemProp="headline">
          {d.name} ({d.symbol})
        </h1>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-gray-400">{formatExchangeWithCountry(d.exchange)}</span>
        </div>
      </div>

      {/* Summary (if available) */}
      {d.summary && d.summary.trim() && (
        <div className="mb-2" itemProp="description">
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(d.summary) }} />
        </div>
      )}

      {/* Index & Strategy — first 2 paragraphs. Remaining paragraphs render below the price chart. */}
      {indexStrategyHead && (
        <div className="mb-2">
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(indexStrategyHead) }} />
        </div>
      )}
    </section>
  );
}

function EtfIndexStrategyTail({ data }: { data: Promise<EtfFastResponse> }): JSX.Element | null {
  const d: EtfFastResponse = use(data);
  const { tail } = splitMarkdownAtParagraph(d.indexStrategy, 2);
  if (!tail) return null;
  return (
    <section id="index-strategy-tail" className="mb-8">
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(tail) }} />
    </section>
  );
}

function EtfFinancialInfoSection({
  data,
  financialInfoPromise,
  scoresPromise,
  analysisPromise,
  priceHistoryPromise,
}: {
  data: Promise<EtfFastResponse>;
  financialInfoPromise: Promise<EtfFinancialInfoResponse | null>;
  scoresPromise: Promise<EtfScoresResponse | null>;
  analysisPromise: Promise<EtfAnalysisResponse>;
  priceHistoryPromise: Promise<PriceHistoryResponse | null>;
}): JSX.Element {
  const d: EtfFastResponse = use(data);
  const financialData: EtfFinancialInfoResponse | null = use(financialInfoPromise);
  const scores: EtfScoresResponse | null = use(scoresPromise);
  const analysis: EtfAnalysisResponse = use(analysisPromise);
  const priceHistory: PriceHistoryResponse | null = use(priceHistoryPromise);

  return (
    <section className="mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
          {financialData ? <EtfFinancialInfo data={financialData} /> : <EtfFinancialInfoSkeleton />}
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <Suspense fallback={<RadarSkeleton />}>
            <EtfRadarChart scores={scores} analysis={analysis} />
          </Suspense>
        </div>
      </div>

      {/* Price Chart — rendered below the financial info / radar row. */}
      {priceHistory && <PriceChart data={priceHistory} />}
    </section>
  );
}

function EtfArticleFooter({ modifiedDate, formattedModifiedDate }: { modifiedDate: Date; formattedModifiedDate: string }): JSX.Element {
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
            ETF Analysis
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
            Investment Report
          </span>
        </div>
      </div>
    </footer>
  );
}

function EtfAnalysisSection({
  analysisPromise,
  exchange,
  symbol,
}: {
  analysisPromise: Promise<EtfAnalysisResponse>;
  exchange: string;
  symbol: string;
}): JSX.Element | null {
  const analysis: EtfAnalysisResponse = use(analysisPromise);
  return <EtfAnalysisSections data={analysis} exchange={exchange} symbol={symbol} />;
}

const HOLDINGS_PREVIEW_LIMIT = 10;

function EtfHoldingsSection({
  holdingsPromise,
  exchange,
  symbol,
}: {
  holdingsPromise: Promise<EtfPortfolioHoldingsResponse['holdings']>;
  exchange: string;
  symbol: string;
}): JSX.Element | null {
  const holdings = use(holdingsPromise);
  return <EtfHoldings data={holdings} maxRows={HOLDINGS_PREVIEW_LIMIT} viewMoreHref={`/etfs/${exchange}/${symbol}/holdings`} />;
}

/** PAGE */
export default async function EtfDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  // Main ETF data (promise for selective Suspense usage)
  const etfInfo = getEtfOr404(params);

  // Get ETF data for structured data generation
  const etfData = await etfInfo;

  // We only need params (not data) to kick off fetch promises up front
  const routeParams: Readonly<{ exchange: string; etf: string }> = await params;
  const exchange: string = routeParams.exchange.toUpperCase();
  const etf: string = routeParams.etf.toUpperCase();

  // Promises consumed by child components via `use()` under Suspense
  const financialInfoPromise = fetchEtfFinancialInfo(exchange, etf);
  const analysisPromise = fetchEtfAnalysis(exchange, etf);
  const scoresPromise = fetchEtfScores(exchange, etf);
  const priceHistoryPromise = fetchEtfPriceHistory(exchange, etf);
  const similarEtfsPromise = fetchSimilarEtfs(exchange, etf);
  const portfolioHoldingsPromise = fetchEtfPortfolioHoldings(exchange, etf);

  // Derive dates for semantic footer (based solely on etfData)
  const now = new Date();

  // Helper function to safely create valid Date objects
  const safeDate = (dateValue: any): Date => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }
    if (typeof dateValue === 'string' && dateValue.trim()) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return now;
  };

  const publishedDate = safeDate(etfData.createdAt);
  const modifiedDate = safeDate(etfData.updatedAt || etfData.createdAt);

  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateEtfDetailArticleJsonLd({
              etfName: etfData.name,
              symbol: etfData.symbol,
              exchange: etfData.exchange,
              publishedDate: publishedDate.toISOString(),
              modifiedDate: modifiedDate.toISOString(),
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateEtfDetailBreadcrumbJsonLd({ etfName: etfData.name, symbol: etfData.symbol, exchange: etfData.exchange })),
        }}
      />

      {/* Breadcrumbs - server rendered, no skeleton needed */}
      <BreadcrumbsFromData data={etfInfo} />

      <article itemScope itemType="https://schema.org/Article">
        {/* Hidden datePublished for schema - machine readable only */}
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        {/* Summary info - server rendered, no skeleton needed */}
        <EtfSummaryInfo data={etfInfo} />

        <Suspense fallback={<EtfChartsInfoSkeleton />}>
          <EtfFinancialInfoSection
            data={etfInfo}
            financialInfoPromise={financialInfoPromise}
            scoresPromise={scoresPromise}
            analysisPromise={analysisPromise}
            priceHistoryPromise={priceHistoryPromise}
          />
        </Suspense>

        {/* Remaining Index & Strategy paragraphs, rendered after the price chart. */}
        <EtfIndexStrategyTail data={etfInfo} />

        <Suspense fallback={null}>
          <EtfHoldingsSection holdingsPromise={portfolioHoldingsPromise} exchange={exchange} symbol={etf} />
        </Suspense>

        <Suspense fallback={null}>
          <EtfAnalysisSection analysisPromise={analysisPromise} exchange={exchange} symbol={etf} />
        </Suspense>

        <div className="mx-auto max-w-7xl">
          <section className="mb-6">
            <Suspense fallback={null}>
              <SimilarEtfs dataPromise={similarEtfsPromise} />
            </Suspense>
          </section>
        </div>

        <EtfArticleFooter modifiedDate={modifiedDate} formattedModifiedDate={formattedModifiedDate} />
      </article>
    </PageWrapper>
  );
}
