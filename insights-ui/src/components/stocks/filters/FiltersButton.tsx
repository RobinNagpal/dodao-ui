'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import NumericFilterControl from '@/components/etfs/NumericFilterControl';

import {
  CATEGORY_OPTIONS,
  CATEGORY_THRESHOLD_OPTIONS,
  TOTAL_SCORE_OPTIONS,
  NUMERIC_FILTER_DEFS,
  getAppliedFilters,
  buildInitialSelected,
  applySelectedFiltersToParams,
  FilterParamKey,
  type AppliedFilter,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';

interface FiltersButtonProps {
  className?: string;
  /** Adds a subtle pulse animation when there are active filters. */
  pulseWhenActive?: boolean;
}

export default function FiltersButton({ className = '', pulseWhenActive = true }: FiltersButtonProps): JSX.Element {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const currentFilters: AppliedFilter[] = getAppliedFilters(searchParams);

  const modalKey: string = JSON.stringify({ f: currentFilters, open: isModalOpen });

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-black font-medium rounded-lg px-4 py-2.5 text-sm shadow-md `}
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Filters
        {currentFilters.length > 0 && <span className="bg-blue-500 px-2 py-0.5 font-bold rounded-full text-xs animate-pulse">{currentFilters.length}</span>}
      </button>
      {isModalOpen && (
        <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filter Tickers" fullWidth={false} className="max-w-5xl">
          <div className="px-6 py-2">
            <FilterModalContent key={modalKey} initialSelected={buildInitialSelected(currentFilters)} onClose={() => setIsModalOpen(false)} />
          </div>
        </FullPageModal>
      )}
    </>
  );
}

/** ----- Internal Modal Content ----- */

interface FilterModalContentProps {
  initialSelected: SelectedFiltersMap;
  onClose: () => void;
}

function FilterModalContent({ initialSelected, onClose }: FilterModalContentProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

    onClose();
  };

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersMap>(() => ({ ...initialSelected }));

  const handleCategoryChange = (category: (typeof CATEGORY_OPTIONS)[number], threshold: string): void => {
    setSelectedFilters(
      (prev: SelectedFiltersMap): SelectedFiltersMap => ({
        ...prev,
        [category.paramKey]: threshold,
      })
    );
  };

  const handleTotalChange = (threshold: string): void => {
    setSelectedFilters(
      (prev: SelectedFiltersMap): SelectedFiltersMap => ({
        ...prev,
        [FilterParamKey.TOTAL]: threshold,
      })
    );
  };

  const handleNumericFilterChange = (paramKey: FilterParamKey, value: string): void => {
    setSelectedFilters((prev: SelectedFiltersMap): SelectedFiltersMap => {
      if (!value) {
        const { [paramKey]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [paramKey]: value,
      };
    });
  };

  const handleClearAll = (): void => {
    setSelectedFilters({});
  };

  const handleApply = (): void => {
    onApplyFilters(selectedFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-body text-sm mb-4">Select minimum thresholds for category analysis factors and total score</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Category Filters */}
          {CATEGORY_OPTIONS.map((category) => (
            <div key={category.key} className="bg-surface-2 rounded-lg p-3">
              <h4 className="text-heading font-medium mb-2 text-sm">{category.label}</h4>
              <div className="space-y-1">
                {CATEGORY_THRESHOLD_OPTIONS.map((threshold) => (
                  <label key={threshold.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={category.key}
                      value={threshold.value}
                      checked={selectedFilters[category.paramKey] === threshold.value}
                      onChange={() => handleCategoryChange(category, threshold.value)}
                      className="text-primary focus:ring-primary bg-surface-3 border-border w-4 h-4"
                    />
                    <span className="text-body text-sm">{threshold.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Total Score */}
          <div className="bg-surface-2 rounded-lg p-3">
            <h4 className="text-heading font-medium mb-2 text-sm">Total Score</h4>
            <div className="space-y-1">
              {TOTAL_SCORE_OPTIONS.map((threshold) => (
                <label key={threshold.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="totalScore"
                    value={threshold.value}
                    checked={selectedFilters[FilterParamKey.TOTAL] === threshold.value}
                    onChange={() => handleTotalChange(threshold.value)}
                    className="text-primary focus:ring-primary bg-surface-3 border-border w-4 h-4"
                  />
                  <span className="text-body text-sm">{threshold.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Filters Section */}
      <div>
        <h3 className="text-body text-sm mb-3">Financial Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {NUMERIC_FILTER_DEFS.map((def) => (
            <NumericFilterControl
              key={def.paramKey}
              id={def.paramKey}
              label={def.label}
              value={selectedFilters[def.paramKey] || ''}
              options={def.options}
              onChange={(v) => handleNumericFilterChange(def.paramKey, v)}
              hint={def.hint}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <button onClick={handleClearAll} className="text-body hover:text-heading text-sm underline" type="button">
          Clear all filters
        </button>

        <div className="flex gap-3">
          <button onClick={onClose} className="bg-surface-2 hover:bg-surface-3 text-heading font-medium rounded-lg px-6 py-2.5 text-sm" type="button">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-black font-medium rounded-lg px-6 py-2.5 text-sm transition-all duration-200"
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
