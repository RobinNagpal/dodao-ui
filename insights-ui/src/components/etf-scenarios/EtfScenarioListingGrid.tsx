'use client';

import { useMemo, useState } from 'react';
import { EtfScenarioListingResponse } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import EtfScenarioCard from './EtfScenarioCard';
import EtfScenarioFiltersBar from './EtfScenarioFiltersBar';
import { EtfScenarioOutlookBucket } from '@prisma/client';

export default function EtfScenarioListingGrid({ data }: { data: EtfScenarioListingResponse }): JSX.Element | null {
  const [bucket, setBucket] = useState<EtfScenarioOutlookBucket | 'ALL'>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.scenarios.filter((s) => {
      if (bucket !== 'ALL' && s.outlookBucket !== bucket) return false;
      if (needle) {
        const hay = `${s.title} ${s.underlyingCause}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data.scenarios, bucket, search]);

  if (data.scenarios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#E5E7EB] text-lg">No scenarios yet.</p>
        <p className="text-[#E5E7EB] text-sm mt-2">An admin can import the market-scenarios document to populate this page.</p>
      </div>
    );
  }

  return (
    <div>
      <EtfScenarioFiltersBar bucket={bucket} onBucketChange={setBucket} search={search} onSearchChange={setSearch} />

      <div className="flex items-center justify-between mb-4 mt-2">
        <p className="text-sm text-gray-400">
          Showing {filtered.length} of {data.totalCount.toLocaleString()} scenario{data.totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#E5E7EB] text-lg">No scenarios match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((s) => (
            <EtfScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  );
}
