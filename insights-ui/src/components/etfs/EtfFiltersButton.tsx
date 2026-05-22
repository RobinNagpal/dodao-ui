'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

import {
  ETF_AUM_OPTIONS,
  ETF_EXPENSE_RATIO_OPTIONS,
  ETF_PE_RATIO_OPTIONS,
  ETF_DIVIDEND_TTM_OPTIONS,
  ETF_DIVIDEND_YIELD_OPTIONS,
  ETF_PAYOUT_FREQUENCY_OPTIONS,
  ETF_HOLDINGS_OPTIONS,
  ETF_VOLUME_OPTIONS,
  ETF_BETA_OPTIONS,
  ETF_DIVIDEND_YEARS_OPTIONS,
  ETF_ASSET_CLASS_OPTIONS,
  ETF_ISSUER_OPTIONS,
  ETF_CATEGORY_SCORE_DEFS,
  ETF_TOTAL_SCORE_DEF,
  MOR_FIELD_KINDS,
  MOR_PERIODS,
  detectActiveMorPeriod,
  getMorFilterDef,
  getMorFilterShortLabel,
  getMorParamKey,
  getAppliedEtfFilters,
  getEtfFilterDestination,
  buildInitialEtfSelected,
  applySelectedEtfFiltersToParams,
  ADVANCED_MOR_FILTER_KEYS,
  EtfFilterParamKey,
  type AppliedEtfFilter,
  type EtfSelectedFiltersMap,
  type EtfScoreFilterDef,
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
        <FullPageModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filter ETFs" fullWidth={false} className="max-w-6xl">
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

interface ScoreTileProps {
  def: EtfScoreFilterDef;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Hero-band tile for an AI score threshold. Each tile is a card with a radio
 * group; clicking the active option a second time clears the threshold so
 * users can back out without a separate "any" radio.
 */
function ScoreTile({ def, value, onChange }: ScoreTileProps): JSX.Element {
  const isActive = value !== '';
  return (
    <div className={`rounded-lg p-3 ${isActive ? 'bg-[#3B4252] ring-1 ring-[#F59E0B]' : 'bg-[#374151]'}`}>
      <h4 className="text-white font-medium mb-2 text-sm">{def.label}</h4>
      <div className="space-y-1">
        {def.options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={def.paramKey}
              value={option.value}
              checked={value === option.value}
              onClick={() => {
                // Re-clicking the active option clears the threshold.
                if (value === option.value) onChange('');
              }}
              onChange={() => onChange(option.value)}
              className="text-[#4F46E5] focus:ring-[#4F46E5] bg-[#4B5563] border-[#6B7280] w-4 h-4"
            />
            <span className="text-[#E5E7EB] text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps): JSX.Element {
  return (
    <div>
      <h4 className="text-gray-300 text-[11px] font-semibold uppercase tracking-wider mb-2">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">{children}</div>
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
  const [morPeriod, setMorPeriod] = useState<MorPeriodKey>(() => detectActiveMorPeriod(initialSelected));
  // Auto-expand advanced section if the user already has a Mor filter applied.
  const initiallyHasMorFilter = ADVANCED_MOR_FILTER_KEYS.some((k) => Boolean(initialSelected[k]));
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(initiallyHasMorFilter);

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
      // Carry the user's selections over to the new period's paramKeys so a chosen
      // upside / downside / risk threshold doesn't silently disappear when they switch.
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
      const { path, extraParams } = getEtfFilterDestination(pathname);
      for (const [k, v] of Object.entries(extraParams)) {
        if (!nextParams.get(k)) nextParams.set(k, v);
      }
      router.push(`${path}?${nextParams.toString()}`);
    } else {
      router.push(`${pathname}?${nextParams.toString()}`);
    }

    onClose();
  };

  return (
    <div className="space-y-5">
      {/* AI Score Thresholds — hero band */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ETF_CATEGORY_SCORE_DEFS.map((def) => (
          <ScoreTile key={def.paramKey} def={def} value={selectedFilters[def.paramKey] || ''} onChange={(v) => handleChange(def.paramKey, v)} />
        ))}
        <ScoreTile
          def={ETF_TOTAL_SCORE_DEF}
          value={selectedFilters[ETF_TOTAL_SCORE_DEF.paramKey] || ''}
          onChange={(v) => handleChange(ETF_TOTAL_SCORE_DEF.paramKey, v)}
        />
      </div>

      {/* Cost & Size */}
      <SubSection title="Cost & Size">
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
        <FilterDropdown
          id="volume"
          label="Volume"
          value={selectedFilters[EtfFilterParamKey.VOLUME] || ''}
          options={ETF_VOLUME_OPTIONS}
          onChange={(v) => handleChange(EtfFilterParamKey.VOLUME, v)}
        />
      </SubSection>

      {/* Performance & Risk */}
      <SubSection title="Performance & Risk">
        <FilterDropdown
          id="peRatio"
          label="P/E Ratio"
          value={selectedFilters[EtfFilterParamKey.PE_RATIO] || ''}
          options={ETF_PE_RATIO_OPTIONS}
          onChange={(v) => handleChange(EtfFilterParamKey.PE_RATIO, v)}
        />
        <FilterDropdown
          id="beta"
          label="Beta (1Y)"
          value={selectedFilters[EtfFilterParamKey.BETA] || ''}
          options={ETF_BETA_OPTIONS}
          onChange={(v) => handleChange(EtfFilterParamKey.BETA, v)}
        />
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
      </SubSection>

      {/* Dividends */}
      <SubSection title="Dividends">
        <FilterDropdown
          id="dividendTtm"
          label="Dividend TTM"
          value={selectedFilters[EtfFilterParamKey.DIVIDEND_TTM] || ''}
          options={ETF_DIVIDEND_TTM_OPTIONS}
          onChange={(v) => handleChange(EtfFilterParamKey.DIVIDEND_TTM, v)}
        />
        <FilterDropdown
          id="dividendYield"
          label="Dividend Yield"
          value={selectedFilters[EtfFilterParamKey.DIVIDEND_YIELD] || ''}
          options={ETF_DIVIDEND_YIELD_OPTIONS}
          onChange={(v) => handleChange(EtfFilterParamKey.DIVIDEND_YIELD, v)}
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
      </SubSection>

      {/* Advanced — period-based Mor filters, collapsed by default */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="relative flex w-full items-center justify-center rounded-md bg-[#374151] hover:bg-[#3B4252] px-3 py-2"
          aria-expanded={advancedOpen}
        >
          <span className="text-gray-200 text-xs font-semibold uppercase tracking-wider">Advanced — Period-Based Risk Capture</span>
          <span className="absolute right-3 inline-flex items-center">
            {advancedOpen ? <ChevronUpIcon className="h-4 w-4 text-gray-300" /> : <ChevronDownIcon className="h-4 w-4 text-gray-300" />}
          </span>
        </button>

        {advancedOpen && (
          <div className="mt-3">
            <p className="text-[#9CA3AF] text-[11px] mb-2 text-center">
              Only ETFs with risk data are shown when these are active. Pick a time period; the three filters below apply to it.
            </p>

            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-gray-300 text-[10px] font-medium uppercase tracking-wider">Time Period:</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          </div>
        )}
      </div>

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
