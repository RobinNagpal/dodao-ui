import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfGroupDetailTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = TWO_WEEKS_IN_SECONDS;

type PageProps = {
  params: Promise<{ country: string; group: string }>;
};

async function fetchGroupDetail(country: EtfSupportedCountry, groupKey: string): Promise<EtfGroupDetailResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/group?country=${encodeURIComponent(
    country
  )}&groupKey=${encodeURIComponent(groupKey)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfGroupDetailTag(country, groupKey)] } });
  if (!res.ok) {
    throw new Error(`fetchGroupDetail failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfGroupDetailResponse;
}

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
  const data = await fetchGroupDetail(decodedCountry, decodedGroupKey);
  return <EtfGroupDetail country={decodedCountry} groupKey={decodedGroupKey} data={data} />;
}
