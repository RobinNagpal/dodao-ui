import type { EtfFullRenderResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfActions from '@/app/etfs/[exchange]/[etf]/EtfActions';
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
import { EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
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
import { Suspense, type ReactNode } from 'react';

/**
 * Static-by-default with on-demand invalidation. The 8 separate fetches the
 * page used to make are now consolidated into a single tagged fetch against
 * `/etfs-v1/exchange/<E>/<T>/full-render`, so one rebuild = 1 HTML + 1 Data
 * Cache write (down from 9 writes). The umbrella tag `etfAndExchangeTag` is
 * read by THIS page only — subpages have their own narrow tags and don't see
 * umbrella invalidations.
 */
export const dynamic = 'force-dynamic';

export type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchEtfFullRender(exchange: string, etf: string): Promise<EtfFullRenderResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/full-render`;
  const res = await fetch(url, { next: { tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) {
    throw new Error(`fetchEtfFullRender failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfFullRenderResponse;
}

/** Metadata uses only the basic ETF fields — keep a tiny standalone fetch for it. */
async function fetchEtfForMetadata(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}?allowNull=true`;
  const res = await fetch(url, { next: { tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const exchange = routeParams.exchange.toUpperCase();
  const etf = routeParams.etf.toUpperCase();

  let etfName = etf;
  let createdTime: string | undefined;
  let updatedTime: string | undefined;

  try {
    const data = await fetchEtfForMetadata(exchange, etf);
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

/** Page */
export default async function EtfDetailsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const exchange = routeParams.exchange.toUpperCase();
  const etf = routeParams.etf.toUpperCase();

  const data = await fetchEtfFullRender(exchange, etf);
  const etfData = data.etf;
  if (!etfData) notFound();

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
  const { head: keyFactsHead, tail: keyFactsTail } = splitMarkdownAtParagraph(data.keyFacts?.keyFacts ?? null, 2);
  const keyFactsGreenFlags: EtfKeyFactsFlagAssessment[] = data.keyFacts?.greenFlags ?? [];
  const keyFactsRedFlags: EtfKeyFactsFlagAssessment[] = data.keyFacts?.redFlags ?? [];

  const competitionAfter: ReactNode = data.competition ? <EtfCompetitionChartSection data={data.competition} exchange={exchange} etf={etf} /> : null;

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

      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} rightButton={<EtfActions etf={{ symbol: etf, exchange }} />} />

      <article itemScope itemType="https://schema.org/Article">
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        <section id="introduction" className="text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl min-w-0" itemProp="headline">
              {etfData.name} ({etfData.symbol})
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-medium text-gray-400">{formatExchangeWithCountry(etfData.exchange)}</span>
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

          {keyFactsHead && (
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-color mb-3">About This ETF</h3>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(keyFactsHead) }} />
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="lg:w-1/2" style={{ minHeight: '340px' }}>
              {data.financialInfo ? <EtfFinancialInfo data={data.financialInfo} /> : <EtfFinancialInfoSkeleton />}
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <Suspense fallback={<RadarSkeleton />}>
                <EtfRadarChart scores={data.scores} analysis={data.analysis} />
              </Suspense>
            </div>
          </div>

          <EtfKeyMetrics metrics={data.keyMetrics} />

          <EtfChartTabs priceHistory={data.priceHistory} performanceMetrics={data.performanceMetrics} etfSymbol={etfData.symbol} />
        </section>

        {keyFactsTail && (
          <section id="key-facts-tail" className="mb-8">
            <h3 className="text-lg font-semibold text-color mb-3">ETF Summary</h3>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(keyFactsTail) }} />
          </section>
        )}

        <EtfKeyFactsFlags greenFlags={keyFactsGreenFlags} redFlags={keyFactsRedFlags} />

        <EtfApplicableInvestorGoals investorGoals={data.keyFacts?.applicableInvestorGoals} />

        <EtfHoldings data={data.portfolioHoldings.holdings} maxRows={HOLDINGS_PREVIEW_LIMIT} viewMoreHref={`/etfs/${exchange}/${etf}/holdings`} />

        <EtfAnalysisSections data={data.analysis} exchange={exchange} symbol={etf} afterPerformanceReturns={competitionAfter} />

        <div className="mx-auto max-w-7xl">
          <section className="mb-6">
            <SimilarEtfs data={data.similarEtfs} />
          </section>
        </div>

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
