import { hasFiltersApplied, toSortedQueryString } from '@/components/stocks/filters/filter-utils';
import { IndustriesResponse, SubIndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getCacheTagForIndustry, TICKERS_TAG } from '@/utils/ticker-v1-cache-utils';

// Types shared with the grid components
export type SearchParams = { [key: string]: string | string[] | undefined };

// Cache constants
export const TWO_DAYS = 60 * 60 * 24 * 2;

/**
 * Fetches stocks data for the main stocks page
 */
export async function fetchStocksData(country: SupportedCountries = SupportedCountries.US, searchParams: SearchParams): Promise<IndustriesResponse> {
  const baseUrl = getBaseUrlForServerSidePages();
  const filters = hasFiltersApplied(searchParams);

  let url = '';
  let tags: string[] = [];

  if (filters) {
    const qs = toSortedQueryString(searchParams);

    // Use the new by-industry-and-sub-industry route with filters
    url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries?${qs}`;
    tags = [TICKERS_TAG, 'tickers:US:filtered:' + qs.replace(/&/g, ',')];
  } else {
    // Use the by-industry-and-sub-industry route without filters
    url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries`;
    tags = [TICKERS_TAG];
  }

  try {
    const res = await fetch(url, { next: { tags, revalidate: TWO_DAYS } });
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
  searchParams: SearchParams
): Promise<SubIndustriesResponse | null> {
  const baseUrl = getBaseUrlForServerSidePages();
  const filters = hasFiltersApplied(searchParams);

  let url = '';
  let tags: string[] = [];

  if (filters) {
    const qs = toSortedQueryString(searchParams);
    url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}?${qs}`;
    tags = [getCacheTagForIndustry(industryKey), `${getCacheTagForIndustry(industryKey)}:${qs.replace(/&/g, ',')}`];
  } else {
    url = `${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${country}/tickers/industries/${industryKey}`;
    tags = [getCacheTagForIndustry(industryKey)];
  }

  try {
    const res = await fetch(url, { next: { tags, revalidate: TWO_DAYS } });
    if (!res.ok) return null;

    return (await res.json()) as SubIndustriesResponse;
  } catch (e) {
    console.error(e);
    return null;
  }
}
