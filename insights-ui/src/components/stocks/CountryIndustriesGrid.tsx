import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import Link from 'next/link';
import React, { use } from 'react';
import CompactSubIndustryCard from './CompactSubIndustryCard';

interface CountryIndustriesGridProps {
  data?: IndustriesResponse | null;
  dataPromise?: Promise<IndustriesResponse> | null;
  countryName: string;
}

export default function CountryIndustriesGrid({ data, dataPromise, countryName }: CountryIndustriesGridProps): React.JSX.Element | null {
  // Handle both direct data and promise-based data
  const resolvedData = dataPromise ? use(dataPromise) : data;

  if (!resolvedData) {
    return null;
  }

  // Filter industries that have at least one sub-industry with tickers to display
  const industriesWithTickers = resolvedData.industries.filter((industry) => industry.subIndustries.some((subIndustry) => subIndustry.topTickers.length > 0));

  // Show empty state if no industries have displayable tickers
  if (industriesWithTickers.length === 0) {
    return resolvedData.filtersApplied ? (
      <EmptyStateCard
        variant="inline"
        title={`No ${countryName} stocks match the current filters.`}
        description="Try adjusting your filter criteria to see more results."
      />
    ) : (
      <EmptyStateCard variant="inline" title={`No ${countryName} stocks found.`} description="Please try again later." />
    );
  }

  return (
    <>
      {industriesWithTickers.map((industry) => {
        const industryDisplayName = industry.name;
        const totalCompanies = industry.tickerCount;

        return (
          <div key={industry.industryKey} className="mb-8">
            {/* Industry Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-heading">{industryDisplayName}</h2>
              <Link
                href={`/stocks/countries/${encodeURIComponent(countryName)}/industries/${encodeURIComponent(industry.industryKey)}`}
                className="text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
              >
                View All {totalCompanies} Companies
                <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Sub-Industry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {industry.subIndustries
                .filter((subIndustry) => subIndustry.topTickers.length > 0)
                .map((subIndustry) => (
                  <CompactSubIndustryCard
                    key={subIndustry.subIndustryKey}
                    industryKey={industry.industryKey}
                    subIndustryName={subIndustry.name}
                    tickers={subIndustry.topTickers}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
