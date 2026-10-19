import { FilterParams, hasFiltersApplied, parseFilterParamsFromSearchParams, toSortedQueryString } from '@/utils/ticker-filter-utils';
import { IndustriesResponse, SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { ssrCachedData, ssrRequestData } from '@/utils/ssr-data-cache';
import { getIndustryPageTag, getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import { getCountryIndustriesWithTopTickers, getCountryIndustryStocks } from '@/utils/ticker-v1-page-data';

// Types shared with the grid components
export type SearchParams = { [key: string]: string | string[] | undefined };

/** The API routes' filter parsing, applied to page `searchParams` (same sorted query string the old self-fetch URL carried). */
function toFilterParams(country: SupportedCountries, searchParams: SearchParams): FilterParams {
  return parseFilterParamsFromSearchParams(new URLSearchParams(toSortedQueryString(searchParams, country)));
}

/**
 * Stocks data for the main stocks page — the `country/[country]/tickers/industries` API query,
 * called in-process (no self-fetch; see `src/utils/ssr-data-cache.ts`). The old `fetch()` carried
 * only `next: { tags }`, which `force-dynamic` never stored in the Data Cache, so this stays
 * per-request. Errors degrade to an empty listing, as before.
 */
export async function fetchStocksData(country: SupportedCountries, searchParams: SearchParams): Promise<IndustriesResponse> {
  const filters = hasFiltersApplied(searchParams);
  try {
    return await ssrRequestData(() => getCountryIndustriesWithTopTickers(KoalaGainsSpaceId, country, toFilterParams(country, filters ? searchParams : {})));
  } catch (e) {
    console.error(e);
    return { industries: [], filtersApplied: filters };
  }
}

/**
 * Stocks data for a specific industry — the `.../industries/[industryKey]` API query, in-process.
 * Same per-request semantics as {@link fetchStocksData}; errors resolve to null, as before.
 */
export async function fetchIndustryStocksData(
  industryKey: string,
  country: SupportedCountries,
  searchParams: SearchParams
): Promise<SubIndustriesResponse | null> {
  const filters = hasFiltersApplied(searchParams);
  try {
    return await ssrRequestData(() => getCountryIndustryStocks(KoalaGainsSpaceId, country, industryKey, toFilterParams(country, filters ? searchParams : {})));
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Unfiltered listing data for the static listing pages (and the stock 404 body), in-process and
 * Data-Cached exactly like the `fetch(url, { next: { revalidate, tags } })` it replaces: same tag,
 * same TTL. Errors throw and are not cached (the old fetch only cached OK responses); callers keep
 * their own error handling.
 */
export function getCachedCountryIndustries(country: SupportedCountries, revalidate: number): Promise<IndustriesResponse> {
  return ssrCachedData(['stocks-country-industries', country], { tags: [getStocksPageTag(country)], revalidate }, () =>
    getCountryIndustriesWithTopTickers(KoalaGainsSpaceId, country, toFilterParams(country, {}))
  );
}

/** Unfiltered industry listing (null = unknown industry), Data-Cached like {@link getCachedCountryIndustries}. */
export function getCachedCountryIndustryStocks(country: SupportedCountries, industryKey: string, revalidate: number): Promise<SubIndustriesResponse | null> {
  return ssrCachedData(['stocks-country-industry', country, industryKey], { tags: [getIndustryPageTag(country, industryKey)], revalidate }, () =>
    getCountryIndustryStocks(KoalaGainsSpaceId, country, industryKey, toFilterParams(country, {}))
  );
}

/**
 * True when an industry listing is CONFIRMED to have no stocks (every sub-industry is empty).
 * Mirrors the empty-state check in `IndustryStocksGrid`. These thin pages return a real 404 (and
 * `noindex`) so they aren't reported as soft 404s. A failed fetch (`null`) is NOT treated as
 * empty, so a transient API/DB error can never 404 or deindex a populated page.
 */
export function isIndustryStocksResponseEmpty(data: SubIndustriesResponse | null): boolean {
  if (!data) return false;
  return !data.subIndustries || data.subIndustries.flatMap((subIndustry) => subIndustry.tickers).length === 0;
}
