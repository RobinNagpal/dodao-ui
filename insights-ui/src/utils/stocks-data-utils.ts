import { hasFiltersApplied, toSortedQueryString } from '@/utils/ticker-filter-utils';
import { IndustriesResponse, SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
// import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getIndustryPageTag, getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Types shared with the grid components
export type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Fetches stocks data for the main stocks page
 */
export async function fetchStocksData(country: SupportedCountries, searchParams: SearchParams): Promise<IndustriesResponse> {
  const baseUrl = getBaseUrl();
  const filters = hasFiltersApplied(searchParams);

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries`;
  const url = filters ? `${baseUrlPath}?${toSortedQueryString(searchParams, country)}` : baseUrlPath;
  const tags = filters ? [] : [getStocksPageTag(country)];

  try {
    const res = await fetch(url, { next: { tags } });
    if (!res.ok) return { industries: [], filtersApplied: filters };

    return (await res.json()) as IndustriesResponse;
  } catch (e) {
    console.error(e);
    return { industries: [], filtersApplied: filters };
  }
}

/**
 * Fetches stocks data for a specific industry
 */
export async function fetchIndustryStocksData(
  industryKey: string,
  country: SupportedCountries,
  searchParams: SearchParams
): Promise<SubIndustriesResponse | null> {
  const baseUrl = getBaseUrl();
  const filters = hasFiltersApplied(searchParams);

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}`;
  const url = filters ? `${baseUrlPath}?${toSortedQueryString(searchParams, country)}` : baseUrlPath;
  const tags = filters ? [] : [getIndustryPageTag(country, industryKey)];

  try {
    const res = await fetch(url, { next: { tags } });
    if (!res.ok) return null;

    return (await res.json()) as SubIndustriesResponse;
  } catch (e) {
    console.error(e);
    return null;
  }
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
