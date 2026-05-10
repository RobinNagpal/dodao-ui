import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ETFs by Category | KoalaGains',
  description:
    'Browse US ETFs by Morningstar-style category — Large Blend, Technology, High Yield Bond, and more. Each card highlights the top-rated ETFs in that category.',
};

export default async function EtfsCategoriesIndexPage() {
  const groups = getAllEtfGroups();

  const valueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      valueToKey.set(cat.name, cat.name);
    }
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'category',
    valueToKey,
  });

  return (
    <EtfPageLayout
      title="ETFs by Category"
      description="Browse all ETF categories grouped by analysis group. Each card lists the top-rated ETFs in that category."
      extraBreadcrumbs={[{ name: 'Categories', href: '/etfs/categories', current: true }]}
    >
      {groups.map((group) => {
        const categories = getCategoriesForGroupKey(group.key);
        if (categories.length === 0) return null;

        return (
          <div key={group.key} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{group.name}</h2>
              <Link
                href={`/etfs/groups/${encodeURIComponent(group.key)}`}
                className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
              >
                View Group
                <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {categories.map((cat) => (
                <CompactEtfGroupingCard
                  key={cat.name}
                  title={cat.name}
                  href={`/etfs/categories/${encodeURIComponent(cat.name)}`}
                  totalCount={counts.get(cat.name) ?? 0}
                  etfs={values.get(cat.name) ?? []}
                />
              ))}
            </div>
          </div>
        );
      })}
    </EtfPageLayout>
  );
}
