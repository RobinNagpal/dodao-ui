import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_OTHERS_GROUP, getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { fetchEtfsForGroupings, fetchUncategorizedEtfPreview } from '@/utils/etf-grouping-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { EtfBrowseSection, etfBrowseDetailPath, etfCountryDisplayName, etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { ReactNode } from 'react';
import Link from 'next/link';

interface EtfGroupsIndexProps {
  country: EtfSupportedCountry;
  title?: string;
  description?: string;
  switcherSection?: EtfBrowseSection;
  extraBreadcrumbs?: BreadcrumbsOjbect[];
  headSlot?: ReactNode;
}

export default async function EtfGroupsIndex({ country, title, description, switcherSection, extraBreadcrumbs, headSlot }: EtfGroupsIndexProps) {
  const groups = getAllEtfGroups();

  // Bucket every category in every group so we can fetch top-N ETFs per category.
  const categoryValueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      categoryValueToKey.set(cat.name, cat.name);
    }
  }

  // Also bucket categories by group key so we can compute total ETFs per group
  // (sum of category counts) for the "Show all" header link.
  const groupValueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      groupValueToKey.set(cat.name, group.key);
    }
  }

  const [{ values: categoryValues, counts: categoryCounts }, { counts: groupCounts }, others] = await Promise.all([
    fetchEtfsForGroupings({
      spaceId: KoalaGainsSpaceId,
      mode: 'category',
      valueToKey: categoryValueToKey,
      country,
    }),
    fetchEtfsForGroupings({
      spaceId: KoalaGainsSpaceId,
      mode: 'category',
      valueToKey: groupValueToKey,
      country,
    }),
    fetchUncategorizedEtfPreview(KoalaGainsSpaceId, country),
  ]);

  const displayName = etfCountryDisplayName(country);
  const resolvedTitle = title ?? `${displayName} ETFs by Group`;
  const resolvedDescription =
    description ??
    `Diversified, sector, fixed income, and alternative-strategy fund groups for ${displayName} ETFs. Each card lists the top-rated ETFs in that category.`;

  return (
    <EtfPageLayout
      title={resolvedTitle}
      description={resolvedDescription}
      currentCountry={country}
      switcherSection={switcherSection}
      extraBreadcrumbs={extraBreadcrumbs}
    >
      {headSlot}
      {groups.map((group) => {
        const categories = getCategoriesForGroupKey(group.key);
        const categoriesWithEtfs = categories.filter((cat) => (categoryValues.get(cat.name)?.length ?? 0) > 0);
        if (categoriesWithEtfs.length === 0) return null;

        const totalEtfsInGroup = groupCounts.get(group.key) ?? 0;
        const groupHref = etfBrowseDetailPath(country, 'groups', group.key);

        return (
          <div key={group.key} className="mb-8">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-white">{group.name}</h2>
              <Link
                href={groupHref}
                className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center whitespace-nowrap"
              >
                Show all {totalEtfsInGroup.toLocaleString()} ETFs
                <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {categoriesWithEtfs.map((cat) => (
                <CompactEtfGroupingCard
                  key={cat.name}
                  title={cat.name}
                  href={etfGroupCategoryPath(country, group.key, cat.name)}
                  totalCount={categoryCounts.get(cat.name) ?? 0}
                  etfs={categoryValues.get(cat.name) ?? []}
                />
              ))}
            </div>
          </div>
        );
      })}

      {others.count > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-white">{ETF_OTHERS_GROUP.name}</h2>
            <Link
              href={etfBrowseDetailPath(country, 'groups', ETF_OTHERS_GROUP.key)}
              className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center whitespace-nowrap"
            >
              Show all {others.count.toLocaleString()} ETFs
              <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <CompactEtfGroupingCard
              key={ETF_OTHERS_GROUP.key}
              title={ETF_OTHERS_GROUP.name}
              href={etfBrowseDetailPath(country, 'groups', ETF_OTHERS_GROUP.key)}
              totalCount={others.count}
              etfs={others.items}
            />
          </div>
        </div>
      )}
    </EtfPageLayout>
  );
}
