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
      {/* Header: title centered, CTA responsive below */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white text-center">Explore Industries &amp; Top Companies</h2>
        <div className="mt-3 flex justify-center sm:justify-end">
          <Link
            href="/stocks"
            aria-label="Browse all stock reports"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2
                       text-sm sm:text-base font-semibold text-gray-900
                       bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]
                       hover:from-[#FBBF24] hover:to-[#F59E0B]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                       focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800
                       shadow-md hover:shadow-lg transition-all"
          >
            Browse all stock reports <span aria-hidden>→</span>
          </Link>
        </div>
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
