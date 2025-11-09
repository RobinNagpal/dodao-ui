import { getTickerScore, TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';
import React from 'react';

interface CompactSubIndustryCardProps {
  industryKey: string;
  subIndustryName: string;
  tickers: TickerWithIndustryNames[];
}

export default function CompactSubIndustryCard({ industryKey, subIndustryName, tickers }: CompactSubIndustryCardProps): React.JSX.Element {
  const sortedTickers = tickers.sort((t1, t2) => (t2.cachedScoreEntry?.finalScore || 0) - (t1.cachedScoreEntry?.finalScore || 0)).slice(0, 3);
  return (
    <div className="bg-block-bg-color rounded-lg border border-color overflow-hidden">
      <Link href={`/stocks/industries/${encodeURIComponent(industryKey)}`} className="block px-3 py-1.5 bg-[#374151] hover:bg-[#2D3748] transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug mb-1 text-left flex justify-between items-start" title={subIndustryName}>
          <span className="whitespace-normal break-words mr-2">{subIndustryName}</span>
        </h3>
      </Link>

      {tickers.sort((t1, t2) => (t2.cachedScoreEntry?.finalScore || 0) - (t1.cachedScoreEntry?.finalScore || 0)).slice(0, 3).length > 0 && (
        <div className="px-3 py-1">
          <ul className="space-y-1">
            {sortedTickers.map((ticker) => {
              const score = getTickerScore(ticker);
              const { textColorClass, bgColorClass } = getScoreColorClasses(score || 0);

              return (
                <li key={ticker.symbol}>
                  <Link
                    href={`/stocks/${ticker.exchange}/${ticker.symbol}`}
                    className="flex items-center gap-1.5 py-1 hover:bg-[#2D3748] transition-colors rounded px-1 -mx-1"
                  >
                    <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[46px] text-right`}>
                      <span className={`${textColorClass} text-xs font-mono w-8 text-right`}>{score}/25</span>
                    </p>
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
