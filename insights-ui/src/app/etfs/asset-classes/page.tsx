import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ETFs by Asset Class | KoalaGains',
  description:
    'Browse US ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.',
};

export default async function EtfsAssetClassesIndexPage() {
  const assetClasses = ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '');

  const valueToKey = new Map<string, string>();
  for (const opt of assetClasses) {
    valueToKey.set(opt.value, opt.value);
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'assetClass',
    valueToKey,
  });

  return (
    <EtfPageLayout
      title="ETFs by Asset Class"
      description="Equity, fixed income, commodity, alternative, multi-asset and currency fund classes. Each card shows the top-rated ETFs in that asset class."
      extraBreadcrumbs={[{ name: 'Asset Classes', href: '/etfs/asset-classes', current: true }]}
      switcherSection="asset-classes"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {assetClasses.map((opt) => (
          <CompactEtfGroupingCard
            key={opt.value}
            title={opt.label}
            href={`/etfs/asset-classes/${encodeURIComponent(opt.value)}`}
            totalCount={counts.get(opt.value) ?? 0}
            etfs={values.get(opt.value) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
