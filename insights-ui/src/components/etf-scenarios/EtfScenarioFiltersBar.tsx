'use client';

import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { ETF_SUPPORTED_COUNTRIES, EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

const DIRECTION_OPTIONS: Array<{ value: EtfScenarioDirection | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All directions' },
  { value: 'UPSIDE', label: 'Upside' },
  { value: 'DOWNSIDE', label: 'Downside' },
];

const BUCKET_OPTIONS: Array<{ value: EtfScenarioProbabilityBucket | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All probabilities' },
  { value: 'HIGH', label: 'High (>40%)' },
  { value: 'MEDIUM', label: 'Medium (20–40%)' },
  { value: 'LOW', label: 'Low (<20%)' },
];

const TIMEFRAME_OPTIONS: Array<{ value: EtfScenarioTimeframe | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All timeframes' },
  { value: 'FUTURE', label: 'Future' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'PAST', label: 'Already happened' },
];

interface EtfScenarioFiltersBarProps {
  direction: EtfScenarioDirection | 'ALL';
  onDirectionChange: (v: EtfScenarioDirection | 'ALL') => void;
  bucket: EtfScenarioProbabilityBucket | 'ALL';
  onBucketChange: (v: EtfScenarioProbabilityBucket | 'ALL') => void;
  timeframe: EtfScenarioTimeframe | 'ALL';
  onTimeframeChange: (v: EtfScenarioTimeframe | 'ALL') => void;
  country: EtfSupportedCountry | 'ALL';
  onCountryChange: (v: EtfSupportedCountry | 'ALL') => void;
  search: string;
  onSearchChange: (s: string) => void;
}

const SELECT_CLASSES = 'w-full bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#F59E0B]';

export default function EtfScenarioFiltersBar({
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
}: EtfScenarioFiltersBarProps): JSX.Element {
  return (
    <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-3 mb-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs text-gray-300 sm:max-w-xs">
        <span className="uppercase tracking-wide text-[11px] text-gray-400">Country</span>
        <select className={SELECT_CLASSES} value={country} onChange={(e) => onCountryChange(e.target.value as EtfSupportedCountry | 'ALL')}>
          <option value="ALL">All countries</option>
          {ETF_SUPPORTED_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Direction</span>
          <select className={SELECT_CLASSES} value={direction} onChange={(e) => onDirectionChange(e.target.value as EtfScenarioDirection | 'ALL')}>
            {DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Probability</span>
          <select className={SELECT_CLASSES} value={bucket} onChange={(e) => onBucketChange(e.target.value as EtfScenarioProbabilityBucket | 'ALL')}>
            {BUCKET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Timeframe</span>
          <select className={SELECT_CLASSES} value={timeframe} onChange={(e) => onTimeframeChange(e.target.value as EtfScenarioTimeframe | 'ALL')}>
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-300">
          <span className="uppercase tracking-wide text-[11px] text-gray-400">Search</span>
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
