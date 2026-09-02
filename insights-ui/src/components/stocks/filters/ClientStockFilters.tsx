'use client';

import React, { useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import AppliedFilterChip from '@/components/ui/AppliedFilterChip';
import StockFiltersButton from '@/components/stocks/filters/StockFiltersButton';
import {
  FilterParamKey,
  FilterType,
  getAppliedFiltersFromSelected,
  removeFilterFromSelected,
  type AppliedFilter,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';

interface ClientStockFiltersProps {
  /** Current selection, keyed by `FilterParamKey`. */
  selected: SelectedFiltersMap;
  onChange: (selected: SelectedFiltersMap) => void;
  /** Optional right-hand summary, e.g. "12 of 250 requests". */
  resultSummary?: string;
}

/**
 * The stock filter bar for screens that filter an already-loaded list in the
 * browser: same controls and chips as the `/stocks` pages, but the selection
 * lives in React state instead of the URL, so nothing navigates or refetches.
 */
export default function ClientStockFilters({ selected, onChange, resultSummary }: ClientStockFiltersProps): JSX.Element {
  const appliedFilters: AppliedFilter[] = useMemo<AppliedFilter[]>(() => getAppliedFiltersFromSelected(selected), [selected]);

  const searchValue: string = selected[FilterParamKey.SEARCH] ?? '';

  const handleSearchChange = (value: string): void => {
    if (!value) {
      const { [FilterParamKey.SEARCH]: _removed, ...rest } = selected;
      onChange(rest);
      return;
    }
    onChange({ ...selected, [FilterParamKey.SEARCH]: value });
  };

  // The search box already shows the search term, so it gets no chip of its own.
  const chipFilters: AppliedFilter[] = appliedFilters.filter((f) => f.type !== FilterType.SEARCH);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72 max-w-full">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by symbol or name…"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-body focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <StockFiltersButton selected={selected} onApply={onChange} activeCount={chipFilters.length} />

        {resultSummary && <span className="text-sm text-muted">{resultSummary}</span>}
      </div>

      {chipFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {chipFilters.map((filter, idx) => (
            <AppliedFilterChip key={`${filter.type}-${idx}`} label={filter.label} onRemove={() => onChange(removeFilterFromSelected(selected, filter))} />
          ))}
          {chipFilters.length > 1 && (
            <button onClick={() => onChange({})} className="text-body hover:text-heading text-sm underline" type="button">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
