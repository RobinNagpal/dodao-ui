import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { etfBrowseDetailPath, etfBrowsePath, etfCountryDisplayName } from '@/utils/etf-country-route-utils';

interface EtfAssetClassDetailProps {
  country: EtfSupportedCountry;
  assetClass: string;
  searchParams: EtfSearchParams;
}

export default async function EtfAssetClassDetail({ country, assetClass, searchParams }: EtfAssetClassDetailProps) {
  const matchingOption = ETF_ASSET_CLASS_OPTIONS.find((o) => o.value.toLowerCase() === assetClass.toLowerCase());
  const displayAssetClass = matchingOption?.label ?? assetClass;
  const filterValue = matchingOption?.value ?? assetClass;
  const displayCountry = etfCountryDisplayName(country);

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.ASSET_CLASS]: filterValue,
    },
    country
  );

  return (
    <EtfPageLayout
      title={`${displayAssetClass} ${displayCountry} ETFs`}
      description={`Explore ${displayCountry} ETFs in the ${displayAssetClass} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={country}
      switcherSection="asset-classes"
      extraBreadcrumbs={[
        { name: 'All Asset Classes', href: etfBrowsePath(country, 'asset-classes'), current: false },
        { name: displayAssetClass, href: etfBrowseDetailPath(country, 'asset-classes', filterValue), current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
