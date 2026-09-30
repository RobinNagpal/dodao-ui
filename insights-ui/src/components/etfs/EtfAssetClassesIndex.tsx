import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import EtfGroupingCardGrid from '@/components/etfs/EtfGroupingCardGrid';
import { buildPopulatedEtfAssetClassItems } from '@/components/home-page/TopEtfAssetClassesShowcase';
import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';

interface EtfAssetClassesIndexProps {
  country: EtfSupportedCountry;
  data: EtfAssetClassesIndexResponse;
}

export default function EtfAssetClassesIndex({ country, data }: EtfAssetClassesIndexProps) {
  const displayName = etfCountryDisplayName(country);
  const assetClassesPath = etfBrowsePath(country, 'asset-classes');
  // Only populated asset classes (+ "Others" when it has ETFs) — empty ones 404, so don't link them.
  const items = buildPopulatedEtfAssetClassItems(country, data);

  return (
    <EtfPageLayout
      title={`${displayName} ETFs by Asset Class`}
      description={`Equity, fixed income, commodity, alternative, multi-asset and currency fund classes for ${displayName} ETFs. Each card shows the top-rated ETFs in that asset class.`}
      currentCountry={country}
      switcherSection="asset-classes"
      extraBreadcrumbs={[{ name: 'Asset Classes', href: assetClassesPath, current: true }]}
      revalidateTag={{ kind: 'asset-classes-index', country }}
    >
      <EtfGroupingCardGrid columns={3} items={items} />
    </EtfPageLayout>
  );
}
