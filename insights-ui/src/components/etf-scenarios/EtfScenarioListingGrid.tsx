'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EtfScenarioListingResponse } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { EtfSupportedCountry, toEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import EtfScenarioCard from './EtfScenarioCard';
import EtfScenarioFiltersBar from './EtfScenarioFiltersBar';

export default function EtfScenarioListingGrid({ data }: { data: EtfScenarioListingResponse }): JSX.Element | null {
  const searchParams = useSearchParams();
  const initialCountry = toEtfSupportedCountry(searchParams?.get('country') ?? null) ?? 'ALL';

  const [direction, setDirection] = useState<EtfScenarioDirection | 'ALL'>('ALL');
  const [bucket, setBucket] = useState<EtfScenarioProbabilityBucket | 'ALL'>('ALL');
  const [timeframe, setTimeframe] = useState<EtfScenarioTimeframe | 'ALL'>('ALL');
  const [country, setCountry] = useState<EtfSupportedCountry | 'ALL'>(initialCountry);
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.scenarios.filter((s) => {
      if (direction !== 'ALL' && s.direction !== direction) return false;
      if (bucket !== 'ALL' && s.probabilityBucket !== bucket) return false;
      if (timeframe !== 'ALL' && s.timeframe !== timeframe) return false;
      if (country !== 'ALL' && !s.countries.includes(country)) return false;
      if (needle) {
        const hay = `${s.title} ${s.underlyingCause}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data.scenarios, direction, bucket, timeframe, country, search]);

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
      <EtfScenarioFiltersBar
        direction={direction}
        onDirectionChange={setDirection}
        bucket={bucket}
        onBucketChange={setBucket}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        country={country}
        onCountryChange={setCountry}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex items-center justify-between mb-4 mt-2">
        <p className="text-sm text-gray-400">
          Showing {filtered.length} of {data.totalCount.toLocaleString()} scenario{data.totalCount !== 1 ? 's' : ''}
          {country !== 'ALL' && <span className="text-gray-500"> · filtered to {country}</span>}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#E5E7EB] text-lg">No scenarios match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <EtfScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  );
}
