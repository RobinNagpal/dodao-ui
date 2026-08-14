'use client';

import { AllExchanges } from '@/utils/countryExchangeUtils';
import { ETF_OTHERS_GROUP, ETF_OTHERS_GROUP_KEY, getAllEtfCategories, getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

export interface EtfReportsFiltersProps {
  exchange: AllExchanges | '';
  onExchangeChange: (exchange: AllExchanges | '') => void;
  availableExchanges: ReadonlyArray<AllExchanges>;
  group: string;
  onGroupChange: (groupKey: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  missing: '' | 'stockAnalyze' | 'mor' | 'analysis';
  onMissingChange: (value: '' | 'stockAnalyze' | 'mor' | 'analysis') => void;
  search: string;
  onSearchChange: (value: string) => void;
  updatedBefore: string;
  onUpdatedBeforeChange: (value: string) => void;
}

function toExchangeItems(exchanges: ReadonlyArray<AllExchanges>): StyledSelectItem[] {
  return [{ id: 'All', label: 'All Exchanges' }, ...exchanges.map((e) => ({ id: e, label: e }))];
}

const groupItems: StyledSelectItem[] = [
  { id: 'All', label: 'All Groups' },
  ...getAllEtfGroups().map((g) => ({ id: g.key, label: g.name })),
  { id: ETF_OTHERS_GROUP_KEY, label: ETF_OTHERS_GROUP.name },
];

function toCategoryItems(groupKey: string): StyledSelectItem[] {
  // "Others" is the bucket for ETFs with no category, so it has no category list.
  const categories = groupKey === ETF_OTHERS_GROUP_KEY ? [] : groupKey ? getCategoriesForGroupKey(groupKey) : getAllEtfCategories();
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  return [{ id: 'All', label: 'All Categories' }, ...sorted.map((c) => ({ id: c.name, label: c.name }))];
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
  group,
  onGroupChange,
  category,
  onCategoryChange,
  missing,
  onMissingChange,
  search,
  onSearchChange,
  updatedBefore,
  onUpdatedBeforeChange,
}: EtfReportsFiltersProps): JSX.Element {
  const items = toExchangeItems(availableExchanges);
  const selectedId = exchange || 'All';
  const categoryItems = toCategoryItems(group);
  const selectedGroup = group || 'All';
  const selectedCategory = category || 'All';
  const selectedMissing = missing || 'All';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
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
          label="Group"
          items={groupItems}
          selectedItemId={selectedGroup}
          setSelectedItemId={(id: string | null) => onGroupChange(id && id !== 'All' ? id : '')}
        />
      </div>
      <div className="w-64">
        <StyledSelect
          label="Category"
          items={categoryItems}
          selectedItemId={selectedCategory}
          setSelectedItemId={(id: string | null) => onCategoryChange(id && id !== 'All' ? id : '')}
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
      <div className="w-56">
        <label className="block text-sm font-medium text-muted mb-1" title="Show ETFs whose last updatedAt is before this date">
          Updated before
        </label>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={updatedBefore}
            onChange={(e) => onUpdatedBeforeChange(e.target.value)}
            className="w-full px-3 py-2 bg-surface text-body border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {updatedBefore && (
            <button
              type="button"
              onClick={() => onUpdatedBeforeChange('')}
              className="px-2 py-2 text-xs text-muted hover:text-heading"
              title="Clear date filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="w-80">
        <label className="block text-sm font-medium text-muted mb-1">Search</label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by symbol or name…"
          className="w-full px-3 py-2 bg-surface text-body border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  );
}
