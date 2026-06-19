import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfCategoryReport from '@/components/etf-reportsv1/analysis/EtfCategoryReport';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { generateEtfCategoryMetadata, generateEtfCategoryArticleJsonLd, generateEtfCategoryBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfCategoryReportTag } from '@/utils/etf-cache-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const CATEGORY_KEY = EtfAnalysisCategory.FuturePerformanceOutlook;
const CATEGORY_NAME = 'Future Performance Outlook';
const CATEGORY_SLUG = 'future-performance-outlook';
const BADGE_CLASS = 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchEtf(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url, { next: { tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchAnalysis(exchange: string, etf: string): Promise<EtfAnalysisResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/analysis`;
  try {
    const res = await fetch(url, { next: { tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
    if (!res.ok) return { categories: [] };
    return (await res.json()) as EtfAnalysisResponse;
  } catch {
    return { categories: [] };
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

  return generateEtfCategoryMetadata({
    etfName,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    description: `${CATEGORY_NAME} analysis for ${etfName} (${symbol}) ETF — valuation backdrop, macro regime fit, duration/credit setup, technical trend, flows/positioning, and key near-term catalysts.`,
    keywords: [`${etfName} outlook`, `${symbol} ETF outlook`, `${symbol} macro regime`, 'ETF future outlook', 'ETF positioning', 'KoalaGains'],
    createdTime,
    updatedTime,
  });
}

export default async function FuturePerformanceOutlookPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  const [etfData, analysisData, availableSlugs] = await Promise.all([
    fetchEtf(exchange, symbol),
    fetchAnalysis(exchange, symbol),
    fetchEtfAvailableSlugs(exchange, symbol),
  ]);
  if (!etfData) notFound();

  const categoryResult = analysisData.categories.find((c) => c.categoryKey === CATEGORY_KEY);
  if (!categoryResult) notFound();

  const now = new Date().toISOString();
  const publishedDate = etfData.createdAt?.toISOString?.() || now;
  const modifiedDate = etfData.updatedAt?.toISOString?.() || now;

  const articleSchema = generateEtfCategoryArticleJsonLd({
    etfName: etfData.name,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    publishedDate,
    modifiedDate,
  });
  const breadcrumbSchema = generateEtfCategoryBreadcrumbJsonLd({
    etfName: etfData.name,
    symbol,
    exchange,
    categoryName: CATEGORY_NAME,
    categorySlug: CATEGORY_SLUG,
    ...getEtfFundCategoryHierarchy(etfData.stockAnalyzerInfo?.category),
  });

  const breadcrumbs = buildEtfReportSubpageBreadcrumbs({
    exchange,
    symbol,
    fundCategory: etfData.stockAnalyzerInfo?.category,
    sectionName: CATEGORY_NAME,
    sectionSlug: CATEGORY_SLUG,
  });

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([articleSchema, breadcrumbSchema]) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <EtfCategoryReport
        etfName={etfData.name}
        symbol={symbol}
        exchange={exchange}
        categoryResult={categoryResult}
        analysisTitle={`${etfData.name} (${symbol}) ${CATEGORY_NAME} Analysis`}
        categoryBadgeText={CATEGORY_NAME}
        categoryBadgeClassName={BADGE_CLASS}
        updatedAt={modifiedDate}
        assetClass={etfData.stockAnalyzerInfo?.assetClass}
        fundCategory={etfData.stockAnalyzerInfo?.category}
        issuer={etfData.stockAnalyzerInfo?.issuer}
        indexName={etfData.stockAnalyzerInfo?.indexName}
        currentSlug={CATEGORY_SLUG}
        availableSlugs={availableSlugs}
      />
    </PageWrapper>
  );
}
