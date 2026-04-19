'use client';

import { EtfScenarioOutlookBucket } from '@prisma/client';

const BUCKET_OPTIONS: Array<{ value: EtfScenarioOutlookBucket | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All outlooks' },
  { value: 'HIGH', label: 'High (>40%)' },
  { value: 'MEDIUM', label: 'Medium (20–40%)' },
  { value: 'LOW', label: 'Low (<20%)' },
  { value: 'IN_PROGRESS', label: 'In progress / already happened' },
];

interface EtfScenarioFiltersBarProps {
  bucket: EtfScenarioOutlookBucket | 'ALL';
  onBucketChange: (b: EtfScenarioOutlookBucket | 'ALL') => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export default function EtfScenarioFiltersBar({ bucket, onBucketChange, search, onSearchChange }: EtfScenarioFiltersBarProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-[#1F2937] border border-[#374151] rounded-lg p-3 mb-4">
      <label className="flex items-center gap-2 text-sm text-gray-300 flex-1">
        <span className="whitespace-nowrap">Outlook</span>
        <select
          className="w-full bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          value={bucket}
          onChange={(e) => onBucketChange(e.target.value as EtfScenarioOutlookBucket | 'ALL')}
        >
          {BUCKET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-300 flex-1">
        <span className="whitespace-nowrap">Search</span>
        <input
          type="search"
          className="w-full bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B]"
          placeholder="Filter by title or keyword…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
    </div>
  );
}
