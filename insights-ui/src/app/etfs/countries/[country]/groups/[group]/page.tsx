import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfGroupDetailTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { generateEtfGroupDetailBreadcrumbJsonLd, generateEtfGroupDetailMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 1209600; // 14 days — must be a literal for Next.js segment config

type PageProps = {
  params: Promise<{ country: string; group: string }>;
};

const EMPTY_GROUP_DETAIL: EtfGroupDetailResponse = { found: false, values: {}, counts: {}, others: null };

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 2-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchGroupDetail(country: EtfSupportedCountry, groupKey: string): Promise<EtfGroupDetailResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/group?country=${encodeURIComponent(
    country
  )}&groupKey=${encodeURIComponent(groupKey)}`;
  try {
    const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfGroupDetailTag(country, groupKey)] } });
    if (!res.ok) {
      console.error(`fetchGroupDetail failed (${res.status}): ${url}`);
      return EMPTY_GROUP_DETAIL;
    }
    return (await res.json()) as EtfGroupDetailResponse;
  } catch (e) {
    console.error('fetchGroupDetail error:', e);
    return EMPTY_GROUP_DETAIL;
  }
}

export async function generateMetadata(props: { params: Promise<{ country: string; group: string }> }): Promise<Metadata> {
  const { country, group } = await props.params;
  const decodedGroup = decodeURIComponent(group);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/groups/${encodeURIComponent(decodedGroup)}`);
  const groupObj = getEtfGroupByKey(decodedGroup);
  return generateEtfGroupDetailMetadata({
    country: decodedCountry,
    groupKey: decodedGroup,
    groupName: groupObj?.name ?? decodedGroup,
  });
}

export default async function CountryEtfsByGroupPage({ params }: PageProps) {
  const { country, group } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/groups/${encodeURIComponent(decodedGroupKey)}`);
  const data = await fetchGroupDetail(decodedCountry, decodedGroupKey);
  const groupObj = getEtfGroupByKey(decodedGroupKey);
  const breadcrumb = generateEtfGroupDetailBreadcrumbJsonLd({
    country: decodedCountry,
    groupKey: decodedGroupKey,
    groupName: groupObj?.name ?? decodedGroupKey,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <EtfGroupDetail country={decodedCountry} groupKey={decodedGroupKey} data={data} />
    </>
  );
}
