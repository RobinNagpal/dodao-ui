'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import StockFiltersButton from '@/components/stocks/filters/StockFiltersButton';

import {
  getAppliedFilters,
  buildInitialSelected,
  applySelectedFiltersToParams,
  type AppliedFilter,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';

/** URL-driven stock filters: applying navigates to the `/stocks-filtered` variant of the current page. */
export default function FiltersButton(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentFilters: AppliedFilter[] = getAppliedFilters(searchParams);

  const onApplyFilters = (selected: SelectedFiltersMap): void => {
    const nextParams: URLSearchParams = applySelectedFiltersToParams(searchParams, selected);
    const hasFilters = Object.keys(selected).length > 0 && Object.values(selected).some((v) => v && v.length > 0);

    if (hasFilters) {
      // Navigate to the filtered version of the current page
      let filteredPath = pathname;

      // Convert static page paths to filtered paths
      if (!pathname.includes('/stocks-filtered')) {
        filteredPath = pathname.replace('/stocks', '/stocks-filtered');
      }

      router.push(`${filteredPath}?${nextParams.toString()}`);
    } else {
      // If no filters, just update the query params
      router.push(`${pathname}?${nextParams.toString()}`);
    }
  };

  return <StockFiltersButton selected={buildInitialSelected(currentFilters)} onApply={onApplyFilters} activeCount={currentFilters.length} />;
}
