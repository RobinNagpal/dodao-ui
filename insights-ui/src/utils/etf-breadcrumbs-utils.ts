import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';

/**
 * Breadcrumb trail for an ETF report sub-page (e.g. risk-analysis, holdings).
 * Pattern: US ETFs → Group → Fund Category → Symbol → Report Section.
 * Uses the symbol (not "Name (SYMBOL)") so the trail stays compact.
 */
export function buildEtfReportSubpageBreadcrumbs({
  exchange,
  symbol,
  fundCategory,
  sectionName,
  sectionSlug,
}: {
  exchange: string;
  symbol: string;
  fundCategory: string | null | undefined;
  sectionName: string;
  sectionSlug: string;
}): BreadcrumbsOjbect[] {
  const { groupKey, groupName, fundCategoryName, fundCategorySlug } = getEtfFundCategoryHierarchy(fundCategory);
  const crumbs: BreadcrumbsOjbect[] = [{ name: 'US ETFs', href: '/etfs', current: false }];
  if (groupKey && groupName) {
    crumbs.push({ name: groupName, href: `/etfs/groups/${groupKey}`, current: false });
    if (fundCategoryName && fundCategorySlug) {
      crumbs.push({ name: fundCategoryName, href: `/etfs/groups/${groupKey}/categories/${fundCategorySlug}`, current: false });
    }
  }
  crumbs.push({ name: symbol, href: `/etfs/${exchange}/${symbol}`, current: false });
  crumbs.push({ name: sectionName, href: `/etfs/${exchange}/${symbol}/${sectionSlug}`, current: true });
  return crumbs;
}
