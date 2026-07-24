'use client';

import { ScenarioDirection, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';

const DIRECTION_OPTIONS: Array<{ value: ScenarioDirection | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All directions' },
  { value: 'UPSIDE', label: 'Upside' },
  { value: 'DOWNSIDE', label: 'Downside' },
];

const BUCKET_OPTIONS: Array<{ value: ScenarioProbabilityBucket | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All probabilities' },
  { value: 'HIGH', label: 'High (>40%)' },
  { value: 'MEDIUM', label: 'Medium (20–40%)' },
  { value: 'LOW', label: 'Low (<20%)' },
];

const TIMEFRAME_OPTIONS: Array<{ value: ScenarioTimeframe | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All timeframes' },
  { value: 'FUTURE', label: 'Future' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'PAST', label: 'Already happened' },
];

interface StockScenarioFiltersBarProps {
  direction: ScenarioDirection | 'ALL';
  onDirectionChange: (v: ScenarioDirection | 'ALL') => void;
  bucket: ScenarioProbabilityBucket | 'ALL';
  onBucketChange: (v: ScenarioProbabilityBucket | 'ALL') => void;
  timeframe: ScenarioTimeframe | 'ALL';
  onTimeframeChange: (v: ScenarioTimeframe | 'ALL') => void;
  country: SupportedCountries | 'ALL';
  onCountryChange: (v: SupportedCountries | 'ALL') => void;
  search: string;
  onSearchChange: (s: string) => void;
}

const SELECT_CLASSES = 'w-full bg-bg border border-border rounded px-2 py-1.5 text-sm text-heading focus:outline-none focus:border-amber-500';

export default function StockScenarioFiltersBar({
  direction,
  onDirectionChange,
  bucket,
  onBucketChange,
  timeframe,
  onTimeframeChange,
  country,
  onCountryChange,
  search,
  onSearchChange,
}: StockScenarioFiltersBarProps): JSX.Element {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 mb-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted sm:max-w-xs">
        <span className="uppercase tracking-wide text-[11px] text-muted">Country</span>
        <select className={SELECT_CLASSES} value={country} onChange={(e) => onCountryChange(e.target.value as SupportedCountries | 'ALL')}>
          <option value="ALL">All countries</option>
          {ALL_SUPPORTED_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          <span className="uppercase tracking-wide text-[11px] text-muted">Direction</span>
          <select className={SELECT_CLASSES} value={direction} onChange={(e) => onDirectionChange(e.target.value as ScenarioDirection | 'ALL')}>
            {DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          <span className="uppercase tracking-wide text-[11px] text-muted">Probability</span>
          <select className={SELECT_CLASSES} value={bucket} onChange={(e) => onBucketChange(e.target.value as ScenarioProbabilityBucket | 'ALL')}>
            {BUCKET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          <span className="uppercase tracking-wide text-[11px] text-muted">Timeframe</span>
          <select className={SELECT_CLASSES} value={timeframe} onChange={(e) => onTimeframeChange(e.target.value as ScenarioTimeframe | 'ALL')}>
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          <span className="uppercase tracking-wide text-[11px] text-muted">Search</span>
          <input
            type="search"
            className={SELECT_CLASSES}
            placeholder="Filter by title or keyword…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
