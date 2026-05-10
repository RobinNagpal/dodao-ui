import EtfAssetClassDetail from '@/components/etfs/EtfAssetClassDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
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
  return EtfAssetClassDetail({ country: SupportedCountries.US, assetClass: decodeURIComponent(assetClass), searchParams });
}
