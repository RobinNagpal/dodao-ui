import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await props.params;
  const decoded = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(decoded);
  const displayName = groupObj?.name ?? decoded;
  return {
    title: `${displayName} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${displayName} group with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByGroupPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { group } = await params;
  const searchParams = await searchParamsPromise;
  return EtfGroupDetail({ country: SupportedCountries.US, groupKey: decodeURIComponent(group), searchParams });
}
