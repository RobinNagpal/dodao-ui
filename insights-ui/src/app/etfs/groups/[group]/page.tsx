import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfGroupDetailTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = TWO_WEEKS_IN_SECONDS;

type PageProps = {
  params: Promise<{ group: string }>;
};

async function fetchGroupDetail(country: SupportedCountries, groupKey: string): Promise<EtfGroupDetailResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/group?country=${encodeURIComponent(
    country
  )}&groupKey=${encodeURIComponent(groupKey)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfGroupDetailTag(country, groupKey)] } });
  if (!res.ok) {
    throw new Error(`fetchGroupDetail failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfGroupDetailResponse;
}

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
  const groupKey = decodeURIComponent(group);
  const data = await fetchGroupDetail(SupportedCountries.US, groupKey);
  return <EtfGroupDetail country={SupportedCountries.US} groupKey={groupKey} data={data} />;
}
