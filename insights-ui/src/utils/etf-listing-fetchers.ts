import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import {
  getEtfAssetClassesIndexData,
  getEtfGroupDetailData,
  getEtfGroupsIndexData,
  getEtfProvidersIndexData,
} from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfAssetClassesIndexTag, getEtfGroupDetailTag, getEtfGroupsIndexTag, getEtfProvidersIndexTag, ONE_WEEK_IN_SECONDS } from '@/utils/etf-cache-utils';
import { isEtfAdminViewer } from '@/utils/etf-listing-visibility';
import { ETF_SUPPORTED_COUNTRIES, EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { ssrCachedData, ssrRequestData } from '@/utils/ssr-data-cache';
import { cache } from 'react';

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
 * Data is loaded in-process (the shared loaders in `listings-prisma.ts`, which the
 * API routes also call) instead of `fetch()`ing the routes over the public host:
 * - Non-admin: `unstable_cache` with the same 1-week TTL + per-listing cache tag the
 *   page fetch used, returning populated-only data.
 * - Admin: uncached, `includeUnpopulated = true` (admin-ness checked here from the
 *   session, as before), so the full set is never cached under the public key.
 *
 * `generateMetadata` and the page component each call the same fetcher; React
 * `cache()` collapses that into a single load per render (as fetch memoization did).
 */

export const EMPTY_ETF_GROUPS_INDEX: EtfGroupsIndexResponse = {
  categoryValues: {},
  categoryCounts: {},
  groupCounts: {},
  others: { items: [], count: 0 },
};

export const EMPTY_ETF_ASSET_CLASSES_INDEX: EtfAssetClassesIndexResponse = { values: {}, counts: {}, others: { items: [], count: 0 } };

export const EMPTY_ETF_PROVIDERS_INDEX: EtfProvidersIndexResponse = { providers: [], values: {}, counts: {}, others: { items: [], count: 0 } };

export const EMPTY_ETF_GROUP_DETAIL: EtfGroupDetailResponse = { found: false, values: {}, counts: {}, others: null };

async function loadListing<T>(label: string, keyParts: string[], tag: string, load: (includeUnpopulated: boolean) => Promise<T>): Promise<T | null> {
  try {
    if (await isEtfAdminViewer()) {
      return await ssrRequestData(() => load(true));
    }
    return await ssrCachedData(keyParts, { tags: [tag], revalidate: ONE_WEEK_IN_SECONDS }, () => load(false));
  } catch (e) {
    console.error(`${label} error:`, e);
    return null;
  }
}

export const fetchEtfGroupsIndex = cache(async (country: EtfSupportedCountry): Promise<EtfGroupsIndexResponse | null> => {
  return loadListing('fetchEtfGroupsIndex', ['etf-listings-groups-index', country], getEtfGroupsIndexTag(country), (includeUnpopulated) =>
    getEtfGroupsIndexData(KoalaGainsSpaceId, country, includeUnpopulated)
  );
});

export const fetchEtfAssetClassesIndex = cache(async (country: EtfSupportedCountry): Promise<EtfAssetClassesIndexResponse | null> => {
  return loadListing('fetchEtfAssetClassesIndex', ['etf-listings-asset-classes-index', country], getEtfAssetClassesIndexTag(country), (includeUnpopulated) =>
    getEtfAssetClassesIndexData(KoalaGainsSpaceId, country, includeUnpopulated)
  );
});

export const fetchEtfProvidersIndex = cache(async (country: EtfSupportedCountry): Promise<EtfProvidersIndexResponse | null> => {
  return loadListing('fetchEtfProvidersIndex', ['etf-listings-providers-index', country], getEtfProvidersIndexTag(country), (includeUnpopulated) =>
    getEtfProvidersIndexData(KoalaGainsSpaceId, country, includeUnpopulated)
  );
});

export const fetchEtfGroupDetail = cache(async (country: EtfSupportedCountry, groupKey: string): Promise<EtfGroupDetailResponse | null> => {
  // The route trimmed the `groupKey` query param; mirror that.
  const trimmedGroupKey = groupKey.trim();
  return loadListing('fetchEtfGroupDetail', ['etf-listings-group', country, trimmedGroupKey], getEtfGroupDetailTag(country, groupKey), (includeUnpopulated) =>
    getEtfGroupDetailData(KoalaGainsSpaceId, country, trimmedGroupKey || undefined, includeUnpopulated)
  );
});

/**
 * ETF countries whose version of a listing has ETFs, for the "Also view" country switcher on detail
 * listing pages. Callers pass the same `is*DetailEmpty` predicate the page uses for its 404, so the
 * switcher never links to an empty (404) listing. A failed fetch counts as populated (fail-soft).
 */
export async function filterEtfCountriesWithListing(isPopulated: (country: EtfSupportedCountry) => Promise<boolean>): Promise<EtfSupportedCountry[]> {
  const flags = await Promise.all(ETF_SUPPORTED_COUNTRIES.map((country) => isPopulated(country)));
  return ETF_SUPPORTED_COUNTRIES.filter((_, i) => flags[i]);
}
