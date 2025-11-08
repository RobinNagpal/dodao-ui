import Link from 'next/link';
import React from 'react';
import { TickerWithIndustryNames, getTickerScore } from '@/types/ticker-typesv1';
import { getScoreColorClasses } from '@/utils/score-utils';

interface CompactIndustryCardProps {
  industryKey: string;
  industryName: string;
  tickerCount: number;
  topTickers?: TickerWithIndustryNames[];
}

export default function CompactIndustryCard({ industryKey, industryName, topTickers = [] }: CompactIndustryCardProps): React.JSX.Element {
  // Get top 3 tickers to display
  const displayTickers = topTickers.slice(0, 3);

  return (
    <div className="bg-block-bg-color rounded-lg border border-color overflow-hidden">
      <Link href={`/stocks/industries/${encodeURIComponent(industryKey)}`} className="block p-3 hover:bg-[#2D3748] transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug mb-1 truncate text-left flex justify-between items-center" title={industryName}>
          <span className="truncate mr-2">{industryName}</span>
          <span className="text-[#F59E0B] hover:text-[#F97316] transition-colors text-sm flex-shrink-0">→</span>
        </h3>
      </Link>

      {/* Company list with scores */}
      {displayTickers.length > 0 && (
        <div className="px-3 pb-2">
          <ul className="space-y-1">
            {displayTickers.map((ticker) => {
              const score = getTickerScore(ticker);
              const { textColorClass } = getScoreColorClasses(score);

              return (
                <li key={ticker.symbol}>
                  <Link
                    href={`/stocks/${ticker.exchange}/${ticker.symbol}`}
                    className="flex items-center gap-1.5 py-1 hover:bg-[#2D3748] transition-colors rounded px-1 -mx-1"
                  >
                    <span className={`${textColorClass} text-xs font-mono w-8 text-right`}>{score}/25</span>
                    <span className="text-xs font-medium bg-[#4F46E5] text-white ml-1.5 px-1.5 py-0.5 rounded">{ticker.symbol}</span>
                    <span className="text-xs text-white truncate">{ticker.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
