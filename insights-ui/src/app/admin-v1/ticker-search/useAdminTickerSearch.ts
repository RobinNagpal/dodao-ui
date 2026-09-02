'use client';

import { AdminTickerSearchResponse } from '@/app/api/[spaceId]/tickers-v1/admin-search/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import { buildTickerSearchQuery } from '@/utils/ticker-search-utils';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseAdminTickerSearchOptions {
  pageSize: number;
  /** Selection to start from (pre-filled in the form, and searched on mount when `searchOnMount`). */
  initialSelected?: SelectedFiltersMap;
  /** Params always sent but never shown as filters, e.g. `excludePending`. */
  fixedParams?: Record<string, string>;
  /** Run the initial selection immediately instead of waiting for the first Search. */
  searchOnMount?: boolean;
}

export interface AdminTickerSearch {
  /** The selection the results correspond to. */
  applied: SelectedFiltersMap;
  /** Apply a new selection and load its first page. */
  search: (next: SelectedFiltersMap) => void;
  hasSearched: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  data: AdminTickerSearchResponse | undefined;
  loading: boolean;
  reFetchData: () => Promise<AdminTickerSearchResponse | undefined>;
}

/**
 * Filter selection + server-side pagination for the admin ticker search endpoint.
 * The selection lives in React state only — nothing is written to the URL.
 */
export function useAdminTickerSearch({
  pageSize,
  initialSelected = {},
  fixedParams = {},
  searchOnMount = false,
}: UseAdminTickerSearchOptions): AdminTickerSearch {
  const [applied, setApplied] = useState<SelectedFiltersMap>(initialSelected);
  const [page, setPage] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState<boolean>(searchOnMount);

  const url: string = useMemo(
    () => `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/admin-search?${buildTickerSearchQuery({ ...fixedParams, ...applied }, page, pageSize)}`,
    [applied, fixedParams, page, pageSize]
  );

  const { data, loading, reFetchData } = useFetchData<AdminTickerSearchResponse>(url, { skipInitialFetch: !hasSearched }, 'Failed to search tickers');

  const totalPages: number = Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  // A refetch (e.g. after generating reports) can shrink the result set below
  // the page the user is on; snap back into range so they never see an empty page.
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages);
  }, [data, page, totalPages]);

  const search = useCallback((next: SelectedFiltersMap): void => {
    setApplied(next);
    setPage(1);
    setHasSearched(true);
  }, []);

  return { applied, search, hasSearched, page, setPage, totalPages, data, loading, reFetchData };
}
