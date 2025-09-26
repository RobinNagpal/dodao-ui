'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';

import {
  CATEGORY_OPTIONS,
  CATEGORY_THRESHOLD_OPTIONS,
  TOTAL_SCORE_OPTIONS,
  getAppliedFilters,
  buildInitialSelected,
  applySelectedFiltersToParams,
  type AppliedFilter,
  type SelectedFiltersMap,
} from './filter-utils';

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
  console.log('Rendering filter button');

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium rounded-lg px-4 py-2.5 text-sm shadow-md `}
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

  const onApplyFilters = (selected: SelectedFiltersMap): void => {
    const nextParams: URLSearchParams = applySelectedFiltersToParams(searchParams, selected);
    router.push(`?${nextParams.toString()}`);
    onClose();
  };

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersMap>(() => ({ ...initialSelected }));

  const handleCategoryChange = (categoryKey: string, threshold: string): void => {
    setSelectedFilters(
      (prev: SelectedFiltersMap): SelectedFiltersMap => ({
        ...prev,
        [`${categoryKey.toLowerCase()}Threshold`]: threshold,
      })
    );
  };

  const handleTotalChange = (threshold: string): void => {
    setSelectedFilters(
      (prev: SelectedFiltersMap): SelectedFiltersMap => ({
        ...prev,
        totalThreshold: threshold,
      })
    );
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
        <p className="text-[#E5E7EB] text-sm mb-4">Select minimum thresholds for category analysis factors and total score</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Category Filters */}
          {CATEGORY_OPTIONS.map((category) => (
            <div key={category.key} className="bg-[#374151] rounded-lg p-3">
              <h4 className="text-white font-medium mb-2 text-sm">{category.label}</h4>
              <div className="space-y-1">
                {CATEGORY_THRESHOLD_OPTIONS.map((threshold) => (
                  <label key={threshold.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={category.key}
                      value={threshold.value}
                      checked={selectedFilters[`${category.key.toLowerCase()}Threshold`] === threshold.value}
                      onChange={() => handleCategoryChange(category.key, threshold.value)}
                      className="text-[#4F46E5] focus:ring-[#4F46E5] bg-[#4B5563] border-[#6B7280] w-4 h-4"
                    />
                    <span className="text-[#E5E7EB] text-sm">{threshold.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Total Score */}
          <div className="bg-[#374151] rounded-lg p-3">
            <h4 className="text-white font-medium mb-2 text-sm">Total Score</h4>
            <div className="space-y-1">
              {TOTAL_SCORE_OPTIONS.map((threshold) => (
                <label key={threshold.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="totalScore"
                    value={threshold.value}
                    checked={selectedFilters['totalThreshold'] === threshold.value}
                    onChange={() => handleTotalChange(threshold.value)}
                    className="text-[#4F46E5] focus:ring-[#4F46E5] bg-[#4B5563] border-[#6B7280] w-4 h-4"
                  />
                  <span className="text-[#E5E7EB] text-sm">{threshold.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-[#374151]">
        <button onClick={handleClearAll} className="text-[#E5E7EB] hover:text-white text-sm underline" type="button">
          Clear all filters
        </button>

        <div className="flex gap-3">
          <button onClick={onClose} className="bg-[#374151] hover:bg-[#4B5563] text-white font-medium rounded-lg px-6 py-2.5 text-sm" type="button">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium rounded-lg px-6 py-2.5 text-sm transition-all duration-200"
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
