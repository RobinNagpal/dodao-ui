import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfGroupingCardGrid from '@/components/etfs/EtfGroupingCardGrid';
import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfAssetClassesIndexProps {
  country: EtfSupportedCountry;
  data: EtfAssetClassesIndexResponse;
}

export default function EtfAssetClassesIndex({ country, data }: EtfAssetClassesIndexProps) {
  const assetClasses = ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '');
  const displayName = etfCountryDisplayName(country);
  const assetClassesPath = etfBrowsePath(country, 'asset-classes');

  return (
    <EtfPageLayout
      title={`${displayName} ETFs by Asset Class`}
      description={`Equity, fixed income, commodity, alternative, multi-asset and currency fund classes for ${displayName} ETFs. Each card shows the top-rated ETFs in that asset class.`}
      currentCountry={country}
      switcherSection="asset-classes"
      extraBreadcrumbs={[{ name: 'Asset Classes', href: assetClassesPath, current: true }]}
    >
      <EtfGroupingCardGrid
        columns={3}
        items={assetClasses.map((opt) => ({
          key: opt.value,
          title: opt.label,
          href: etfBrowseDetailPath(country, 'asset-classes', slugifyEtfTag(opt.value)),
          totalCount: data.counts[opt.value] ?? 0,
          etfs: data.values[opt.value] ?? [],
        }))}
      />
    </EtfPageLayout>
  );
}
