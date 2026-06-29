import EtfGroupDetail from '@/components/etfs/EtfGroupDetail';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { EMPTY_ETF_GROUP_DETAIL, fetchEtfGroupDetail } from '@/utils/etf-listing-fetchers';
import { groupDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfGroupDetailBreadcrumbJsonLd, generateEtfGroupDetailMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string }>;
};

export async function generateMetadata(props: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await props.params;
  const groupKey = decodeURIComponent(group);
  const groupObj = getEtfGroupByKey(groupKey);
  const base = generateEtfGroupDetailMetadata({
    country: SupportedCountries.US,
    groupKey,
    groupName: groupObj?.name ?? groupKey,
  });
  // Unknown key → the page 404s, so there's nothing to index either way.
  if (!groupObj) return base;
  const data = await fetchEtfGroupDetail(SupportedCountries.US, groupKey);
  return { ...base, ...groupDetailRobots(data) };
}

export default async function EtfsByGroupPage({ params }: PageProps) {
  const { group } = await params;
  const groupKey = decodeURIComponent(group);
  // Reject unknown group keys with a real 404 instead of rendering an empty
  // listing (a soft 404). Uses the local category config so transient API
  // failures on a valid key still fail-soft via EMPTY_ETF_GROUP_DETAIL.
  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) notFound();
  const data = (await fetchEtfGroupDetail(SupportedCountries.US, groupKey)) ?? EMPTY_ETF_GROUP_DETAIL;
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
