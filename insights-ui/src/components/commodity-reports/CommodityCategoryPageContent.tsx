import CommodityCategoryReport from '@/components/commodity-reports/CommodityCategoryReport';
import CommoditySimilarSection from '@/components/commodity-reports/CommoditySimilarSection';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES, COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import {
  generateCommodityCategoryArticleJsonLd,
  generateCommodityCategoryBreadcrumbJsonLd,
  generateCommodityCategoryMetadata,
} from '@/utils/commodity-analysis-reports/commodity-metadata-generators';
import { fetchCommodityReport } from '@/utils/commodity-analysis-reports/commodity-report-fetchers';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

/** Per-category badge colours, matching the ETF category badge palette. */
const CATEGORY_BADGE_CLASS: Record<CommodityAnalysisCategory, string> = {
  [CommodityAnalysisCategory.SupplyAndDemand]: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300',
  [CommodityAnalysisCategory.PriceAndValue]: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300',
  [CommodityAnalysisCategory.VolatilityAndRisk]: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300',
  [CommodityAnalysisCategory.FutureOutlook]: 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-300',
};

export async function buildCommodityCategoryMetadata(slug: string, categoryKey: CommodityAnalysisCategory): Promise<Metadata> {
  let name = slug;
  let commodityGroup = 'Commodity';
  let createdTime: string | undefined;
  let updatedTime: string | undefined;
  try {
    const commodity = await fetchCommodityReport(slug);
    name = commodity.name;
    commodityGroup = commodity.commodityGroup;
    const categoryResult = commodity.categoryAnalysisResults.find((r) => r.categoryKey === categoryKey);
    createdTime = (categoryResult?.createdAt ?? commodity.createdAt).toISOString();
    updatedTime = (categoryResult?.updatedAt ?? commodity.updatedAt).toISOString();
  } catch {
    /* keep generic */
  }
  return generateCommodityCategoryMetadata({ name, slug, commodityGroup, categoryKey, createdTime, updatedTime });
}

/**
 * Shared server render for a commodity scored-category sub-page. Each route file
 * (supply-and-demand, price-and-value, …) is a thin wrapper that calls this with
 * its category key, mirroring how the ETF category sub-pages share
 * `EtfCategoryReport`.
 */
export default async function CommodityCategoryPageContent({
  slug,
  categoryKey,
}: {
  slug: string;
  categoryKey: CommodityAnalysisCategory;
}): Promise<JSX.Element> {
  let commodity;
  try {
    commodity = await fetchCommodityReport(slug);
  } catch {
    notFound();
  }

  const categoryResult = commodity.categoryAnalysisResults.find((r) => r.categoryKey === categoryKey);
  if (!categoryResult) notFound();

  const categoryName = COMMODITY_CATEGORY_NAMES[categoryKey];
  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Commodities', href: '/commodities', current: false },
    { name: commodity.name, href: `/commodities/${slug}`, current: false },
    { name: categoryName, href: `/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[categoryKey]}`, current: true },
  ];

  const publishedDate = (categoryResult.createdAt ?? commodity.createdAt).toISOString();
  const modifiedDate = (categoryResult.updatedAt ?? commodity.updatedAt).toISOString();

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCommodityCategoryArticleJsonLd({ name: commodity.name, slug, categoryKey, publishedDate, modifiedDate })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCommodityCategoryBreadcrumbJsonLd({ name: commodity.name, slug, categoryKey })) }}
      />

      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} mobileBackOnly={true} />
      <CommodityCategoryReport
        commodityName={commodity.name}
        slug={slug}
        commodityGroup={commodity.commodityGroup}
        categoryKey={categoryKey}
        categoryResult={categoryResult}
        analysisTitle={`${commodity.name} ${categoryName} Analysis`}
        categoryBadgeText={categoryName}
        categoryBadgeClassName={CATEGORY_BADGE_CLASS[categoryKey]}
        updatedAt={categoryResult.updatedAt.toISOString()}
      />

      <CommoditySimilarSection slug={slug} subPageSlug={COMMODITY_CATEGORY_TO_PATH[categoryKey]} />
    </PageWrapper>
  );
}
