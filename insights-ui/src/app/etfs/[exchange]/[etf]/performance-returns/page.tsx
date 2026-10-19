import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import EtfSubPageActions from '@/app/etfs/[exchange]/[etf]/EtfSubPageActions';
import EtfCategoryReport from '@/components/etf-reportsv1/analysis/EtfCategoryReport';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import { fetchEtfSimilarEtfs } from '@/utils/etf-similar-etfs-utils';
import EtfReturnsTable from '@/components/etf-reportsv1/EtfReturnsTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { EtfMorReturnsRow } from '@/types/prismaTypes';
import { generateEtfCategoryMetadata, generateEtfCategoryArticleJsonLd, generateEtfCategoryBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';
import { EtfCategoryDataResponse, fetchEtfCategoryByExchange } from '@/utils/etf-category-api-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ssrRequestData } from '@/utils/ssr-data-cache';
import { cache } from 'react';
import { getEtfMorInfoData } from '@/utils/etf-page-data';

const CATEGORY_KEY = EtfAnalysisCategory.PerformanceAndReturns;
const CATEGORY_NAME = 'Performance & Returns';
const CATEGORY_SLUG = 'performance-returns';
const BADGE_CLASS = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

/** In-process load of the `/performance-returns-data` route's data (no HTTP self-fetch); fresh per request, deduped per render. */
const fetchCategoryData = cache(async (exchange: string, etf: string): Promise<EtfCategoryDataResponse> => {
  try {
    return await ssrRequestData(() => fetchEtfCategoryByExchange(KoalaGainsSpaceId, etf, exchange, CATEGORY_KEY));
  } catch {
    return { categoryResult: null, etf: null };
  }
});

/** In-process load of the `/mor-info` route's data; `null` on any failure (the route 404s for an unknown ETF). */
async function fetchMorInfo(exchange: string, etf: string): Promise<EtfMorInfoOptionalWrapper | null> {
  try {
    return await ssrRequestData(() => getEtfMorInfoData(KoalaGainsSpaceId, exchange, etf));
  } catch {
    return null;
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
    const { etf } = await fetchCategoryData(exchange, symbol);
    if (etf) {
      etfName = etf.name ?? etfName;
      createdTime = etf.createdAt;
      updatedTime = etf.updatedAt;
    }
  } catch {
    /* keep generic */
  }

  return generateEtfCategoryMetadata({
    etfName,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    description: `${CATEGORY_NAME} analysis for ${etfName} (${symbol}) ETF — long-term CAGR, short-term returns, consistency, benchmark comparison, and price momentum.`,
    keywords: [`${etfName} performance`, `${symbol} ETF returns`, `${symbol} CAGR`, 'ETF performance analysis', 'ETF returns', 'KoalaGains'],
    createdTime,
    updatedTime,
  });
}

export default async function PerformanceReturnsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  const [{ categoryResult, etf }, morInfo, similarEtfs] = await Promise.all([
    fetchCategoryData(exchange, symbol),
    fetchMorInfo(exchange, symbol),
    fetchEtfSimilarEtfs(exchange, symbol),
  ]);
  if (!etf) notFound();
  if (!categoryResult) notFound();

  const availableSlugsPromise = fetchEtfAvailableSlugs(exchange, symbol);

  const returnsAnnual = (morInfo?.morAnalyzerInfo?.returnsAnnual ?? null) as EtfMorReturnsRow[] | null;
  const returnsTable = returnsAnnual ? <EtfReturnsTable rows={returnsAnnual} title="Annual Returns" /> : null;

  const now = new Date().toISOString();
  const publishedDate = etf.createdAt || now;
  const modifiedDate = etf.updatedAt || now;

  const articleSchema = generateEtfCategoryArticleJsonLd({
    etfName: etf.name,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    publishedDate,
    modifiedDate,
  });
  const breadcrumbSchema = generateEtfCategoryBreadcrumbJsonLd({
    etfName: etf.name,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    ...getEtfFundCategoryHierarchy(etf.stockAnalyzerInfo?.category),
  });

  const breadcrumbs = buildEtfReportSubpageBreadcrumbs({
    exchange,
    symbol,
    fundCategory: etf.stockAnalyzerInfo?.category,
    sectionName: CATEGORY_NAME,
    sectionSlug: CATEGORY_SLUG,
  });

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([articleSchema, breadcrumbSchema]) }} />
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        hideHomeIcon={true}
        mobileBackOnly={true}
        rightButton={<EtfSubPageActions etfId={etf.id} etfSymbol={etf.symbol} etfName={etf.name} />}
      />
      <EtfCategoryReport
        etfName={etf.name}
        symbol={symbol}
        exchange={exchange}
        categoryResult={categoryResult}
        analysisTitle={`${etf.name} (${symbol}) ${CATEGORY_NAME} Analysis`}
        categoryBadgeText={CATEGORY_NAME}
        categoryBadgeClassName={BADGE_CLASS}
        updatedAt={modifiedDate}
        assetClass={etf.stockAnalyzerInfo?.assetClass}
        fundCategory={etf.stockAnalyzerInfo?.category}
        issuer={etf.stockAnalyzerInfo?.issuer}
        indexName={etf.stockAnalyzerInfo?.indexName}
        currentSlug={CATEGORY_SLUG}
        availableSlugsPromise={availableSlugsPromise}
        similarEtfs={similarEtfs}
        afterSummaryContent={returnsTable}
      />
    </PageWrapper>
  );
}
