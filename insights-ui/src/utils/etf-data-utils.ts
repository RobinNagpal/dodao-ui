import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { hasEtfFiltersApplied, etfToSortedQueryString, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfListingTag } from '@/utils/etf-cache-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export async function fetchEtfListingData(searchParams?: EtfSearchParams, country?: EtfSupportedCountry): Promise<EtfListingResponse> {
  const baseUrl = getBaseUrl();
  const filters = hasEtfFiltersApplied(searchParams);
  const hasPageOrFilters = filters || (searchParams?.page && searchParams.page !== '1');

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`;
  const qsParts: string[] = [];
  if (hasPageOrFilters && searchParams) qsParts.push(etfToSortedQueryString(searchParams));
  if (country) qsParts.push(`country=${encodeURIComponent(country)}`);
  const qs = qsParts.filter(Boolean).join('&');
  const url = qs ? `${baseUrlPath}?${qs}` : baseUrlPath;
  const tags = hasPageOrFilters || country ? [] : [getEtfListingTag()];

  try {
    const res = await fetch(url, { next: { tags } });
    if (!res.ok) return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };

    return (await res.json()) as EtfListingResponse;
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
    return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };
  }
}
