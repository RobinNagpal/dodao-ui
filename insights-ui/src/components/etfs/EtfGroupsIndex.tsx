import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';

interface EtfGroupsIndexProps {
  country: EtfSupportedCountry;
}

export default async function EtfGroupsIndex({ country }: EtfGroupsIndexProps) {
  const groups = getAllEtfGroups();

  const valueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      valueToKey.set(cat.name, group.key);
    }
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'category',
    valueToKey,
    country,
  });

  const displayName = etfCountryDisplayName(country);
  const groupsPath = etfBrowsePath(country, 'groups');

  return (
    <EtfPageLayout
      title={`${displayName} ETFs by Group`}
      description={`Diversified, sector, fixed income, and alternative-strategy fund groups for ${displayName} ETFs. Each card lists the top-rated ETFs in that group.`}
      currentCountry={country}
      switcherSection="groups"
      extraBreadcrumbs={[{ name: 'Groups', href: groupsPath, current: true }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {groups.map((group) => (
          <CompactEtfGroupingCard
            key={group.key}
            title={group.name}
            href={etfBrowseDetailPath(country, 'groups', group.key)}
            totalCount={counts.get(group.key) ?? 0}
            etfs={values.get(group.key) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
