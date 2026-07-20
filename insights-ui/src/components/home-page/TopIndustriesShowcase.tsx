import CompactIndustryCard from '@/components/stocks/CompactIndustryCard';
import { IndustryWithTopTickers } from '@/types/api/ticker-industries';
import React from 'react';

export interface TopIndustriesShowcaseProps {
  industries: IndustryWithTopTickers[];
}

// Cap the home-page grid at 5 rows of 4 (20 industries) so it stays compact above the ETF section.
const MAX_INDUSTRIES = 20;

export default function TopIndustriesShowcase({ industries }: TopIndustriesShowcaseProps): React.JSX.Element | null {
  if (industries.length === 0) {
    return null;
  }

  const displayedIndustries = industries.slice(0, MAX_INDUSTRIES);

  return (
    <div className="mt-10 mb-12 sm:mb-10">
      {/* Header: title centered, CTA responsive below */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-heading text-center">Explore Industries &amp; Top US Companies</h2>
      </div>

      {/* Industry cards grid: friendlier on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {displayedIndustries.map((industry) => (
          <CompactIndustryCard
            key={industry.industryKey}
            industryKey={industry.industryKey}
            industryName={industry.name}
            tickerCount={industry.tickerCount}
            topTickers={industry.topTickers}
          />
        ))}
      </div>
    </div>
  );
}
