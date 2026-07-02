import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfSubPageActions from '@/app/etfs/[exchange]/[etf]/EtfSubPageActions';
import EtfHoldings from '@/components/etf-reportsv1/EtfHoldings';
import EtfRelatedSections, { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { etfHoldingsTag } from '@/utils/etf-cache-utils';
import { fetchEtfSimilarEtfs } from '@/utils/etf-similar-etfs-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { generateBreadcrumbJsonLdFromCrumbs, generateEtfHoldingsMetadata } from '@/utils/etf-metadata-generators';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchEtf(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url, { next: { tags: [etfHoldingsTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchHoldings(exchange: string, etf: string): Promise<EtfPortfolioHoldingsResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/portfolio-holdings`;
  try {
    const res = await fetch(url, { next: { tags: [etfHoldingsTag(etf, exchange)] } });
    if (!res.ok) return { holdings: null, updatedAt: null };
    return (await res.json()) as EtfPortfolioHoldingsResponse;
  } catch {
    return { holdings: null, updatedAt: null };
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  let etfName = symbol;
  let createdTime: string | undefined;
  let updatedTime: string | undefined;
  try {
    const data = await fetchEtf(exchange, symbol);
    if (data) {
      etfName = data.name ?? etfName;
      createdTime = data.createdAt?.toISOString();
      updatedTime = data.updatedAt?.toISOString();
    }
  } catch {
    /* keep generic */
  }

  return generateEtfHoldingsMetadata({ etfName, symbol, exchange, createdTime, updatedTime });
}

export default async function EtfHoldingsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  const [etfData, holdingsResponse, similarEtfs] = await Promise.all([
    fetchEtf(exchange, symbol),
    fetchHoldings(exchange, symbol),
    fetchEtfSimilarEtfs(exchange, symbol, [etfHoldingsTag(symbol, exchange)]),
  ]);
  if (!etfData) notFound();

  const availableSlugsPromise = fetchEtfAvailableSlugs(exchange, symbol);

  const { holdings, updatedAt: holdingsUpdatedAt } = holdingsResponse;

  const breadcrumbs = buildEtfReportSubpageBreadcrumbs({
    exchange,
    symbol,
    fundCategory: etfData.stockAnalyzerInfo?.category,
    sectionName: 'Holdings',
    sectionSlug: 'holdings',
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLdFromCrumbs(breadcrumbs);

  const totalHoldings = holdings?.holdings?.length ?? 0;

  const lastUpdatedDate = new Date(holdingsUpdatedAt ?? etfData.updatedAt ?? new Date());
  const formattedLastUpdated = lastUpdatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const footer = (
    <footer className="mt-8 pt-6 border-t border-color">
      <div className="text-sm text-muted-foreground">
        <span>Last updated by </span>
        <span itemProp="author" itemScope itemType="https://schema.org/Organization">
          <span itemProp="name">KoalaGains</span>
        </span>
        <span> on </span>
        <time dateTime={lastUpdatedDate.toISOString()} itemProp="dateModified">
          {formattedLastUpdated}
        </time>
      </div>
    </footer>
  );

  const relatedSections = (
    <>
      <Suspense fallback={null}>
        <EtfRelatedSections availableSlugsPromise={availableSlugsPromise} exchange={exchange} symbol={symbol} etfName={etfData.name} currentSlug="holdings" />
      </Suspense>
      {footer}
    </>
  );

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        hideHomeIcon={true}
        mobileBackOnly={true}
        rightButton={<EtfSubPageActions etfId={etfData.id} etfSymbol={etfData.symbol} etfName={etfData.name} />}
      />

      <article className="py-4" itemScope itemType="https://schema.org/Article">
        <meta itemProp="datePublished" content={lastUpdatedDate.toISOString()} />
        <header className="mb-4 mt-2">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-3xl" itemProp="headline">
            {etfData.name} ({symbol}) &mdash; Holdings
          </h1>
          <p className="text-sm text-muted mt-1" itemProp="description">
            Top holdings reported by this ETF.
          </p>
        </header>

        {totalHoldings > 0 ? (
          <EtfHoldings data={holdings} title="Top Holdings" relatedSections={relatedSections} />
        ) : (
          <section className="bg-surface rounded-lg shadow-sm px-3 py-6 sm:p-6 mt-6">
            <p className="text-sm text-muted">No holdings data available for this ETF.</p>
            {relatedSections}
          </section>
        )}

        {similarEtfs.length > 0 && <SimilarEtfs data={similarEtfs} linkSlug="holdings" />}
      </article>
    </PageWrapper>
  );
}
