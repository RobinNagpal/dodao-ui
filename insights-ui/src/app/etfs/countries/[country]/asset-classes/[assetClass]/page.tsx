import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
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
  return EtfAssetClassDetail({ country: decodedCountry, assetClass: decodedAssetClass, searchParams });
}
