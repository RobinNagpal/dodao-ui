import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { hasEtfFiltersApplied, hasEtfSortApplied, etfToSortedQueryString, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfListingFilterableTag, ONE_WEEK_IN_SECONDS } from '@/utils/etf-cache-utils';
import { INCLUDE_UNPOPULATED_PARAM, isEtfAdminViewer } from '@/utils/etf-listing-visibility';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { headers } from 'next/headers';

/**
 * Fetch the filter-aware listing data for category/asset-class/provider/country-root
 * pages. Cached by country with a 1-week TTL when no filters/page params are
 * applied. With filters applied, the fetch is intentionally uncached so chip
 * combinations don't fill the data cache with per-filter entries.
 */
export async function fetchEtfListingData(searchParams?: EtfSearchParams, country?: EtfSupportedCountry): Promise<EtfListingResponse> {
  const baseUrl = getBaseUrlForServerSidePages();
  const filters = hasEtfFiltersApplied(searchParams);
  const sortApplied = hasEtfSortApplied(searchParams);
  const hasPageOrFilters = filters || sortApplied || (searchParams?.page && searchParams.page !== '1');

  // Admins see every ETF (including ones without a generated report); everyone
  // else sees only populated ETFs. The admin path is cookie-authenticated and
  // uncached so the full set is never cached under the public key.
  const isAdmin = await isEtfAdminViewer();

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`;
  const qsParts: string[] = [];
  if (hasPageOrFilters && searchParams) qsParts.push(etfToSortedQueryString(searchParams));
  if (country) qsParts.push(`country=${encodeURIComponent(country)}`);
  if (isAdmin) qsParts.push(`${INCLUDE_UNPOPULATED_PARAM}=true`);
  const qs = qsParts.filter(Boolean).join('&');
  const url = qs ? `${baseUrlPath}?${qs}` : baseUrlPath;

  const tagCountry = country ?? SupportedCountries.US;
  let cacheConfig: RequestInit & { next?: { revalidate?: number; tags?: string[] } };
  if (isAdmin) {
    const cookieHeader = (await headers()).get('cookie');
    cacheConfig = { cache: 'no-store', headers: cookieHeader ? { cookie: cookieHeader } : {} };
  } else if (hasPageOrFilters) {
    cacheConfig = { next: { revalidate: 0 } };
  } else {
    cacheConfig = { next: { revalidate: ONE_WEEK_IN_SECONDS, tags: [getEtfListingFilterableTag(tagCountry)] } };
  }

  try {
    const res = await fetch(url, cacheConfig);
    if (!res.ok) return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };

    return (await res.json()) as EtfListingResponse;
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
    return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };
  }
}
