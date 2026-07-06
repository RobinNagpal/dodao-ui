import CommodityCategoryReport from '@/components/commodity-reports/CommodityCategoryReport';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES, COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
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
  const categoryName = COMMODITY_CATEGORY_NAMES[categoryKey];
  let name = slug;
  try {
    const commodity = await fetchCommodityWithAllData(slug);
    name = commodity.name;
  } catch {
    /* keep generic */
  }
  const title = `${name} — ${categoryName} | KoalaGains`;
  const description = `${categoryName} analysis for the commodity ${name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[categoryKey]}` },
    openGraph: { title, description, url: `/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[categoryKey]}` },
  };
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
    commodity = await fetchCommodityWithAllData(slug);
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

  return (
    <PageWrapper>
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
    </PageWrapper>
  );
}
