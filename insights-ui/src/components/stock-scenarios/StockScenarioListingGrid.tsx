'use client';

import { useMemo, useState } from 'react';
import { StockScenarioListingResponse } from '@/app/api/[spaceId]/stock-scenarios/listing/route';
import { ScenarioDirection, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import StockScenarioCard from './StockScenarioCard';
import StockScenarioFiltersBar from './StockScenarioFiltersBar';

export default function StockScenarioListingGrid({ data }: { data: StockScenarioListingResponse }): JSX.Element | null {
  const [direction, setDirection] = useState<ScenarioDirection | 'ALL'>('ALL');
  const [bucket, setBucket] = useState<ScenarioProbabilityBucket | 'ALL'>('ALL');
  const [timeframe, setTimeframe] = useState<ScenarioTimeframe | 'ALL'>('ALL');
  const [country, setCountry] = useState<SupportedCountries | 'ALL'>('ALL');
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
        <p className="text-[#E5E7EB] text-sm mt-2">An admin can import the stock market-scenarios document to populate this page.</p>
      </div>
    );
  }

  return (
    <div>
      <StockScenarioFiltersBar
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((s) => (
            <StockScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  );
}
