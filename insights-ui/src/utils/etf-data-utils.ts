import { EtfListingResponse } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { hasEtfFiltersApplied, etfToSortedQueryString, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfListingTag } from '@/utils/etf-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export async function fetchEtfListingData(searchParams?: EtfSearchParams): Promise<EtfListingResponse> {
  const baseUrl = getBaseUrl();
  const filters = hasEtfFiltersApplied(searchParams);
  const hasPageOrFilters = filters || (searchParams?.page && searchParams.page !== '1');

  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/etfs-v1/listing`;
  const url = hasPageOrFilters && searchParams ? `${baseUrlPath}?${etfToSortedQueryString(searchParams)}` : baseUrlPath;
  const tags = hasPageOrFilters ? [] : [getEtfListingTag()];

  try {
    const res = await fetch(url, { next: { tags } });
    if (!res.ok) return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };

    return (await res.json()) as EtfListingResponse;
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
    return { etfs: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 1, filtersApplied: filters };
  }
}
