import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
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
    title: `${decoded} ETFs by Asset Class | KoalaGains`,
    description: `Browse ${decoded} ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.`,
  };
}

export default async function CountryEtfsAssetClassesIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/asset-classes');
  return EtfAssetClassesIndex({ country: decoded });
}
