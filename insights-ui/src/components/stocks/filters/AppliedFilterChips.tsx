'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { getAppliedFilters, removeFilterFromParams, clearAllFilterParams, type AppliedFilter } from './filter-utils';

interface AppliedFilterChipsProps {
  className?: string;
  /** Show "Clear all" when there are 2+ filters. Defaults to true. */
  showClearAll?: boolean;
}

export default function AppliedFilterChips({ className = '', showClearAll = true }: AppliedFilterChipsProps): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilters: AppliedFilter[] = useMemo<AppliedFilter[]>(() => getAppliedFilters(searchParams), [searchParams]);

  if (currentFilters.length === 0) return null;

  const handleRemove = (filter: AppliedFilter): void => {
    const nextParams: URLSearchParams = removeFilterFromParams(searchParams, filter);
    router.push(`?${nextParams.toString()}`);
  };

  const handleClearAll = (): void => {
    const nextParams: URLSearchParams = clearAllFilterParams(searchParams);
    router.push(`?${nextParams.toString()}`);
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
