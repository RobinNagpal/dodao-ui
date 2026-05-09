import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ETFs by Group | KoalaGains',
  description: 'Browse US ETFs organized by analysis group. Each group highlights top-rated ETFs by report score and AUM.',
};

export default async function EtfsGroupsIndexPage() {
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
  });

  return (
    <EtfPageLayout
      title="ETFs by Group"
      description="Diversified, sector, fixed income, and alternative-strategy fund groups. Each card lists the top-rated ETFs in that group."
      extraBreadcrumbs={[{ name: 'Groups', href: '/etfs/groups', current: true }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {groups.map((group) => (
          <CompactEtfGroupingCard
            key={group.key}
            title={group.name}
            href={`/etfs/groups/${encodeURIComponent(group.key)}`}
            totalCount={counts.get(group.key) ?? 0}
            etfs={values.get(group.key) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
