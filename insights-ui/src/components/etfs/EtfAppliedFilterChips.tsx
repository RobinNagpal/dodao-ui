'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname, ReadonlyURLSearchParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { getAppliedEtfFilters, removeEtfFilterFromParams, clearAllEtfFilterParams, type AppliedEtfFilter } from '@/utils/etf-filter-utils';

interface EtfAppliedFilterChipsProps {
  className?: string;
  showClearAll?: boolean;
}

export default function EtfAppliedFilterChips({ className = '', showClearAll = true }: EtfAppliedFilterChipsProps): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentFilters: AppliedEtfFilter[] = useMemo(() => getAppliedEtfFilters(searchParams), [searchParams]);

  if (currentFilters.length === 0) return null;

  const handleRemove = (filter: AppliedEtfFilter): void => {
    const nextParams = removeEtfFilterFromParams(searchParams, filter);
    const remainingFilters = getAppliedEtfFilters(nextParams as ReadonlyURLSearchParams);

    if (remainingFilters.length === 0 && pathname.includes('/etfs-filtered')) {
      const staticPath = pathname.replace('/etfs-filtered', '/etfs');
      router.push(staticPath);
    } else {
      router.push(`${pathname}?${nextParams.toString()}`);
    }
  };

  const handleClearAll = (): void => {
    if (pathname.includes('/etfs-filtered')) {
      const staticPath = pathname.replace('/etfs-filtered', '/etfs');
      router.push(staticPath);
    } else {
      const nextParams = clearAllEtfFilterParams(searchParams);
      router.push(`?${nextParams.toString()}`);
    }
  };

  return (
    <div className={['flex flex-wrap items-center gap-3 mb-6', className].join(' ')}>
      {currentFilters.map((filter, idx) => (
        <div
          key={`${filter.type}-${idx}`}
          className="inline-flex items-center gap-2 text-black px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B]"
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
