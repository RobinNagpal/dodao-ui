import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfGroupDetailTag } from '@/utils/etf-cache-utils';
import { fetchEtfListingsIndex } from '@/utils/etf-listing-visibility';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { generateEtfGroupDetailBreadcrumbJsonLd, generateEtfGroupDetailMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string }>;
};

const EMPTY_GROUP_DETAIL: EtfGroupDetailResponse = { found: false, values: {}, counts: {}, others: null };

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 1-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchGroupDetail(country: SupportedCountries, groupKey: string): Promise<EtfGroupDetailResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/group?country=${encodeURIComponent(
    country
  )}&groupKey=${encodeURIComponent(groupKey)}`;
  try {
    const res = await fetchEtfListingsIndex(url, getEtfGroupDetailTag(country, groupKey));
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

export async function generateMetadata(props: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await props.params;
  const groupKey = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(groupKey);
  return generateEtfGroupDetailMetadata({
    country: SupportedCountries.US,
    groupKey,
    groupName: groupObj?.name ?? groupKey,
  });
}

export default async function EtfsByGroupPage({ params }: PageProps) {
  const { group } = await params;
  const groupKey = decodeURIComponent(group);
  // Reject unknown group keys with a real 404 instead of rendering an empty
  // listing (a soft 404). Uses the local category config so transient API
  // failures on a valid key still fail-soft via EMPTY_GROUP_DETAIL.
  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();
  const data = await fetchGroupDetail(SupportedCountries.US, groupKey);
  const breadcrumb = generateEtfGroupDetailBreadcrumbJsonLd({
    country: SupportedCountries.US,
    groupKey,
    groupName: groupObj.name,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <EtfGroupDetail country={SupportedCountries.US} groupKey={groupKey} data={data} />
    </>
  );
}
