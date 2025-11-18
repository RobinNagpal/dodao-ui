import { hasFiltersApplied, toSortedQueryString } from '@/utils/ticker-filter-utils';
import { IndustriesResponse, SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getIndustryPageTag, getStocksPageTag } from '@/utils/ticker-v1-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Types shared with the grid components
export type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Fetches stocks data for the main stocks page
 */
export async function fetchStocksData(country: SupportedCountries = SupportedCountries.US, searchParams: SearchParams = {}): Promise<IndustriesResponse> {
  const baseUrl = getBaseUrl();
  const filters = hasFiltersApplied(searchParams);

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries`;
  const url = filters ? `${baseUrlPath}?${toSortedQueryString(searchParams)}` : baseUrlPath;
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
  country: SupportedCountries = SupportedCountries.US,
  searchParams: SearchParams = {}
): Promise<SubIndustriesResponse | null> {
  const baseUrl = getBaseUrl();
  const filters = hasFiltersApplied(searchParams);

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}`;
  const url = filters ? `${baseUrlPath}?${toSortedQueryString(searchParams)}` : baseUrlPath;
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
