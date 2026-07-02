import EtfSubPageActions from '@/app/etfs/[exchange]/[etf]/EtfSubPageActions';
import EtfCategoryReport from '@/components/etf-reportsv1/analysis/EtfCategoryReport';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import { fetchSimilarEtfsForEtf } from '@/utils/etf-similar-etfs-utils';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { generateEtfCategoryMetadata, generateEtfCategoryArticleJsonLd, generateEtfCategoryBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfCategoryReportTag } from '@/utils/etf-cache-utils';
import { EtfCategoryDataResponse } from '@/utils/etf-category-api-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const CATEGORY_KEY = EtfAnalysisCategory.CostEfficiencyAndTeam;
const CATEGORY_NAME = 'Cost, Efficiency & Team';
const CATEGORY_SLUG = 'cost-efficiency-team';
const DATA_SLUG = 'cost-efficiency-team-data';
const BADGE_CLASS = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300';

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
    description: `${CATEGORY_NAME} analysis for ${etfName} (${symbol}) ETF — expense ratio, fund size, liquidity, portfolio turnover, management quality, and Mor assessment.`,
    keywords: [`${etfName} expense ratio`, `${symbol} ETF cost`, `${symbol} management`, 'ETF cost analysis', 'ETF efficiency', 'KoalaGains'],
    createdTime,
    updatedTime,
  });
}

export default async function CostEfficiencyTeamPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  const { categoryResult, etf } = await fetchCategoryData(exchange, symbol);
  if (!etf) notFound();
  if (!categoryResult) notFound();

  const availableSlugsPromise = fetchEtfAvailableSlugs(exchange, symbol);
  const similarEtfsPromise = fetchSimilarEtfsForEtf(exchange, symbol);

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
        similarEtfsPromise={similarEtfsPromise}
      />
    </PageWrapper>
  );
}
