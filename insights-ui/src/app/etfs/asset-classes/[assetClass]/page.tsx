import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams, ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ assetClass: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ assetClass: string }> }): Promise<Metadata> {
  const { assetClass } = await props.params;
  const decoded = decodeURIComponent(assetClass);
  return {
    title: `${decoded} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${decoded} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByAssetClassPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { assetClass } = await params;
  const searchParams = await searchParamsPromise;
  const decodedAssetClass = decodeURIComponent(assetClass);

  const matchingOption = ETF_ASSET_CLASS_OPTIONS.find((o) => o.value.toLowerCase() === decodedAssetClass.toLowerCase());
  const displayAssetClass = matchingOption?.label ?? decodedAssetClass;
  const filterValue = matchingOption?.value ?? decodedAssetClass;

  const dataPromise = fetchEtfListingData({
    ...searchParams,
    [EtfFilterParamKey.ASSET_CLASS]: filterValue,
  });

  return (
    <EtfPageLayout
      title={`${displayAssetClass} ETFs`}
      description={`Explore US ETFs in the ${displayAssetClass} asset class with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      extraBreadcrumbs={[{ name: displayAssetClass, href: `/etfs/asset-classes/${encodeURIComponent(filterValue)}`, current: true }]}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
