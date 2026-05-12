import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Provider | KoalaGains`,
    description: `Browse ${decoded} ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.`,
  };
}

export default async function CountryEtfsProvidersIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  return EtfProvidersIndex({ country: decoded });
}
