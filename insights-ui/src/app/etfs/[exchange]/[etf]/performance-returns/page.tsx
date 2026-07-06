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
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfCategoryReportTag } from '@/utils/etf-cache-utils';
import { EtfCategoryDataResponse } from '@/utils/etf-category-api-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const CATEGORY_KEY = EtfAnalysisCategory.PerformanceAndReturns;
const CATEGORY_NAME = 'Performance & Returns';
const CATEGORY_SLUG = 'performance-returns';
const DATA_SLUG = 'performance-returns-data';
const BADGE_CLASS = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchCategoryData(exchange: string, etf: string): Promise<EtfCategoryDataResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/${DATA_SLUG}`;
  try {
    const res = await fetch(url, { next: { tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
    if (!res.ok) return { categoryResult: null, etf: null };
    return (await res.json()) as EtfCategoryDataResponse;
  } catch {
    return { categoryResult: null, etf: null };
  }
}

async function fetchMorInfo(exchange: string, etf: string): Promise<EtfMorInfoOptionalWrapper | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/mor-info`;
  try {
    const res = await fetch(url, { next: { tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
    if (!res.ok) return null;
    return (await res.json()) as EtfMorInfoOptionalWrapper;
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
    fetchEtfSimilarEtfs(exchange, symbol, [etfCategoryReportTag(symbol, exchange, CATEGORY_KEY)]),
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
