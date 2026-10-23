import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfSubPageActions from '@/app/etfs/[exchange]/[etf]/EtfSubPageActions';
import EtfHoldings from '@/components/etf-reportsv1/EtfHoldings';
import EtfRelatedSections, { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { fetchEtfSimilarEtfs } from '@/utils/etf-similar-etfs-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { generateBreadcrumbJsonLdFromCrumbs, generateEtfHoldingsMetadata } from '@/utils/etf-metadata-generators';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { redirectAlternativeEtfListing } from '@/utils/etf-alternative-listing-utils';
import { cache, Suspense } from 'react';
import { getEtfFastData, getEtfPortfolioHoldingsData } from '@/utils/etf-page-data';
import { ssrRequestData } from '@/utils/ssr-data-cache';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

/**
 * In-process loads of the ETF + `/portfolio-holdings` routes' data (no HTTP self-fetch); fresh per
 * request, with React `cache()` deduping the `generateMetadata` + page calls.
 */
const fetchEtf = cache(async (exchange: string, etf: string): Promise<EtfFastResponse | null> => {
  try {
    return await ssrRequestData(() => getEtfFastData(KoalaGainsSpaceId, exchange, etf, true));
  } catch {
    return null;
  }
});

async function fetchHoldings(exchange: string, etf: string): Promise<EtfPortfolioHoldingsResponse> {
  try {
    return await ssrRequestData(() => getEtfPortfolioHoldingsData(KoalaGainsSpaceId, exchange, etf));
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
    fetchEtfSimilarEtfs(exchange, symbol),
  ]);
  if (!etfData) {
    await redirectAlternativeEtfListing(exchange, symbol, 'holdings');
    notFound();
  }

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
