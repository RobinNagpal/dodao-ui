import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfGroupsIndexTag } from '@/utils/etf-cache-utils';
import { fetchEtfListingsIndex } from '@/utils/etf-listing-visibility';
import { generateEtfListingBreadcrumbJsonLd, generateEtfListingJsonLd, generateEtfListingMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

export const dynamic = 'force-dynamic';

export const metadata = generateEtfListingMetadata();

const EMPTY_GROUPS_INDEX: EtfGroupsIndexResponse = {
  categoryValues: {},
  categoryCounts: {},
  groupCounts: {},
  others: { items: [], count: 0 },
};

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 2-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchGroupsIndex(country: SupportedCountries): Promise<EtfGroupsIndexResponse> {
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

export default async function EtfsPage() {
  const data = await fetchGroupsIndex(SupportedCountries.US);
  return (
    <EtfGroupsIndex
      country={SupportedCountries.US}
      data={data}
      title="US ETFs"
      headSlot={
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingJsonLd()) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingBreadcrumbJsonLd()) }} />
        </>
      }
    />
  );
}
