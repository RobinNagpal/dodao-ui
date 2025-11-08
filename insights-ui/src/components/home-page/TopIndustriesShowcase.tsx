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
    <div className="mt-12 mb-12 sm:mb-10">
      {/* Header: title centered, CTA responsive below */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white text-center">Explore Industries &amp; Top Companies</h2>
      </div>

      {/* Industry cards grid: friendlier on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
