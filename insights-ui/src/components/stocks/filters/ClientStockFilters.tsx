'use client';

import React, { useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import AppliedFilterChip from '@/components/ui/AppliedFilterChip';
import StockFiltersButton from '@/components/stocks/filters/StockFiltersButton';
import { type StockFiltersTopSection } from '@/components/stocks/filters/StockFiltersModal';
import {
  FilterParamKey,
  FilterType,
  getAppliedFiltersFromSelected,
  removeFilterFromSelected,
  type AppliedFilter,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';

/** A chip for a screen-specific key the shared filter utils don't know about. */
export interface ExtraFilterChip {
  paramKey: string;
  label: string;
}

interface ClientStockFiltersProps {
  /** Current selection, keyed by `FilterParamKey` (plus any screen-specific keys). */
  selected: SelectedFiltersMap;
  onChange: (selected: SelectedFiltersMap) => void;
  /** Optional right-hand summary, e.g. "12 of 250 requests". */
  resultSummary?: string;
  /** Screen-specific controls rendered at the top of the filter modal. */
  topSection?: StockFiltersTopSection;
  /** Label of the modal's apply button; defaults to "Apply Filters". */
  applyLabel?: string;
  /** Chips for screen-specific keys; removing one drops that key. */
  extraChips?: ReadonlyArray<ExtraFilterChip>;
  /**
   * The inline search box filters on every keystroke, which suits in-memory
   * lists. Screens that search a server on apply put the search field in the
   * modal instead and turn this off; the search term then shows as a chip.
   */
  showSearchBox?: boolean;
}

/**
 * The stock filter bar for screens that keep the selection in React state
 * instead of the URL: the same controls and chips as the `/stocks` pages, but
 * nothing navigates.
 */
export default function ClientStockFilters({
  selected,
  onChange,
  resultSummary,
  topSection,
  applyLabel,
  extraChips = [],
  showSearchBox = true,
}: ClientStockFiltersProps): JSX.Element {
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

  const handleRemoveExtra = (paramKey: string): void => {
    const { [paramKey]: _removed, ...rest } = selected;
    onChange(rest);
  };

  // A visible search box already shows the search term, so it gets no chip of its own.
  const chipFilters: AppliedFilter[] = showSearchBox ? appliedFilters.filter((f) => f.type !== FilterType.SEARCH) : appliedFilters;
  const chipCount: number = chipFilters.length + extraChips.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {showSearchBox && (
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
        )}

        <StockFiltersButton selected={selected} onApply={onChange} activeCount={chipCount} topSection={topSection} applyLabel={applyLabel} />

        {resultSummary && <span className="text-sm text-muted">{resultSummary}</span>}
      </div>

      {chipCount > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {extraChips.map((chip) => (
            <AppliedFilterChip key={chip.paramKey} label={chip.label} onRemove={() => handleRemoveExtra(chip.paramKey)} />
          ))}
          {chipFilters.map((filter, idx) => (
            <AppliedFilterChip key={`${filter.type}-${idx}`} label={filter.label} onRemove={() => onChange(removeFilterFromSelected(selected, filter))} />
          ))}
          {chipCount > 1 && (
            <button onClick={() => onChange({})} className="text-body hover:text-heading text-sm underline" type="button">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
