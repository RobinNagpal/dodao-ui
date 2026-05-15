'use client';

import React, { ReactNode, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname, ReadonlyURLSearchParams } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/20/solid';

import {
  ETF_AUM_OPTIONS,
  ETF_EXPENSE_RATIO_OPTIONS,
  ETF_PE_RATIO_OPTIONS,
  ETF_DIVIDEND_TTM_OPTIONS,
  ETF_DIVIDEND_YIELD_OPTIONS,
  ETF_PAYOUT_FREQUENCY_OPTIONS,
  ETF_SHARES_OUT_OPTIONS,
  ETF_HOLDINGS_OPTIONS,
  ETF_SHARPE_RATIO_OPTIONS,
  ETF_SORTINO_RATIO_OPTIONS,
  ETF_BETA_OPTIONS,
  ETF_RSI_OPTIONS,
  ETF_DIVIDEND_YEARS_OPTIONS,
  ETF_ASSET_CLASS_OPTIONS,
  ETF_ISSUER_OPTIONS,
  ETF_SCORE_FILTERS,
  MOR_FIELD_KINDS,
  MOR_PERIODS,
  detectActiveMorPeriod,
  getMorFilterDef,
  getMorFilterShortLabel,
  getMorParamKey,
  getAppliedEtfFilters,
  buildInitialEtfSelected,
  applySelectedEtfFiltersToParams,
  EtfFilterParamKey,
  type AppliedEtfFilter,
  type EtfSelectedFiltersMap,
  type MorPeriodKey,
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
          <div className="px-4 py-2">
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
  const isActive = value !== '';
  return (
    <div className={`rounded p-2 ${isActive ? 'bg-[#3B4252] ring-1 ring-[#F59E0B]' : 'bg-[#374151]'}`}>
      <label htmlFor={id} className="block text-gray-300 mb-1 text-xs truncate" title={label}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#4B5563] text-white border border-[#6B7280] rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-[#4F46E5] focus:border-transparent"
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

interface ScoreFilterRowProps {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<ThresholdOption>;
  onChange: (value: string) => void;
}

function ScoreFilterRow({ id, label, value, options, onChange }: ScoreFilterRowProps): JSX.Element {
  const isActive = value !== '';
  return (
    <div className={`rounded-md p-3 ${isActive ? 'bg-[#3B4252] ring-1 ring-[#F59E0B]' : 'bg-[#374151]'}`}>
      <div className="text-white text-sm font-medium mb-2">{label}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {options.map((option) => (
          <label key={`${id}-${option.value || 'any'}`} className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="text-[#4F46E5] focus:ring-[#4F46E5] bg-[#4B5563] border-[#6B7280] w-4 h-4"
            />
            <span className="text-[#E5E7EB]">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  helpText?: string;
  /** Param keys whose presence in `selectedFilters` should make this section "active" (shown count + auto-open). */
  paramKeys: ReadonlyArray<string>;
  selectedFilters: EtfSelectedFiltersMap;
  defaultOpen: boolean;
  children: ReactNode;
}

function FilterSection({ title, helpText, paramKeys, selectedFilters, defaultOpen, children }: FilterSectionProps): JSX.Element {
  const activeCount = paramKeys.reduce((count, key) => (selectedFilters[key] ? count + 1 : count), 0);
  const isOpen = defaultOpen || activeCount > 0;
  return (
    <details open={isOpen} className="bg-[#1F2937] border border-[#374151] rounded-md group">
      <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between hover:bg-[#2D3748] rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{title}</span>
          {activeCount > 0 && <span className="bg-[#F59E0B] text-black text-[10px] font-bold rounded-full px-2 py-0.5">{activeCount} active</span>}
        </div>
        <span className="text-gray-400 text-xs transition-transform group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="px-3 pb-3 pt-1 border-t border-[#374151] space-y-2">
        {helpText && <p className="text-[#9CA3AF] text-[10px]">{helpText}</p>}
        {children}
      </div>
    </details>
  );
}

interface ModalChipStripProps {
  filters: ReadonlyArray<AppliedEtfFilter>;
  onRemove: (filter: AppliedEtfFilter) => void;
  onClearAll: () => void;
}

function ModalChipStrip({ filters, onRemove, onClearAll }: ModalChipStripProps): JSX.Element | null {
  if (filters.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-[#374151]">
      <span className="text-[#9CA3AF] text-[11px] uppercase tracking-wider font-medium mr-1">Active</span>
      {filters.map((filter, idx) => (
        <span
          key={`${filter.type}-${idx}`}
          className="inline-flex items-center gap-1.5 text-black px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemove(filter)}
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
            aria-label={`Remove ${filter.label}`}
            type="button"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button onClick={onClearAll} className="text-[#E5E7EB] hover:text-white text-xs underline ml-1" type="button">
          Clear all
        </button>
      )}
    </div>
  );
}

interface EtfFilterModalContentProps {
  initialSelected: EtfSelectedFiltersMap;
  onClose: () => void;
}

const SCORE_KEYS: ReadonlyArray<string> = ETF_SCORE_FILTERS.map((f) => f.paramKey);
const COST_SIZE_KEYS: ReadonlyArray<string> = [EtfFilterParamKey.AUM, EtfFilterParamKey.EXPENSE_RATIO, EtfFilterParamKey.HOLDINGS];
const INCOME_KEYS: ReadonlyArray<string> = [
  EtfFilterParamKey.DIVIDEND_YIELD,
  EtfFilterParamKey.DIVIDEND_TTM,
  EtfFilterParamKey.PAYOUT_FREQUENCY,
  EtfFilterParamKey.DIVIDEND_YEARS,
];
const RISK_PERF_KEYS: ReadonlyArray<string> = [
  EtfFilterParamKey.BETA,
  EtfFilterParamKey.PE_RATIO,
  EtfFilterParamKey.SHARPE_RATIO,
  EtfFilterParamKey.SORTINO_RATIO,
  EtfFilterParamKey.RSI,
  EtfFilterParamKey.SHARES_OUT,
];
const CATEGORIZATION_KEYS: ReadonlyArray<string> = [EtfFilterParamKey.ASSET_CLASS, EtfFilterParamKey.ISSUER];
const MOR_KEYS: ReadonlyArray<string> = [
  EtfFilterParamKey.MOR_UPSIDE_3YR,
  EtfFilterParamKey.MOR_UPSIDE_5YR,
  EtfFilterParamKey.MOR_UPSIDE_10YR,
  EtfFilterParamKey.MOR_DOWNSIDE_3YR,
  EtfFilterParamKey.MOR_DOWNSIDE_5YR,
  EtfFilterParamKey.MOR_DOWNSIDE_10YR,
  EtfFilterParamKey.MOR_RISK_3YR,
  EtfFilterParamKey.MOR_RISK_5YR,
  EtfFilterParamKey.MOR_RISK_10YR,
];

function EtfFilterModalContent({ initialSelected, onClose }: EtfFilterModalContentProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedFilters, setSelectedFilters] = useState<EtfSelectedFiltersMap>(() => ({ ...initialSelected }));
  const [morPeriod, setMorPeriod] = useState<MorPeriodKey>(() => detectActiveMorPeriod(initialSelected));

  const handleChange = (paramKey: EtfFilterParamKey, value: string): void => {
    setSelectedFilters((prev) => {
      if (!value) {
        const { [paramKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [paramKey]: value };
    });
  };

  const handlePeriodChange = (newPeriod: MorPeriodKey): void => {
    if (newPeriod === morPeriod) return;
    setSelectedFilters((prev) => {
      const next = { ...prev };
      for (const kind of MOR_FIELD_KINDS) {
        const oldKey = getMorParamKey(kind, morPeriod);
        const newKey = getMorParamKey(kind, newPeriod);
        const value = prev[oldKey];
        delete next[oldKey];
        if (value) next[newKey] = value;
        else delete next[newKey];
      }
      return next;
    });
    setMorPeriod(newPeriod);
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

  // Live preview of the chip strip (uses the modal's *unsaved* state) so users can see and
  // remove any active selection regardless of which section it lives in.
  const liveFilters = useMemo<AppliedEtfFilter[]>(() => {
    const previewParams = applySelectedEtfFiltersToParams(searchParams, selectedFilters);
    return getAppliedEtfFilters(previewParams as unknown as ReadonlyURLSearchParams);
  }, [searchParams, selectedFilters]);

  const removeFromSelected = (filter: AppliedEtfFilter): void => {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      delete next[filter.paramKey];
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <ModalChipStrip filters={liveFilters} onRemove={removeFromSelected} onClearAll={handleClearAll} />

      {/* KoalaGains Scores */}
      <FilterSection
        title="KoalaGains Scores"
        helpText="Per-category pass count (0–5) and total score (0–20) from the KoalaGains ETF analysis pipeline. Only ETFs with a generated report are scored."
        paramKeys={SCORE_KEYS}
        selectedFilters={selectedFilters}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ETF_SCORE_FILTERS.map((def) => (
            <ScoreFilterRow
              key={def.paramKey}
              id={def.paramKey}
              label={def.label}
              value={selectedFilters[def.paramKey] || ''}
              options={[{ label: 'Any', value: '' }, ...def.options.filter((o) => o.value !== '')]}
              onChange={(v) => handleChange(def.paramKey, v)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Cost & Size */}
      <FilterSection title="Cost & Size" paramKeys={COST_SIZE_KEYS} selectedFilters={selectedFilters} defaultOpen={true}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <FilterDropdown
            id="aum"
            label="AUM"
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
            id="holdings"
            label="Holdings"
            value={selectedFilters[EtfFilterParamKey.HOLDINGS] || ''}
            options={ETF_HOLDINGS_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.HOLDINGS, v)}
          />
        </div>
      </FilterSection>

      {/* Income & Distribution */}
      <FilterSection title="Income & Distribution" paramKeys={INCOME_KEYS} selectedFilters={selectedFilters} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <FilterDropdown
            id="dividendYield"
            label="Dividend Yield"
            value={selectedFilters[EtfFilterParamKey.DIVIDEND_YIELD] || ''}
            options={ETF_DIVIDEND_YIELD_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.DIVIDEND_YIELD, v)}
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
            id="dividendYears"
            label="Dividend Years"
            value={selectedFilters[EtfFilterParamKey.DIVIDEND_YEARS] || ''}
            options={ETF_DIVIDEND_YEARS_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.DIVIDEND_YEARS, v)}
          />
        </div>
      </FilterSection>

      {/* Risk & Performance */}
      <FilterSection title="Risk & Performance" paramKeys={RISK_PERF_KEYS} selectedFilters={selectedFilters} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <FilterDropdown
            id="beta"
            label="Beta (1Y)"
            value={selectedFilters[EtfFilterParamKey.BETA] || ''}
            options={ETF_BETA_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.BETA, v)}
          />
          <FilterDropdown
            id="peRatio"
            label="P/E Ratio"
            value={selectedFilters[EtfFilterParamKey.PE_RATIO] || ''}
            options={ETF_PE_RATIO_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.PE_RATIO, v)}
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
          <FilterDropdown
            id="rsi"
            label="RSI"
            value={selectedFilters[EtfFilterParamKey.RSI] || ''}
            options={ETF_RSI_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.RSI, v)}
          />
          <FilterDropdown
            id="sharesOut"
            label="Shares Outstanding"
            value={selectedFilters[EtfFilterParamKey.SHARES_OUT] || ''}
            options={ETF_SHARES_OUT_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.SHARES_OUT, v)}
          />
        </div>
      </FilterSection>

      {/* Categorization */}
      <FilterSection title="Categorization" paramKeys={CATEGORIZATION_KEYS} selectedFilters={selectedFilters} defaultOpen={true}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <FilterDropdown
            id="assetClass"
            label="Asset Class"
            value={selectedFilters[EtfFilterParamKey.ASSET_CLASS] || ''}
            options={ETF_ASSET_CLASS_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.ASSET_CLASS, v)}
          />
          <FilterDropdown
            id="issuer"
            label="Issuer"
            value={selectedFilters[EtfFilterParamKey.ISSUER] || ''}
            options={ETF_ISSUER_OPTIONS}
            onChange={(v) => handleChange(EtfFilterParamKey.ISSUER, v)}
          />
        </div>
      </FilterSection>

      {/* Advanced (Mor) */}
      <FilterSection
        title="Advanced (Mor)"
        helpText="Restricts to ETFs with Mor data. Pick a time period; the three filters below apply to it."
        paramKeys={MOR_KEYS}
        selectedFilters={selectedFilters}
        defaultOpen={false}
      >
        <div className="mb-3">
          <span className="text-gray-300 text-[10px] font-medium uppercase tracking-wider mr-2">Time Period:</span>
          <div className="inline-flex gap-1.5">
            {MOR_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                type="button"
                aria-pressed={morPeriod === p}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  morPeriod === p ? 'bg-[#F59E0B] text-black' : 'bg-[#374151] text-gray-300 hover:bg-[#4B5563]'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MOR_FIELD_KINDS.map((kind) => {
            const def = getMorFilterDef(kind, morPeriod);
            return (
              <FilterDropdown
                key={def.paramKey}
                id={def.paramKey}
                label={getMorFilterShortLabel(kind)}
                value={selectedFilters[def.paramKey] || ''}
                options={def.options}
                onChange={(v) => handleChange(def.paramKey, v)}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-[#374151]">
        <button onClick={handleClearAll} className="text-[#E5E7EB] hover:text-white text-xs underline" type="button">
          Clear all filters
        </button>

        <div className="flex gap-3">
          <button onClick={onClose} className="bg-[#374151] hover:bg-[#4B5563] text-white font-medium rounded-lg px-5 py-2 text-xs" type="button">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium rounded-lg px-5 py-2 text-xs transition-all duration-200"
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
