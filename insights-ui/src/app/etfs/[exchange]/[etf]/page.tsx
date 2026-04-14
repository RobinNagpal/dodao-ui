import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfFinancialInfoResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/financial-info/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import { EtfScoresResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores/route';
import EtfAnalysisSections from '@/components/etf-reportsv1/analysis/EtfAnalysisSections';
import EtfRadarChart from '@/components/etf-reportsv1/analysis/EtfRadarChart';
import EtfFinancialInfo from '@/components/etf-reportsv1/EtfFinancialInfo';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCountryByExchange, SupportedCountries, formatExchangeWithCountry, toExchange } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
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

/** Helpers */
function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

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

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams: Readonly<{ exchange: string; etf: string }> = await params;
  const { exchange, etf } = { exchange: routeParams.exchange.toUpperCase(), etf: routeParams.etf.toUpperCase() };

  let etfName: string = etf;
  let summary: string = `ETF analysis and reports for ${etf}. Explore performance, risk, cost efficiency, and key metrics.`;
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

  const year = new Date().getFullYear();

  const shortDesc: string = truncateForMeta(summary);
  const canonicalUrl: string = `https://koalagains.com/etfs/${exchange}/${etf}`;
  const keywords: string[] = [
    etfName,
    `${etfName} analysis`,
    `${etf} ETF performance`,
    `${etf} ETF risk analysis`,
    `${etf} expense ratio`,
    `ETF analysis ${etfName}`,
    'ETF performance analysis',
    'ETF risk assessment',
    'ETF cost efficiency',
    'exchange-traded funds',
    'KoalaGains',
  ];

  return {
    title: `${etfName} (${etf}) ETF Analysis & Key Metrics (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${etfName} (${etf}) ETF Analysis & Key Metrics | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime ?? updatedTime,
      modifiedTime: updatedTime ?? createdTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${etf}) ETF Analysis & Key Metrics | KoalaGains`,
      description: shortDesc,
    },
    keywords,
  };
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

  return <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />;
}

function EtfSummaryInfo({ data }: { data: Promise<EtfFastResponse> }): JSX.Element {
  const d: EtfFastResponse = use(data);

  return (
    <section id="introduction" className="text-left mb-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl min-w-0" itemProp="headline">
          {d.name} ({d.symbol})
        </h1>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-gray-400">{formatExchangeWithCountry(d.exchange)}</span>
        </div>
      </div>

      {/* Inception Date */}
      {d.inception && (
        <div className="mb-4">
          <span className="text-sm text-gray-400">Inception Date: </span>
          <span className="text-sm font-medium">{d.inception}</span>
        </div>
      )}
    </section>
  );
}

function EtfFinancialInfoSection({
  data,
  financialInfoPromise,
  scoresPromise,
  analysisPromise,
}: {
  data: Promise<EtfFastResponse>;
  financialInfoPromise: Promise<EtfFinancialInfoResponse | null>;
  scoresPromise: Promise<EtfScoresResponse | null>;
  analysisPromise: Promise<EtfAnalysisResponse>;
}): JSX.Element {
  const d: EtfFastResponse = use(data);
  const financialData: EtfFinancialInfoResponse | null = use(financialInfoPromise);
  const scores: EtfScoresResponse | null = use(scoresPromise);
  const analysis: EtfAnalysisResponse = use(analysisPromise);

  return (
    <section className="mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
          {financialData ? <EtfFinancialInfo data={financialData} /> : <EtfFinancialInfoSkeleton />}
        </div>
        <div className="lg:w-1/2 flex items-center justify-center">
          <EtfRadarChart scores={scores} analysis={analysis} />
        </div>
      </div>
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

function EtfAnalysisSection({ analysisPromise }: { analysisPromise: Promise<EtfAnalysisResponse> }): JSX.Element | null {
  const analysis: EtfAnalysisResponse = use(analysisPromise);
  return <EtfAnalysisSections data={analysis} />;
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
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${etfData.name} (${etfData.symbol}) ETF Analysis`,
            description: `Performance, risk, and cost analysis for ${etfData.name} ETF on ${etfData.exchange}.`,
            author: { '@type': 'Organization', name: 'KoalaGains', url: 'https://koalagains.com' },
            publisher: { '@type': 'Organization', name: 'KoalaGains', url: 'https://koalagains.com' },
            datePublished: publishedDate.toISOString(),
            dateModified: modifiedDate.toISOString(),
            mainEntityOfPage: `https://koalagains.com/etfs/${exchange}/${etf}`,
          }),
        }}
      />

      {/* Breadcrumbs - server rendered, no skeleton needed */}
      <BreadcrumbsFromData data={etfInfo} />

      <article itemScope itemType="https://schema.org/Article">
        {/* Hidden datePublished for schema - machine readable only */}
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        {/* Summary info - server rendered, no skeleton needed */}
        <EtfSummaryInfo data={etfInfo} />

        <Suspense fallback={<EtfFinancialInfoSkeleton />}>
          <EtfFinancialInfoSection data={etfInfo} financialInfoPromise={financialInfoPromise} scoresPromise={scoresPromise} analysisPromise={analysisPromise} />
        </Suspense>

        <Suspense fallback={null}>
          <EtfAnalysisSection analysisPromise={analysisPromise} />
        </Suspense>

        <EtfArticleFooter modifiedDate={modifiedDate} formattedModifiedDate={formattedModifiedDate} />
      </article>
    </PageWrapper>
  );
}
