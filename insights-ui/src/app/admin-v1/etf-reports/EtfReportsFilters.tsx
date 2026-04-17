'use client';

import { AllExchanges } from '@/utils/countryExchangeUtils';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

export interface EtfReportsFiltersProps {
  exchange: AllExchanges | '';
  onExchangeChange: (exchange: AllExchanges | '') => void;
  availableExchanges: ReadonlyArray<AllExchanges>;
  missing: '' | 'stockAnalyze' | 'mor' | 'analysis';
  onMissingChange: (value: '' | 'stockAnalyze' | 'mor' | 'analysis') => void;
  search: string;
  onSearchChange: (value: string) => void;
}

function toExchangeItems(exchanges: ReadonlyArray<AllExchanges>): StyledSelectItem[] {
  return [{ id: 'All', label: 'All Exchanges' }, ...exchanges.map((e) => ({ id: e, label: e }))];
}

const missingItems: StyledSelectItem[] = [
  { id: 'All', label: 'All' },
  { id: 'stockAnalyze', label: 'Missing StockAnalyze' },
  { id: 'mor', label: 'Missing MorData' },
  { id: 'analysis', label: 'Missing Analysis' },
];

export default function EtfReportsFilters({
  exchange,
  onExchangeChange,
  availableExchanges,
  missing,
  onMissingChange,
  search,
  onSearchChange,
}: EtfReportsFiltersProps): JSX.Element {
  const items = toExchangeItems(availableExchanges);
  const selectedId = exchange || 'All';
  const selectedMissing = missing || 'All';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
      <div className="w-56">
        <StyledSelect
          label="Exchange"
          items={items}
          selectedItemId={selectedId}
          setSelectedItemId={(id: string | null) => onExchangeChange(id && id !== 'All' ? (id as AllExchanges) : '')}
        />
      </div>
      <div className="w-64">
        <StyledSelect
          label="Missing"
          items={missingItems}
          selectedItemId={selectedMissing}
          setSelectedItemId={(id: string | null) => onMissingChange(id && id !== 'All' ? (id as 'stockAnalyze' | 'mor' | 'analysis') : '')}
        />
      </div>
      <div className="w-80">
        <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by symbol or name…"
          className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
