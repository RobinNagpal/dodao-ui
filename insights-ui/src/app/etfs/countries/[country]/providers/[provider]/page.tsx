import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; provider: string }> }): Promise<Metadata> {
  const { country, provider } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decoded = decodeURIComponent(provider);
  return {
    title: `${decoded} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs issued by ${decoded} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByProviderPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, provider } = await params;
  const decodedProvider = decodeURIComponent(provider);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/providers/${encodeURIComponent(decodedProvider)}`);

  const searchParams = await searchParamsPromise;
  return EtfProviderDetail({ country: decodedCountry, provider: decodedProvider, searchParams });
}
