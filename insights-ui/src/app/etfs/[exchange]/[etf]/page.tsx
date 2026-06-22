import type { EtfFullRenderResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfActions from '@/app/etfs/[exchange]/[etf]/EtfActions';
import EtfFavouriteButton from '@/app/etfs/[exchange]/[etf]/EtfFavouriteButton';
import EtfNotesButton from '@/app/etfs/[exchange]/[etf]/EtfNotesButton';
import MobileEtfActionsMenu from '@/app/etfs/[exchange]/[etf]/MobileEtfActionsMenu';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import EtfAnalysisSections from '@/components/etf-reportsv1/analysis/EtfAnalysisSections';
import EtfRadarChart from '@/components/etf-reportsv1/analysis/EtfRadarChart';
import EtfCompetitionChartSection from '@/components/etf-reportsv1/EtfCompetitionChartSection';
import EtfChartTabs from '@/components/etf-reportsv1/EtfChartTabs';
import EtfFinancialInfo from '@/components/etf-reportsv1/EtfFinancialInfo';
import EtfKeyMetrics from '@/components/etf-reportsv1/EtfKeyMetrics';
import EtfHoldings from '@/components/etf-reportsv1/EtfHoldings';
import EtfMetadataBadges from '@/components/etf-reportsv1/EtfMetadataBadges';
import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import EtfKeyFactsFlags from '@/components/etf-reportsv1/EtfKeyFactsFlags';
import EtfApplicableInvestorGoals from '@/components/etf-reportsv1/EtfApplicableInvestorGoals';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import type { EtfFinancialInfoResponse } from '@/types/etf/etf-detail-response-types';
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
 * Render dynamically per request — ISR is off across the ETF tree, CloudFront
 * absorbs hot-path traffic at the edge.
 *
 * Streaming pattern: await only the lightweight `EtfFastResponse` for the page
 * shell (header, breadcrumbs, metadata badges, summary, financial-info card,
 * footer) and JSON-LD. Kick off the heavier `/full-render` fetch as a promise
 * and pass it into `<Suspense>`-wrapped children that call `use(promise)`. The
 * shell streams to the browser immediately while `/full-render` is still
 * in-flight — FCP/LCP land on the shell instead of on the slowest data slice.
 *
 * Per-slice streaming (each below-fold block on its own promise, like stocks'
 * 5 separate fetchers) would need per-slice API endpoints that don't exist
 * yet on the ETF side. Tracked as follow-up.
 */
export const dynamic = 'force-dynamic';

export type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchEtfFast(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}?allowNull=true`;
  const res = await fetch(url, { next: { tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchEtfFullRender(exchange: string, etf: string): Promise<EtfFullRenderResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/full-render`;
  const res = await fetch(url, { next: { tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) {
    throw new Error(`fetchEtfFullRender failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfFullRenderResponse;
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const exchange = routeParams.exchange.toUpperCase();
  const etf = routeParams.etf.toUpperCase();

  let etfName = etf;
  let createdTime: string | undefined;
  let updatedTime: string | undefined;

  try {
    const data = await fetchEtfFast(exchange, etf);
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

/* ----- Presentational helpers ----- */

function EtfFinancialInfoSkeleton(): JSX.Element {
  return (
    <section id="etf-financial-info" className="bg-surface rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
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

function ChartTabsSkeleton(): JSX.Element {
  // Matches the live chart tabs section's outer wrapper + chart-body height so
  // swapping the real component in causes zero layout shift.
  return (
    <section id="etf-chart-tabs" className="bg-surface rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-h-[44px]">
        <div className="h-6 w-32 rounded bg-surface-2 animate-pulse" />
      </div>
      <div className="h-64 sm:h-72 rounded bg-surface-2 animate-pulse" />
    </section>
  );
}

function BelowFoldSkeleton(): JSX.Element {
  // Reserves vertical space for the below-the-fold body (keyFactsTail, flags,
  // goals, holdings preview, analysis sections, competition, similar etfs) so
  // the page doesn't jump as the consolidated /full-render payload arrives.
  return (
    <div className="mb-8">
      <div className="bg-surface rounded-lg shadow-sm p-4 sm:p-6 mb-8 h-48 animate-pulse" />
      <div className="bg-surface rounded-lg shadow-sm p-4 sm:p-6 mb-8 h-64 animate-pulse" />
    </div>
  );
}

function buildEtfFinancialInfoResponse(etfData: EtfFastResponse): EtfFinancialInfoResponse | null {
  const fi = etfData.financialInfo;
  if (!fi) return null;
  return {
    symbol: etfData.symbol,
    aum: fi.aum,
    expenseRatio: fi.expenseRatio,
    pe: fi.pe,
    sharesOut: fi.sharesOut,
    dividendTtm: fi.dividendTtm,
    dividendYield: fi.dividendYield,
    payoutFrequency: fi.payoutFrequency,
    payoutRatio: fi.payoutRatio,
    volume: fi.volume,
    yearHigh: fi.yearHigh,
    yearLow: fi.yearLow,
    beta: fi.beta,
    holdings: fi.holdings,
  };
}

function buildBreadcrumbs(etfData: EtfFastResponse): BreadcrumbsOjbect[] {
  const exchange = etfData.exchange.toUpperCase();
  const etf = etfData.symbol.toUpperCase();
  const country = getCountryByExchange(toExchange(etfData.exchange));
  const { groupKey, groupName, fundCategoryName, fundCategorySlug } = getEtfFundCategoryHierarchy(etfData.stockAnalyzerInfo?.category);

  const rootCrumb: BreadcrumbsOjbect =
    country === SupportedCountries.US
      ? { name: 'US ETFs', href: `/etfs`, current: false }
      : country
      ? { name: `${country} ETFs`, href: `/etfs/countries/${country}`, current: false }
      : { name: 'ETFs', href: `/etfs`, current: false };
  const countryPrefix = country === SupportedCountries.US ? '/etfs' : country ? `/etfs/countries/${country}` : '/etfs';

  const breadcrumbs: BreadcrumbsOjbect[] = [rootCrumb];
  if (groupKey && groupName) {
    breadcrumbs.push({ name: groupName, href: `${countryPrefix}/groups/${groupKey}`, current: false });
    if (fundCategoryName && fundCategorySlug) {
      breadcrumbs.push({
        name: fundCategoryName,
        href: `${countryPrefix}/groups/${groupKey}/categories/${fundCategorySlug}`,
        current: false,
      });
    }
  }
  breadcrumbs.push({ name: etf, href: `/etfs/${exchange}/${etf}`, current: true });

  return breadcrumbs;
}

const HOLDINGS_PREVIEW_LIMIT = 10;

/* ----- Suspense'd children — each `use(promise)` to suspend on /full-render ----- */

function EtfAboutSection({ promise }: { promise: Promise<EtfFullRenderResponse> }): JSX.Element | null {
  const data = use(promise);
  const { head: keyFactsHead } = splitMarkdownAtParagraph(data.keyFacts?.keyFacts ?? null, 2);
  if (!keyFactsHead) return null;
  return (
    <div className="mb-2">
      <h3 className="text-lg font-semibold text-color mb-3">About This ETF</h3>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(keyFactsHead) }} />
    </div>
  );
}

function EtfRadarFromPromise({ promise }: { promise: Promise<EtfFullRenderResponse> }): JSX.Element {
  const data = use(promise);
  return <EtfRadarChart scores={data.scores} analysis={data.analysis} />;
}

function EtfChartTabsFromPromise({ promise, etfSymbol }: { promise: Promise<EtfFullRenderResponse>; etfSymbol: string }): JSX.Element {
  const data = use(promise);
  return <EtfChartTabs priceHistory={data.priceHistory} performanceMetrics={data.performanceMetrics} etfSymbol={etfSymbol} />;
}

function EtfBelowFoldBody({ promise, exchange, etf }: { promise: Promise<EtfFullRenderResponse>; exchange: string; etf: string }): JSX.Element {
  const data = use(promise);
  const { tail: keyFactsTail } = splitMarkdownAtParagraph(data.keyFacts?.keyFacts ?? null, 2);
  const competitionAfter = data.competition ? <EtfCompetitionChartSection data={data.competition} exchange={exchange} etf={etf} /> : null;

  return (
    <>
      {keyFactsTail && (
        <section id="key-facts-tail" className="mb-8">
          <h3 className="text-lg font-semibold text-color mb-3">ETF Summary</h3>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(keyFactsTail) }} />
        </section>
      )}

      <EtfKeyFactsFlags greenFlags={data.keyFacts?.greenFlags ?? []} redFlags={data.keyFacts?.redFlags ?? []} />

      <EtfApplicableInvestorGoals investorGoals={data.keyFacts?.applicableInvestorGoals} />

      <EtfHoldings data={data.portfolioHoldings.holdings} maxRows={HOLDINGS_PREVIEW_LIMIT} viewMoreHref={`/etfs/${exchange}/${etf}/holdings`} />

      <EtfAnalysisSections
        data={data.analysis}
        exchange={exchange}
        symbol={etf}
        afterPerformanceReturns={competitionAfter}
        futureOutlookTop={<EtfKeyMetrics metrics={data.keyMetrics} />}
      />

      <div className="mx-auto max-w-7xl">
        <section className="mb-6">
          <SimilarEtfs data={data.similarEtfs} />
        </section>
      </div>
    </>
  );
}

/** Page */
export default async function EtfDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const exchange = routeParams.exchange.toUpperCase();
  const etf = routeParams.etf.toUpperCase();

  // Await only the lightweight fetch so the shell can render + redirect logic
  // can fire. The heavier /full-render is kicked off in parallel and passed as
  // a promise to Suspense'd children below — server streams the shell HTML
  // first, then streams the body once /full-render resolves.
  const etfData = await fetchEtfFast(exchange, etf);
  if (!etfData) notFound();

  const fullRenderPromise = fetchEtfFullRender(exchange, etf);

  const safeDate = (dateValue: any): Date => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) return dateValue;
    if (typeof dateValue === 'string' && dateValue.trim()) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const publishedDate = safeDate(etfData.createdAt);
  const modifiedDate = safeDate(etfData.updatedAt || etfData.createdAt);

  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const breadcrumbs = buildBreadcrumbs(etfData);
  const financialInfo = buildEtfFinancialInfoResponse(etfData);

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
          __html: JSON.stringify(
            generateEtfDetailBreadcrumbJsonLd({
              etfName: etfData.name,
              symbol: etfData.symbol,
              exchange: etfData.exchange,
              ...getEtfFundCategoryHierarchy(etfData.stockAnalyzerInfo?.category),
            })
          ),
        }}
      />

      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        hideHomeIcon={true}
        mobileBackOnly={true}
        rightButton={
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <EtfFavouriteButton etfId={etfData.id} etfSymbol={etfData.symbol} etfName={etfData.name} />
              <EtfNotesButton etfId={etfData.id} etfSymbol={etfData.symbol} etfName={etfData.name} />
            </div>
            <div className="sm:hidden">
              <MobileEtfActionsMenu etfId={etfData.id} etfSymbol={etfData.symbol} etfName={etfData.name} />
            </div>
            <EtfActions etf={{ symbol: etf, exchange }} />
          </div>
        }
      />

      <article itemScope itemType="https://schema.org/Article">
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        <section id="introduction" className="text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl min-w-0" itemProp="headline">
              {etfData.name} ({etfData.symbol})
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-medium text-muted">{formatExchangeWithCountry(etfData.exchange)}</span>
            </div>
          </div>

          <EtfMetadataBadges
            exchange={etfData.exchange}
            assetClass={etfData.stockAnalyzerInfo?.assetClass}
            category={etfData.stockAnalyzerInfo?.category}
            issuer={etfData.stockAnalyzerInfo?.issuer}
            indexName={etfData.stockAnalyzerInfo?.indexName}
            className="mb-4"
          />

          {etfData.summary && etfData.summary.trim() && (
            <div className="mb-2" itemProp="description">
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(etfData.summary) }} />
            </div>
          )}

          <Suspense fallback={null}>
            <EtfAboutSection promise={fullRenderPromise} />
          </Suspense>
        </section>

        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
              {financialInfo ? <EtfFinancialInfo data={financialInfo} /> : <EtfFinancialInfoSkeleton />}
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <Suspense fallback={<RadarSkeleton />}>
                <EtfRadarFromPromise promise={fullRenderPromise} />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<ChartTabsSkeleton />}>
            <EtfChartTabsFromPromise promise={fullRenderPromise} etfSymbol={etfData.symbol} />
          </Suspense>
        </section>

        <Suspense fallback={<BelowFoldSkeleton />}>
          <EtfBelowFoldBody promise={fullRenderPromise} exchange={exchange} etf={etf} />
        </Suspense>

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
      </article>
    </PageWrapper>
  );
}
