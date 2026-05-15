import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { fetchEtfsForGroupings } from '@/utils/etf-grouping-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';

interface EtfAssetClassesIndexProps {
  country: EtfSupportedCountry;
}

export default async function EtfAssetClassesIndex({ country }: EtfAssetClassesIndexProps) {
  const assetClasses = ETF_ASSET_CLASS_OPTIONS.filter((opt) => opt.value !== '');

  const valueToKey = new Map<string, string>();
  for (const opt of assetClasses) {
    valueToKey.set(opt.value, opt.value);
  }

  const { values, counts } = await fetchEtfsForGroupings({
    spaceId: KoalaGainsSpaceId,
    mode: 'assetClass',
    valueToKey,
    country,
  });

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {assetClasses.map((opt) => (
          <CompactEtfGroupingCard
            key={opt.value}
            title={opt.label}
            href={etfBrowseDetailPath(country, 'asset-classes', slugifyEtfTag(opt.value))}
            totalCount={counts.get(opt.value) ?? 0}
            etfs={values.get(opt.value) ?? []}
          />
        ))}
      </div>
    </EtfPageLayout>
  );
}
