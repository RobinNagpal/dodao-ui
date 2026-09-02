'use client';

import React, { useState } from 'react';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import NumericFilterControl from '@/components/etfs/NumericFilterControl';
import DateFilterControl from '@/components/ui/DateFilterControl';
import MultiSelectFilterControl from '@/components/ui/MultiSelectFilterControl';

import {
  CATEGORY_OPTIONS,
  CATEGORY_THRESHOLD_OPTIONS,
  TOTAL_SCORE_OPTIONS,
  NUMERIC_FILTER_DEFS,
  DATE_FILTER_DEFS,
  MULTI_SELECT_FILTER_DEFS,
  parseMultiSelectParam,
  FilterParamKey,
  FilterType,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';

interface StockFiltersModalProps {
  open: boolean;
  /** Filters to pre-select when the modal opens. */
  initialSelected: SelectedFiltersMap;
  /** Called with the full selection when "Apply Filters" is pressed. */
  onApply: (selected: SelectedFiltersMap) => void;
  onClose: () => void;
}

/**
 * The stock filter picker (category scores, total score, financial metrics).
 *
 * It is deliberately unaware of where the selection is stored: the URL-driven
 * stock pages push it into query params, while client-side screens (e.g. the
 * admin generation-requests page) keep it in React state.
 */
export default function StockFiltersModal({ open, initialSelected, onApply, onClose }: StockFiltersModalProps): JSX.Element | null {
  if (!open) return null;

  // Remount the content whenever the incoming selection changes so every control
  // re-hydrates from `initialSelected` instead of keeping stale local state.
  const contentKey: string = JSON.stringify(initialSelected);

  return (
    <FullPageModal open={open} onClose={onClose} title="Filter Tickers" fullWidth={false} className="max-w-5xl">
      <div className="px-6 py-2">
        <StockFiltersModalContent key={contentKey} initialSelected={initialSelected} onApply={onApply} onClose={onClose} />
      </div>
    </FullPageModal>
  );
}

interface StockFiltersModalContentProps {
  initialSelected: SelectedFiltersMap;
  onApply: (selected: SelectedFiltersMap) => void;
  onClose: () => void;
}

function StockFiltersModalContent({ initialSelected, onApply, onClose }: StockFiltersModalContentProps): JSX.Element {
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

  /** Shared by the numeric tiles and the date pickers: an empty value drops the filter. */
  const handleValueChange = (paramKey: FilterParamKey, value: string): void => {
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

  const handleMultiSelectChange = (paramKey: FilterParamKey, values: string[]): void => {
    handleValueChange(paramKey, values.join(','));
  };

  const handleClearAll = (): void => {
    setSelectedFilters({});
  };

  const handleApply = (): void => {
    onApply(selectedFilters);
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
              onChange={(v) => handleValueChange(def.paramKey, v)}
              hint={def.hint}
            />
          ))}
        </div>
      </div>

      {/* Report Date Section */}
      <div>
        <h3 className="text-body text-sm mb-1">Report Date</h3>
        <p className="text-muted text-xs mb-3">When the stock&apos;s report was last generated</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DATE_FILTER_DEFS.map((def) => {
            // Keep the two pickers from crossing over into an empty range.
            const isFrom: boolean = def.type === FilterType.REPORT_DATE_FROM;
            return (
              <DateFilterControl
                key={def.paramKey}
                id={def.paramKey}
                label={def.label}
                value={selectedFilters[def.paramKey] || ''}
                min={isFrom ? undefined : selectedFilters[FilterParamKey.REPORT_DATE_FROM] || undefined}
                max={isFrom ? selectedFilters[FilterParamKey.REPORT_DATE_TO] || undefined : undefined}
                onChange={(v) => handleValueChange(def.paramKey, v)}
              />
            );
          })}
        </div>
      </div>

      {/* Report Verdicts Section */}
      <div>
        <h3 className="text-body text-sm mb-1">Report Verdicts</h3>
        <p className="text-muted text-xs mb-3">Match stocks carrying any of the selected verdicts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MULTI_SELECT_FILTER_DEFS.map((def) => (
            <MultiSelectFilterControl
              key={def.paramKey}
              id={def.paramKey}
              label={def.label}
              options={def.options}
              value={parseMultiSelectParam(selectedFilters[def.paramKey], def)}
              onChange={(values) => handleMultiSelectChange(def.paramKey, values)}
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
