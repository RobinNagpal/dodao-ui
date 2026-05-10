import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; assetClass: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; assetClass: string }> }): Promise<Metadata> {
  const { country, assetClass } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decoded = decodeURIComponent(assetClass);
  return {
    title: `${decoded} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${decoded} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByAssetClassPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, assetClass } = await params;
  const decodedAssetClass = decodeURIComponent(assetClass);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/asset-classes/${encodeURIComponent(decodedAssetClass)}`);

  const searchParams = await searchParamsPromise;

  const matchingOption = ETF_ASSET_CLASS_OPTIONS.find((o) => o.value.toLowerCase() === decodedAssetClass.toLowerCase());
  const displayAssetClass = matchingOption?.label ?? decodedAssetClass;
  const filterValue = matchingOption?.value ?? decodedAssetClass;

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.ASSET_CLASS]: filterValue,
    },
    decodedCountry
  );

  const encodedCountry = encodeURIComponent(decodedCountry);

  return (
    <EtfPageLayout
      title={`${displayAssetClass} ${decodedCountry} ETFs`}
      description={`Explore ${decodedCountry} ETFs in the ${displayAssetClass} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={decodedCountry}
      switcherSection="asset-classes"
      extraBreadcrumbs={[
        { name: 'All Asset Classes', href: `/etfs/countries/${encodedCountry}/asset-classes`, current: false },
        { name: displayAssetClass, href: `/etfs/countries/${encodedCountry}/asset-classes/${encodeURIComponent(filterValue)}`, current: true },
      ]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
