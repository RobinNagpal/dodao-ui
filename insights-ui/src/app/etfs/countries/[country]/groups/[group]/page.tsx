import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; group: string }>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; group: string }> }): Promise<Metadata> {
  const { country, group } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decodedGroup = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decodedGroup);
  const displayName = groupObj?.name ?? decodedGroup;
  return {
    title: `${displayName} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${displayName} group organised by analysis category, with top-rated ETFs in each category.`,
  };
}

export default async function CountryEtfsByGroupPage({ params }: PageProps) {
  const { country, group } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/groups/${encodeURIComponent(decodedGroupKey)}`);

  return EtfGroupDetail({ country: decodedCountry, groupKey: decodedGroupKey });
}
