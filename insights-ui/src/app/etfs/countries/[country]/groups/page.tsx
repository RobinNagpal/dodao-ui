import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
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
    title: `${decoded} ETFs by Group | KoalaGains`,
    description: `Browse ${decoded} ETFs organized by analysis group. Each group highlights top-rated ETFs by report score and AUM.`,
  };
}

export default async function CountryEtfsGroupsIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/groups');
  return EtfGroupsIndex({ country: decoded });
}
