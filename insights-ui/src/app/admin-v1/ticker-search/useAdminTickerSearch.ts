'use client';

import { AdminTickerSearchResponse } from '@/app/api/[spaceId]/tickers-v1/admin-search/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import { safeGetLocal, safeSetLocal } from '@/utils/local-storage-utils';
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
  /**
   * `localStorage` key under which the last searched selection is kept, so the
   * screen reopens with the same filters (and searches them straight away).
   */
  storageKey?: string;
}

/**
 * The stored value must be a non-empty flat string map; anything else — including
 * the `{}` left by "Clear all" — counts as "nothing stored", so the screen falls
 * back to its defaults rather than searching with no filters at all.
 */
function readStoredSelection(storageKey: string): SelectedFiltersMap | null {
  const raw: string | null = safeGetLocal(storageKey);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const entries: [string, string][] = Object.entries(parsed as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function writeStoredSelection(storageKey: string, selected: SelectedFiltersMap): void {
  safeSetLocal(storageKey, JSON.stringify(selected));
}

// Stable defaults, so the URL memo below isn't invalidated by a fresh `{}` each render.
const NO_SELECTION: SelectedFiltersMap = {};
const NO_FIXED_PARAMS: Record<string, string> = {};

export interface AdminTickerSearch {
  /** The selection the results correspond to. */
  applied: SelectedFiltersMap;
  /** Apply a new selection and load its first page. */
  search: (next: SelectedFiltersMap) => void;
  hasSearched: boolean;
  /** False only for the first frame while a remembered selection is being read from storage. */
  restored: boolean;
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
  initialSelected = NO_SELECTION,
  fixedParams = NO_FIXED_PARAMS,
  searchOnMount = false,
  storageKey,
}: UseAdminTickerSearchOptions): AdminTickerSearch {
  const [applied, setApplied] = useState<SelectedFiltersMap>(initialSelected);
  const [page, setPage] = useState<number>(1);
  // With a storage key the first search waits for the effect below, so a
  // remembered selection is searched once instead of after the defaults.
  const [hasSearched, setHasSearched] = useState<boolean>(!storageKey && searchOnMount);
  const [restored, setRestored] = useState<boolean>(!storageKey);

  // Storage is read after mount: it doesn't exist on the server render.
  useEffect(() => {
    if (!storageKey) return;
    const stored: SelectedFiltersMap | null = readStoredSelection(storageKey);
    if (stored) setApplied(stored);
    setHasSearched(stored !== null || searchOnMount);
    setRestored(true);
  }, [storageKey, searchOnMount]);

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

  const search = useCallback(
    (next: SelectedFiltersMap): void => {
      setApplied(next);
      setPage(1);
      setHasSearched(true);
      if (storageKey) writeStoredSelection(storageKey, next);
    },
    [storageKey]
  );

  return { applied, search, hasSearched, restored, page, setPage, totalPages, data, loading, reFetchData };
}
