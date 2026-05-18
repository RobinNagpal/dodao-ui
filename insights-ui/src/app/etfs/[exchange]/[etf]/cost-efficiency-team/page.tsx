import { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfCategoryReport from '@/components/etf-reportsv1/analysis/EtfCategoryReport';
import EtfSidebarShell from '@/components/etfs/EtfSidebarShell';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { ETF_EXCHANGE_TO_COUNTRY, isEtfExchange } from '@/utils/etfCountryExchangeUtils';
import { generateEtfCategoryMetadata, generateEtfCategoryArticleJsonLd, generateEtfCategoryBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { etfCategoryReportTag } from '@/utils/etf-cache-utils';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const CATEGORY_KEY = EtfAnalysisCategory.CostEfficiencyAndTeam;
const CATEGORY_NAME = 'Cost, Efficiency & Team';
const CATEGORY_SLUG = 'cost-efficiency-team';
const BADGE_CLASS = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchEtf(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchAnalysis(exchange: string, etf: string): Promise<EtfAnalysisResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/analysis`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfCategoryReportTag(etf, exchange, CATEGORY_KEY)] } });
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

  const sidebarCountry = isEtfExchange(exchange) ? ETF_EXCHANGE_TO_COUNTRY[exchange] : SupportedCountries.US;

  return (
    <EtfSidebarShell country={sidebarCountry} reportContext={{ exchange, etf: symbol, currentSection: CATEGORY_SLUG }}>
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
    </EtfSidebarShell>
  );
}
