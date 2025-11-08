import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import Link from 'next/link';
import React from 'react';
import CompactIndustryCard from '@/components/stocks/CompactIndustryCard';

export interface IndustryWithTopTickers {
  industryKey: string;
  industryName: string;
  tickerCount: number;
  topTickers: TickerWithIndustryNames[];
}

export interface TopIndustriesShowcaseProps {
  industries: IndustryWithTopTickers[];
}

export default function TopIndustriesShowcase({ industries }: TopIndustriesShowcaseProps): React.JSX.Element | null {
  if (industries.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-8 sm:mb-10">
      {/* Industry header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Explore Industries & Top Companies</h2>
        <Link
          href="/stocks"
          className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
        >
          <span className="ml-1">View All Stocks →</span>
        </Link>
      </div>

      {/* Industry cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {industries.map((industry) => (
          <CompactIndustryCard
            key={industry.industryKey}
            industryKey={industry.industryKey}
            industryName={industry.industryName}
            tickerCount={industry.tickerCount}
            topTickers={industry.topTickers}
          />
        ))}
      </div>
    </div>
  );
}
