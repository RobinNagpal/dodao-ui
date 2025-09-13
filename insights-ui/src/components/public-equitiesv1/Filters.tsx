'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { TickerAnalysisCategory } from '@prisma/client';

interface FilterOption {
  label: string;
  value: string;
  key: string;
}

interface AppliedFilter {
  type: 'category' | 'total';
  categoryKey?: TickerAnalysisCategory;
  threshold: number;
  label: string;
}

const categoryOptions: FilterOption[] = [
  { label: 'Business & Moat', value: 'BusinessAndMoat', key: 'BusinessAndMoat' },
  { label: 'Financial Statement Analysis', value: 'FinancialStatementAnalysis', key: 'FinancialStatementAnalysis' },
  { label: 'Past Performance', value: 'PastPerformance', key: 'PastPerformance' },
  { label: 'Future Growth', value: 'FutureGrowth', key: 'FutureGrowth' },
  { label: 'Fair Value', value: 'FairValue', key: 'FairValue' },
];

const thresholdOptions = [
  { label: '≥ 3', value: '3' },
  { label: '≥ 4', value: '4' },
  { label: '≥ 5', value: '5' },
];

const totalScoreOptions = [
  { label: '≥ 15', value: '15' },
  { label: '≥ 18', value: '18' },
  { label: '≥ 21', value: '21' },
];

interface FiltersProps {
  className?: string;
  showOnlyButton?: boolean;
  showOnlyAppliedFilters?: boolean;
}

