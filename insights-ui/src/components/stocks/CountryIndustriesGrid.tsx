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

  if (!resolvedData || resolvedData.industries.length === 0) {
    return (
      <div className="text-center py-12">
        {resolvedData?.filtersApplied ? (
          <>
            <p className="text-[#E5E7EB] text-lg">No {countryName} stocks match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </>
        ) : (
          <>
            <p className="text-[#E5E7EB] text-lg">No {countryName} stocks found.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {resolvedData.industries.map((industry) => {
        const industryDisplayName = industry.name;

        return (
          <div key={industry.industryKey} className="mb-8">
            {/* Industry Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
              <Link
                href={`/stocks/countries/${encodeURIComponent(countryName)}/industries/${encodeURIComponent(industry.industryKey)}`}
                className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
              >
                View All Companies
                <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Sub-Industry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {industry.subIndustries.map((subIndustry) => (
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
