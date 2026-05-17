import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { hasEtfFiltersApplied, etfToSortedQueryString, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfListingFilterableTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/**
 * Fetch the filter-aware listing data for category/asset-class/provider/country-root
 * pages. Cached by country with a 2-week TTL when no filters/page params are
 * applied. With filters applied, the fetch is intentionally uncached so chip
 * combinations don't fill the data cache with per-filter entries.
 */
export async function fetchEtfListingData(searchParams?: EtfSearchParams, country?: EtfSupportedCountry): Promise<EtfListingResponse> {
  const baseUrl = getBaseUrlForServerSidePages();
  const filters = hasEtfFiltersApplied(searchParams);
  const hasPageOrFilters = filters || (searchParams?.page && searchParams.page !== '1');

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`;
  const qsParts: string[] = [];
  if (hasPageOrFilters && searchParams) qsParts.push(etfToSortedQueryString(searchParams));
  if (country) qsParts.push(`country=${encodeURIComponent(country)}`);
  const qs = qsParts.filter(Boolean).join('&');
  const url = qs ? `${baseUrlPath}?${qs}` : baseUrlPath;

  const tagCountry = country ?? SupportedCountries.US;
  const cacheConfig = hasPageOrFilters
    ? { next: { revalidate: 0 as const } }
    : { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfListingFilterableTag(tagCountry)] } };

  try {
    const res = await fetch(url, cacheConfig);
    if (!res.ok) return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };

    return (await res.json()) as EtfListingResponse;
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
    return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };
  }
}
