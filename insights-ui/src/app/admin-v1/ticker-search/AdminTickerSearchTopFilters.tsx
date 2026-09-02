'use client';

import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import { exchangeItems } from '@/utils/countryExchangeUtils';
import { FilterParamKey, type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import { TickerSearchParamKey } from '@/utils/ticker-search-utils';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import React from 'react';

const ALL_ID = 'All';

const exchangeSelectItems: StyledSelectItem[] = [{ id: ALL_ID, label: 'All Exchanges' }, ...exchangeItems];

interface AdminTickerSearchTopFiltersProps {
  draft: SelectedFiltersMap;
  setValue: (paramKey: string, value: string) => void;
  /** When given, Industry + Sub-Industry selects are rendered from this list. */
  industries?: IndustryWithSubIndustriesAndCounts[];
  /** Further screen-specific controls, rendered under the selects. */
  children?: React.ReactNode;
}

/** The admin search form's top row: symbol/name search, exchange, and (optionally) industry + sub-industry. */
export default function AdminTickerSearchTopFilters({ draft, setValue, industries, children }: AdminTickerSearchTopFiltersProps): JSX.Element {
  const selectedIndustryKey: string = draft[TickerSearchParamKey.INDUSTRY_KEY] ?? '';
  const activeIndustries = (industries ?? []).filter((industry) => !industry.archived);
  const activeSubIndustries = activeIndustries.find((industry) => industry.industryKey === selectedIndustryKey)?.subIndustries.filter((s) => !s.archived) ?? [];

  const industrySelectItems: StyledSelectItem[] = [
    { id: ALL_ID, label: 'All Industries' },
    ...activeIndustries.map((industry) => ({ id: industry.industryKey, label: industry.name })),
  ];
  const subIndustrySelectItems: StyledSelectItem[] = [
    { id: ALL_ID, label: 'All Sub-Industries' },
    ...activeSubIndustries.map((subIndustry) => ({ id: subIndustry.subIndustryKey, label: subIndustry.name })),
  ];

  const fromSelect = (id: string | null): string => (id && id !== ALL_ID ? id : '');

  const handleIndustryChange = (id: string | null): void => {
    setValue(TickerSearchParamKey.INDUSTRY_KEY, fromSelect(id));
    // Sub-industries belong to an industry, so a new industry clears the old sub-industry.
    setValue(TickerSearchParamKey.SUB_INDUSTRY_KEY, '');
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="my-2">
          <label htmlFor="ticker-search" className="block text-sm font-semibold leading-6">
            Search
          </label>
          <input
            id="ticker-search"
            type="text"
            value={draft[FilterParamKey.SEARCH] ?? ''}
            onChange={(e) => setValue(FilterParamKey.SEARCH, e.target.value)}
            placeholder="Symbol or name…"
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-body shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <StyledSelect
          label="Exchange"
          items={exchangeSelectItems}
          selectedItemId={draft[TickerSearchParamKey.EXCHANGE] || ALL_ID}
          setSelectedItemId={(id) => setValue(TickerSearchParamKey.EXCHANGE, fromSelect(id))}
        />

        {industries && (
          <>
            <StyledSelect
              label="Industry"
              items={industrySelectItems}
              selectedItemId={selectedIndustryKey || ALL_ID}
              setSelectedItemId={handleIndustryChange}
            />
            <StyledSelect
              label="Sub-Industry"
              items={subIndustrySelectItems}
              selectedItemId={draft[TickerSearchParamKey.SUB_INDUSTRY_KEY] || ALL_ID}
              setSelectedItemId={(id) => setValue(TickerSearchParamKey.SUB_INDUSTRY_KEY, fromSelect(id))}
            />
          </>
        )}
      </div>

      {children}
    </div>
  );
}
