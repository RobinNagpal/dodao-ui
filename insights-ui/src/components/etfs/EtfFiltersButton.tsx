'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';

import {
  ETF_AUM_OPTIONS,
  ETF_EXPENSE_RATIO_OPTIONS,
  ETF_PE_RATIO_OPTIONS,
  ETF_DIVIDEND_TTM_OPTIONS,
  ETF_PAYOUT_FREQUENCY_OPTIONS,
  ETF_SHARES_OUT_OPTIONS,
  ETF_HOLDINGS_OPTIONS,
  ETF_SHARPE_RATIO_OPTIONS,
  ETF_SORTINO_RATIO_OPTIONS,
  MOR_ADVANCED_FILTERS,
  getAppliedEtfFilters,
  buildInitialEtfSelected,
  applySelectedEtfFiltersToParams,
  EtfFilterParamKey,
  type AppliedEtfFilter,
  type EtfSelectedFiltersMap,
  type ThresholdOption,
} from '@/utils/etf-filter-utils';

export default function EtfFiltersButton(): JSX.Element {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const currentFilters: AppliedEtfFilter[] = getAppliedEtfFilters(searchParams);
  const modalKey: string = JSON.stringify({ f: currentFilters, open: isModalOpen });

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium rounded-lg px-4 py-2.5 text-sm shadow-md"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Filters
        {currentFilters.length > 0 && <span className="bg-blue-500 px-2 py-0.5 font-bold rounded-full text-xs animate-pulse">{currentFilters.length}</span>}
      </button>
      {isModalOpen && (
        <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filter ETFs" fullWidth={false} className="max-w-5xl">
          <div className="px-6 py-2">
            <EtfFilterModalContent key={modalKey} initialSelected={buildInitialEtfSelected(currentFilters)} onClose={() => setIsModalOpen(false)} />
          </div>
        </FullPageModal>
      )}
    </>
  );
}

interface FilterDropdownProps {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<ThresholdOption>;
  onChange: (value: string) => void;
}

function FilterDropdown({ id, label, value, options, onChange }: FilterDropdownProps): JSX.Element {
  return (
    <div className="bg-[#374151] rounded-lg p-4">
      <label htmlFor={id} className="block text-white mb-2 text-sm">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#4B5563] text-white border border-[#6B7280] rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface EtfFilterModalContentProps {
  initialSelected: EtfSelectedFiltersMap;
  onClose: () => void;
}

function EtfFilterModalContent({ initialSelected, onClose }: EtfFilterModalContentProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedFilters, setSelectedFilters] = useState<EtfSelectedFiltersMap>(() => ({ ...initialSelected }));

  const handleChange = (paramKey: EtfFilterParamKey, value: string): void => {
    setSelectedFilters((prev) => {
      if (!value) {
        const { [paramKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [paramKey]: value };
    });
  };

  const handleClearAll = (): void => {
    setSelectedFilters({});
  };

  const handleApply = (): void => {
    const nextParams = applySelectedEtfFiltersToParams(searchParams, selectedFilters);
    const hasFilters = Object.values(selectedFilters).some((v) => v && v.length > 0);

    if (hasFilters) {
      let filteredPath = pathname;
      if (!pathname.includes('/etfs-filtered')) {
        filteredPath = pathname.replace('/etfs', '/etfs-filtered');
      }
      router.push(`${filteredPath}?${nextParams.toString()}`);
    } else {
      router.push(`${pathname}?${nextParams.toString()}`);
    }

    onClose();
  };

  const morFiltersByPeriod = [
    { period: '3 Yr', filters: MOR_ADVANCED_FILTERS.filter((f) => f.period === '3-Yr') },
    { period: '5 Yr', filters: MOR_ADVANCED_FILTERS.filter((f) => f.period === '5-Yr') },
    { period: '10 Yr', filters: MOR_ADVANCED_FILTERS.filter((f) => f.period === '10-Yr') },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Filters */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Basic Filters</h3>
        <p className="text-[#9CA3AF] text-xs mb-4">Filter ETFs by financial metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterDropdown
            id="aum"
            label="Assets Under Management (AUM)"
            value={selectedFilters[EtfFilterParamKey.AUM] || ''}
            options={ETF_AUM_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.AUM, v)}
          />
          <FilterDropdown
            id="expenseRatio"
            label="Expense Ratio"
            value={selectedFilters[EtfFilterParamKey.EXPENSE_RATIO] || ''}
            options={ETF_EXPENSE_RATIO_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.EXPENSE_RATIO, v)}
          />
          <FilterDropdown
            id="peRatio"
            label="P/E Ratio"
            value={selectedFilters[EtfFilterParamKey.PE_RATIO] || ''}
            options={ETF_PE_RATIO_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.PE_RATIO, v)}
          />
          <FilterDropdown
            id="dividendTtm"
            label="Dividend TTM"
            value={selectedFilters[EtfFilterParamKey.DIVIDEND_TTM] || ''}
            options={ETF_DIVIDEND_TTM_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.DIVIDEND_TTM, v)}
          />
          <FilterDropdown
            id="payoutFrequency"
            label="Payout Frequency"
            value={selectedFilters[EtfFilterParamKey.PAYOUT_FREQUENCY] || ''}
            options={ETF_PAYOUT_FREQUENCY_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.PAYOUT_FREQUENCY, v)}
          />
          <FilterDropdown
            id="sharesOut"
            label="Shares Outstanding"
            value={selectedFilters[EtfFilterParamKey.SHARES_OUT] || ''}
            options={ETF_SHARES_OUT_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.SHARES_OUT, v)}
          />
          <FilterDropdown
            id="holdings"
            label="Number of Holdings"
            value={selectedFilters[EtfFilterParamKey.HOLDINGS] || ''}
            options={ETF_HOLDINGS_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.HOLDINGS, v)}
          />
          <FilterDropdown
            id="sharpeRatio"
            label="Sharpe Ratio"
            value={selectedFilters[EtfFilterParamKey.SHARPE_RATIO] || ''}
            options={ETF_SHARPE_RATIO_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.SHARPE_RATIO, v)}
          />
          <FilterDropdown
            id="sortinoRatio"
            label="Sortino Ratio"
            value={selectedFilters[EtfFilterParamKey.SORTINO_RATIO] || ''}
            options={ETF_SORTINO_RATIO_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.SORTINO_RATIO, v)}
          />
        </div>
      </div>

      {/* Advanced (Morningstar) Filters */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-1">Advanced Filters</h3>
        <p className="text-[#9CA3AF] text-xs mb-4">Morningstar risk data — only ETFs with Morningstar data will be shown when these filters are active</p>

        {morFiltersByPeriod.map(({ period, filters: periodFilters }) => (
          <div key={period} className="mb-4">
            <h4 className="text-gray-300 text-xs font-medium mb-2 uppercase tracking-wider">{period}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodFilters.map((def) => (
                <FilterDropdown
                  key={def.paramKey}
                  id={def.paramKey}
                  label={def.kind === 'upside' ? 'Upside Capture' : def.kind === 'downside' ? 'Downside Capture' : 'Risk Level'}
                  value={selectedFilters[def.paramKey] || ''}
                  options={def.options}
                  onChange={(v) => handleChange(def.paramKey, v)}
                />
              ))}
            </div>
          </div>
        ))}
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
