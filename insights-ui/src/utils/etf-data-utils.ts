import { getEtfListingData } from '@/app/api/[spaceId]/etfs-v1/listing/listing-prisma';
import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { hasEtfFiltersApplied, hasEtfSortApplied, etfToSortedQueryString, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfListingFilterableTag, ONE_WEEK_IN_SECONDS } from '@/utils/etf-cache-utils';
import { isEtfAdminViewer } from '@/utils/etf-listing-visibility';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { ssrCachedData, ssrRequestData } from '@/utils/ssr-data-cache';

/**
 * Fetch the filter-aware listing data for category/asset-class/provider/country-root
 * pages. Cached by country with a 1-week TTL when no filters/page params are
 * applied. With filters applied, the load is intentionally uncached so chip
 * combinations don't fill the data cache with per-filter entries.
 *
 * Loads in-process via the same loader the `/etfs-v1/listing` API route uses
 * (no HTTP self-fetch), with the same query string the page used to send.
 */
export async function fetchEtfListingData(searchParams?: EtfSearchParams, country?: EtfSupportedCountry): Promise<EtfListingResponse> {
  const filters = hasEtfFiltersApplied(searchParams);
  const sortApplied = hasEtfSortApplied(searchParams);
  const hasPageOrFilters = filters || sortApplied || (searchParams?.page && searchParams.page !== '1');

  // Admins see every ETF (including ones without a generated report); everyone
  // else sees only populated ETFs. The admin path is uncached so the full set is
  // never cached under the public key.
  const isAdmin = await isEtfAdminViewer();

  const qsParts: string[] = [];
  if (hasPageOrFilters && searchParams) qsParts.push(etfToSortedQueryString(searchParams));
  if (country) qsParts.push(`country=${encodeURIComponent(country)}`);
  const qs = qsParts.filter(Boolean).join('&');
  const load = (): Promise<EtfListingResponse> => getEtfListingData(KoalaGainsSpaceId, new URLSearchParams(qs), isAdmin);

  const tagCountry = country ?? SupportedCountries.US;

  try {
    if (isAdmin || hasPageOrFilters) {
      return await ssrRequestData(load);
    }
    return await ssrCachedData(['etf-listing', country ?? ''], { tags: [getEtfListingFilterableTag(tagCountry)], revalidate: ONE_WEEK_IN_SECONDS }, load);
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
    return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };
  }
}
