import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string }>;
};

export async function generateMetadata(props: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await props.params;
  const decoded = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decoded);
  const displayName = groupObj?.name ?? decoded;
  return {
    title: `${displayName} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${displayName} group organised by analysis category, with top-rated ETFs in each category.`,
  };
}

export default async function EtfsByGroupPage({ params }: PageProps) {
  const { group } = await params;
  return EtfGroupDetail({ country: SupportedCountries.US, groupKey: decodeURIComponent(group) });
}