export default function Filters({ className = '', showOnlyButton = false, showOnlyAppliedFilters = false }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse current filters from URL
  const currentFilters: AppliedFilter[] = React.useMemo(() => {
    const filters: AppliedFilter[] = [];

    // Category filters
    categoryOptions.forEach((category) => {
      const threshold = searchParams.get(`${category.key.toLowerCase()}Threshold`);
      if (threshold) {
        filters.push({
          type: 'category',
          categoryKey: category.value as TickerAnalysisCategory,
          threshold: parseInt(threshold),
          label: `${category.label} ≥ ${threshold}`,
        });
      }
    });

    // Total score filter
    const totalThreshold = searchParams.get('totalThreshold');
    if (totalThreshold) {
      filters.push({
        type: 'total',
        threshold: parseInt(totalThreshold),
        label: `Total Score ≥ ${totalThreshold}`,
      });
    }

    return filters;
  }, [searchParams]);

  const applyFilters = (newFilters: { [key: string]: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear existing filter params
    categoryOptions.forEach((category) => {
      params.delete(`${category.key.toLowerCase()}Threshold`);
    });
    params.delete('totalThreshold');

    // Apply new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`);
    setIsModalOpen(false);
  };

  const removeFilter = (filterToRemove: AppliedFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filterToRemove.type === 'category' && filterToRemove.categoryKey) {
      params.delete(`${filterToRemove.categoryKey.toLowerCase()}Threshold`);
    } else if (filterToRemove.type === 'total') {
      params.delete('totalThreshold');
    }

    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear all filter params
    categoryOptions.forEach((category) => {
      params.delete(`${category.key.toLowerCase()}Threshold`);
    });
    params.delete('totalThreshold');

    router.push(`?${params.toString()}`);
  };

  // If only showing button, return just the filter button
  if (showOnlyButton) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors duration-200 shadow-md`}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filters
          {currentFilters.length > 0 && <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{currentFilters.length}</span>}
          {currentFilters.length > 0 && <span className="relative inline-flex size-3 rounded-full bg-amber-500 animate-pulse" />}
        </button>

        {/* Filter Modal */}
        <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filter Tickers" fullWidth={false} className="max-w-5xl">
          <div className="px-6 py-2">
            <FilterModalContent currentFilters={currentFilters} onApplyFilters={applyFilters} onClose={() => setIsModalOpen(false)} />
          </div>
        </FullPageModal>
      </>
    );
  }

  // If only showing applied filters, return just the applied filters
  if (showOnlyAppliedFilters) {
    // If no filters are applied, return null to avoid taking up space
    if (currentFilters.length === 0) {
      return null;
    }

    return (
      <div className={`flex flex-wrap items-center gap-3 mb-6 ${className}`}>
        {/* Applied Filters */}
        {currentFilters.map((filter, index) => (
          <div key={index} className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1.5 rounded-full text-sm">
            <span>{filter.label}</span>
            <button onClick={() => removeFilter(filter)} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors duration-200">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Clear All Button */}
        {currentFilters.length > 1 && (
          <button onClick={clearAllFilters} className="text-[#E5E7EB] hover:text-white text-sm underline transition-colors duration-200">
            Clear all
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors duration-200 shadow-md ${
          currentFilters.length > 0 ? 'animate-pulse' : ''
        }`}
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Filters
        {currentFilters.length > 0 && <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">{currentFilters.length}</span>}
      </button>

      {/* Applied Filters */}
      {currentFilters.map((filter, index) => (
        <div key={index} className="inline-flex items-center gap-2 bg-amber-500 text-black px-3 py-1.5 rounded-full text-sm">
          <span>{filter.label}</span>
          <button onClick={() => removeFilter(filter)} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors duration-200">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Clear All Button */}
      {currentFilters.length > 1 && (
        <button onClick={clearAllFilters} className="text-[#E5E7EB] hover:text-white text-sm underline transition-colors duration-200">
          Clear all
        </button>
      )}

      {/* Filter Modal */}
      <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filter Tickers" fullWidth={false} className="max-w-5xl">
        <div className="px-6 py-2">
          <FilterModalContent currentFilters={currentFilters} onApplyFilters={applyFilters} onClose={() => setIsModalOpen(false)} />
        </div>
      </FullPageModal>
    </div>
  );
}

interface FilterModalContentProps {
  currentFilters: AppliedFilter[];
  onApplyFilters: (filters: { [key: string]: string }) => void;
  onClose: () => void;
}

function FilterModalContent({ currentFilters, onApplyFilters, onClose }: FilterModalContentProps) {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});

  // Initialize selected filters from current filters
  useEffect(() => {
    const initialFilters: { [key: string]: string } = {};

    currentFilters.forEach((filter) => {
      if (filter.type === 'category' && filter.categoryKey) {
        initialFilters[`${filter.categoryKey.toLowerCase()}Threshold`] = filter.threshold.toString();
      } else if (filter.type === 'total') {
        initialFilters['totalThreshold'] = filter.threshold.toString();
      }
    });

    setSelectedFilters(initialFilters);
  }, [currentFilters]);

  const handleCategoryChange = (categoryKey: string, threshold: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [`${categoryKey.toLowerCase()}Threshold`]: threshold,
    }));
  };

  const handleTotalChange = (threshold: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      totalThreshold: threshold,
    }));
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
  };

  const handleClearAll = () => {
    setSelectedFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Single Grid for All Filters */}
      <div>
        <p className="text-[#E5E7EB] text-sm mb-4">Select minimum thresholds for category analysis factors and total score</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Category Filters */}
          {categoryOptions.map((category) => (
            <div key={category.key} className="bg-[#374151] rounded-lg p-3">
              <h4 className="text-white font-medium mb-2 text-sm">{category.label}</h4>
              <div className="space-y-1">
                {thresholdOptions.map((threshold) => (
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

          {/* Total Score Filter - Aligned in the same grid */}
          <div className="bg-[#374151] rounded-lg p-3">
            <h4 className="text-white font-medium mb-2 text-sm">Total Score</h4>
            <div className="space-y-1">
              {totalScoreOptions.map((threshold) => (
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-[#374151]">
        <button onClick={handleClearAll} className="text-[#E5E7EB] hover:text-white text-sm underline transition-colors duration-200">
          Clear all filters
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="bg-[#374151] hover:bg-[#4B5563] text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
