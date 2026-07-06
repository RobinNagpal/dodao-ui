'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname, ReadonlyURLSearchParams } from 'next/navigation';

import AppliedFilterChip from '@/components/ui/AppliedFilterChip';
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
        <AppliedFilterChip key={`${filter.type}-${idx}`} label={filter.label} onRemove={() => handleRemove(filter)} />
      ))}

      {showClearAll && currentFilters.length > 1 && (
        <button onClick={handleClearAll} className="text-body hover:text-heading text-sm underline" type="button">
          Clear all
        </button>
      )}
    </div>
  );
}
