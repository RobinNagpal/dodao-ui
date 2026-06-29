import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfAssetClassesIndexTag, getEtfGroupDetailTag, getEtfGroupsIndexTag, getEtfProvidersIndexTag } from '@/utils/etf-cache-utils';
import { fetchEtfListingsIndex } from '@/utils/etf-listing-visibility';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/**
 * Server-only fetchers for the ETF listings index/detail API routes, shared by
 * the listing pages (which render the data) and their `generateMetadata` (which
 * uses it only to decide `robots` — see `etf-listing-noindex.ts`).
 *
 * Each fetcher returns `null` on a failed/non-OK fetch instead of an empty
 * sentinel. The caller coalesces `null` to its own `EMPTY_*` constant for
 * rendering (fail-soft, unchanged behaviour), but the SEO layer treats `null`
 * as "could not confirm" and stays indexable — so a transient API blip can
 * never deindex a populated, ranking page. A genuine HTTP-200 empty response is
 * the only thing that yields `noindex`.
 *
 * `generateMetadata` and the page component each call the same fetcher; Next.js
 * request memoization collapses that into a single upstream request per render.
 */

export const EMPTY_ETF_GROUPS_INDEX: EtfGroupsIndexResponse = {
  categoryValues: {},
  categoryCounts: {},
  groupCounts: {},
  others: { items: [], count: 0 },
};

export const EMPTY_ETF_ASSET_CLASSES_INDEX: EtfAssetClassesIndexResponse = { values: {}, counts: {} };

export const EMPTY_ETF_PROVIDERS_INDEX: EtfProvidersIndexResponse = { providers: [], values: {}, counts: {} };

export const EMPTY_ETF_GROUP_DETAIL: EtfGroupDetailResponse = { found: false, values: {}, counts: {}, others: null };

async function fetchListingJson<T>(url: string, tag: string, label: string): Promise<T | null> {
  try {
    const res = await fetchEtfListingsIndex(url, tag);
    if (!res.ok) {
      console.error(`${label} failed (${res.status}): ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`${label} error:`, e);
    return null;
  }
}

export async function fetchEtfGroupsIndex(country: EtfSupportedCountry): Promise<EtfGroupsIndexResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/groups-index?country=${encodeURIComponent(country)}`;
  return fetchListingJson<EtfGroupsIndexResponse>(url, getEtfGroupsIndexTag(country), 'fetchEtfGroupsIndex');
}

export async function fetchEtfAssetClassesIndex(country: EtfSupportedCountry): Promise<EtfAssetClassesIndexResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/asset-classes-index?country=${encodeURIComponent(country)}`;
  return fetchListingJson<EtfAssetClassesIndexResponse>(url, getEtfAssetClassesIndexTag(country), 'fetchEtfAssetClassesIndex');
}

export async function fetchEtfProvidersIndex(country: EtfSupportedCountry): Promise<EtfProvidersIndexResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/providers-index?country=${encodeURIComponent(country)}`;
  return fetchListingJson<EtfProvidersIndexResponse>(url, getEtfProvidersIndexTag(country), 'fetchEtfProvidersIndex');
}

export async function fetchEtfGroupDetail(country: EtfSupportedCountry, groupKey: string): Promise<EtfGroupDetailResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/group?country=${encodeURIComponent(
    country
  )}&groupKey=${encodeURIComponent(groupKey)}`;
  return fetchListingJson<EtfGroupDetailResponse>(url, getEtfGroupDetailTag(country, groupKey), 'fetchEtfGroupDetail');
}
