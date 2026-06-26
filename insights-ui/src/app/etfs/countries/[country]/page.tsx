import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfGroupsIndexTag } from '@/utils/etf-cache-utils';
import { fetchEtfListingsIndex } from '@/utils/etf-listing-visibility';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { generateEtfCountryListingBreadcrumbJsonLd, generateEtfCountryListingMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

const EMPTY_GROUPS_INDEX: EtfGroupsIndexResponse = {
  categoryValues: {},
  categoryCounts: {},
  groupCounts: {},
  others: { items: [], count: 0 },
};

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 1-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchGroupsIndex(country: EtfSupportedCountry): Promise<EtfGroupsIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/groups-index?country=${encodeURIComponent(country)}`;
  try {
    const res = await fetchEtfListingsIndex(url, getEtfGroupsIndexTag(country));
    if (!res.ok) {
      console.error(`fetchGroupsIndex failed (${res.status}): ${url}`);
      return EMPTY_GROUPS_INDEX;
    }
    return (await res.json()) as EtfGroupsIndexResponse;
  } catch (e) {
    console.error('fetchGroupsIndex error:', e);
    return EMPTY_GROUPS_INDEX;
  }
}

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = resolveEtfCountryParam(country, '/etfs');
  return generateEtfCountryListingMetadata(decoded);
}

export default async function CountryEtfsPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs');
  const data = await fetchGroupsIndex(decoded);
  return (
    <EtfGroupsIndex
      country={decoded}
      data={data}
      headSlot={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfCountryListingBreadcrumbJsonLd(decoded)) }} />}
    />
  );
}
