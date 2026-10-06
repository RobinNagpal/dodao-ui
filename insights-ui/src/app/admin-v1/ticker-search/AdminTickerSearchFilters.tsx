'use client';

import ClientStockFilters, { type ExtraFilterChip } from '@/components/stocks/filters/ClientStockFilters';
import { StockFiltersPanel, type StockFiltersTopSection } from '@/components/stocks/filters/StockFiltersModal';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import React from 'react';

interface AdminTickerSearchFiltersProps {
  applied: SelectedFiltersMap;
  hasSearched: boolean;
  onSearch: (selected: SelectedFiltersMap) => void;
  topSection: StockFiltersTopSection;
  extraChips: ReadonlyArray<ExtraFilterChip>;
  resultSummary?: string;
}

/**
 * Before the first search the whole form (screen-specific filters on top, the
 * shared stock filters below) sits inline with a Search button. Once results
 * are showing it collapses into the Filters button + chips the /stocks pages
 * use, and the same form reopens in a modal.
 */
export default function AdminTickerSearchFilters({
  applied,
  hasSearched,
  onSearch,
  topSection,
  extraChips,
  resultSummary,
}: AdminTickerSearchFiltersProps): JSX.Element {
  if (!hasSearched) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <StockFiltersPanel initialSelected={applied} onApply={onSearch} topSection={topSection} applyLabel="Search" />
      </div>
    );
  }

  return (
    <ClientStockFilters
      selected={applied}
      onChange={onSearch}
      topSection={topSection}
      applyLabel="Search"
      extraChips={extraChips}
      showSearchBox={false}
      resultSummary={resultSummary}
    />
  );
}
