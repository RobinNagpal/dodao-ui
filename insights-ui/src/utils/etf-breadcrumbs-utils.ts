import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { getEtfFundCategoryHierarchy } from '@/utils/etf-categorization-utils';
import { getCountryByExchange, SupportedCountries, toExchange } from '@/utils/countryExchangeUtils';

/**
 * Breadcrumb trail for an ETF report sub-page (e.g. risk-analysis, holdings).
 * Pattern: {Country} ETFs → Group → Fund Category → Symbol → Report Section.
 * Uses the symbol (not "Name (SYMBOL)") so the trail stays compact.
 *
 * The root crumb + group/category links are country-aware (mirrors the main ETF
 * detail page in `etfs/[exchange]/[etf]/page.tsx`). Non-US exchanges (e.g. TSX,
 * ASX) must not be labelled "US ETFs" or point at the US-only `/etfs/groups/...`
 * listings.
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
  const country = getCountryByExchange(toExchange(exchange));
  const { groupKey, groupName, fundCategoryName, fundCategorySlug } = getEtfFundCategoryHierarchy(fundCategory);

  const rootCrumb: BreadcrumbsOjbect =
    country === SupportedCountries.US
      ? { name: 'US ETFs', href: `/etfs`, current: false }
      : country
      ? { name: `${country} ETFs`, href: `/etfs/countries/${country}`, current: false }
      : { name: 'ETFs', href: `/etfs`, current: false };
  const countryPrefix = country === SupportedCountries.US ? '/etfs' : country ? `/etfs/countries/${country}` : '/etfs';

  const crumbs: BreadcrumbsOjbect[] = [rootCrumb];
  if (groupKey && groupName) {
    crumbs.push({ name: groupName, href: `${countryPrefix}/groups/${groupKey}`, current: false });
    if (fundCategoryName && fundCategorySlug) {
      crumbs.push({ name: fundCategoryName, href: `${countryPrefix}/groups/${groupKey}/categories/${fundCategorySlug}`, current: false });
    }
  }
  crumbs.push({ name: symbol, href: `/etfs/${exchange}/${symbol}`, current: false });
  crumbs.push({ name: sectionName, href: `/etfs/${exchange}/${symbol}/${sectionSlug}`, current: true });
  return crumbs;
}
