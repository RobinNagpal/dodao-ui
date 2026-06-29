import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EMPTY_ETF_GROUP_DETAIL, fetchEtfGroupDetail } from '@/utils/etf-listing-fetchers';
import { groupDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfGroupDetailBreadcrumbJsonLd, generateEtfGroupDetailMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; group: string }>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; group: string }> }): Promise<Metadata> {
  const { country, group } = await props.params;
  const decodedGroup = decodeURIComponent(group);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/groups/${encodeURIComponent(decodedGroup)}`);
  const groupObj = getEtfGroupByKey(decodedGroup);
  const base = generateEtfGroupDetailMetadata({
    country: decodedCountry,
    groupKey: decodedGroup,
    groupName: groupObj?.name ?? decodedGroup,
  });
  // Unknown key → the page 404s, so there's nothing to index either way.
  if (!groupObj) return base;
  const data = await fetchEtfGroupDetail(decodedCountry, decodedGroup);
  return { ...base, ...groupDetailRobots(data) };
}

export default async function CountryEtfsByGroupPage({ params }: PageProps) {
  const { country, group } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/groups/${encodeURIComponent(decodedGroupKey)}`);
  // Reject unknown group keys with a real 404 instead of rendering an empty
  // listing (a soft 404). Uses the local category config so transient API
  // failures on a valid key still fail-soft via EMPTY_ETF_GROUP_DETAIL.
  const groupObj = getEtfGroupByKey(decodedGroupKey);
  if (!groupObj) notFound();
  const data = (await fetchEtfGroupDetail(decodedCountry, decodedGroupKey)) ?? EMPTY_ETF_GROUP_DETAIL;
  const breadcrumb = generateEtfGroupDetailBreadcrumbJsonLd({
    country: decodedCountry,
    groupKey: decodedGroupKey,
    groupName: groupObj.name,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <EtfGroupDetail country={decodedCountry} groupKey={decodedGroupKey} data={data} />
    </>
  );
}
