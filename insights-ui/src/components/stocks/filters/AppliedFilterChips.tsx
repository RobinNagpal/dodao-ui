'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname, ReadonlyURLSearchParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { getAppliedFilters, removeFilterFromParams, clearAllFilterParams, type AppliedFilter } from '@/utils/ticker-filter-utils';

interface AppliedFilterChipsProps {
  className?: string;
  /** Show "Clear all" when there are 2+ filters. Defaults to true. */
  showClearAll?: boolean;
}

export default function AppliedFilterChips({ className = '', showClearAll = true }: AppliedFilterChipsProps): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentFilters: AppliedFilter[] = useMemo<AppliedFilter[]>(() => getAppliedFilters(searchParams), [searchParams]);

  if (currentFilters.length === 0) return null;

  const handleRemove = (filter: AppliedFilter): void => {
    const nextParams: URLSearchParams = removeFilterFromParams(searchParams, filter);

    // Check if this is the last filter being removed
    const remainingFilters = getAppliedFilters(nextParams as ReadonlyURLSearchParams);

    if (remainingFilters.length === 0 && pathname.includes('/stocks-filtered')) {
      // Navigate back to the static page when removing the last filter
      const staticPath = pathname.replace('/stocks-filtered', '/stocks');
      router.push(staticPath);
    } else {
      // Just update the query params
      router.push(`${pathname}?${nextParams.toString()}`);
    }
  };

  const handleClearAll = (): void => {
    // Navigate back to the static page when clearing all filters
    if (pathname.includes('/stocks-filtered')) {
      const staticPath = pathname.replace('/stocks-filtered', '/stocks');
      router.push(staticPath);
    } else {
      const nextParams: URLSearchParams = clearAllFilterParams(searchParams);
      router.push(`?${nextParams.toString()}`);
    }
  };

  return (
    <div className={['flex flex-wrap items-center gap-3 mb-6', className].join(' ')}>
      {currentFilters.map((filter, idx) => (
        <div
          key={`${filter.type}-${idx}`}
          className="inline-flex items-center gap-2  text-black px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B]"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => handleRemove(filter)}
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
            aria-label={`Remove ${filter.label}`}
            type="button"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {showClearAll && currentFilters.length > 1 && (
        <button onClick={handleClearAll} className="text-[#E5E7EB] hover:text-white text-sm underline" type="button">
          Clear all
        </button>
      )}
    </div>
  );
}
