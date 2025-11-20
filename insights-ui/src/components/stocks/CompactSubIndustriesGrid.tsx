import { IndustriesResponse } from '@/types/api/ticker-industries';
import Link from 'next/link';
import React, { use } from 'react';
import CompactSubIndustryCard from './CompactSubIndustryCard';

export default function CompactSubIndustriesGrid({
  data,
  dataPromise,
}: {
  data?: IndustriesResponse | null;
  dataPromise?: Promise<IndustriesResponse> | null;
}) {
  // Handle both direct data and promise-based data
  const resolvedData = dataPromise ? use(dataPromise) : data;

  if (!resolvedData) {
    return null;
  }

  // Filter industries that have at least one sub-industry with tickers to display
  const industriesWithTickers = resolvedData.industries.filter((industry) => industry.subIndustries.some((subIndustry) => subIndustry.topTickers.length > 0));

  // Show empty state if no industries have displayable tickers
  if (industriesWithTickers.length === 0) {
    return (
      <div className="text-center py-12">
        {resolvedData.filtersApplied ? (
          <>
            <p className="text-[#E5E7EB] text-lg">No US stocks match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </>
        ) : (
          <>
            <p className="text-[#E5E7EB] text-lg">No US stocks found.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {industriesWithTickers.map((industry) => {
        const industryDisplayName = industry.name;
        const totalCompanies = industry.tickerCount;

        return (
          <div key={industry.industryKey} className="mb-8">
            {/* Industry header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
              <Link
                href={`/stocks/industries/${encodeURIComponent(industry.industryKey)}`}
                className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
              >
                View All {totalCompanies} Companies
                <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Sub-industry cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
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
