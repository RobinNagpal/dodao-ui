import EtfProviderDetail from '@/components/etfs/EtfProviderDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ provider: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ provider: string }> }): Promise<Metadata> {
  const { provider } = await props.params;
  const decoded = decodeURIComponent(provider);
  return {
    title: `${decoded} ETFs | KoalaGains`,
    description: `Browse US ETFs issued by ${decoded} with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByProviderPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { provider } = await params;
  const searchParams = await searchParamsPromise;
  return EtfProviderDetail({ country: SupportedCountries.US, provider: decodeURIComponent(provider), searchParams });
}
