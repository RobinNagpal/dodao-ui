import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerWithIndustryNames, getTickerScore } from '@/types/ticker-typesv1';
import { TICKERS_TAG } from '@/utils/ticker-v1-cache-utils';
import { getScoreColorClasses } from '@/utils/score-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';

interface IndustryWithTopTickers {
  industryKey: string;
  industryName: string;
  tickerCount: number;
  topTickers: Array<{
    symbol: string;
    name: string;
    exchange: string;
    score: number;
  }>;
}

async function fetchTopIndustriesWithTickers(): Promise<IndustryWithTopTickers[]> {
  const base = getBaseUrl();
  const url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;

  const res = await fetch(url, { next: { tags: [TICKERS_TAG] } });
  if (!res.ok) return [];

  const tickers: TickerWithIndustryNames[] = await res.json();

  // Group by industry
  const byIndustry = new Map<string, TickerWithIndustryNames[]>();
  for (const ticker of tickers) {
    const key = ticker.industryKey;
    if (!byIndustry.has(key)) {
      byIndustry.set(key, []);
    }
    byIndustry.get(key)!.push(ticker);
  }

  // Convert to array and sort by ticker count, then take top 20
  const industries: IndustryWithTopTickers[] = Array.from(byIndustry.entries())
    .map(([industryKey, industryTickers]) => {
      // Sort tickers by score and take top 3
      const sortedTickers = industryTickers
        .slice()
        .sort((a, b) => getTickerScore(b) - getTickerScore(a))
        .slice(0, 3);

      return {
        industryKey,
        industryName: industryTickers[0]?.industryName || industryKey,
        tickerCount: industryTickers.length,
        topTickers: sortedTickers.map((t) => ({
          symbol: t.symbol,
          name: t.name,
          exchange: t.exchange,
          score: getTickerScore(t),
        })),
      };
    })
    .sort((a, b) => b.tickerCount - a.tickerCount)
    .slice(0, 20);

  return industries;
}

export default async function TopIndustriesShowcase(): Promise<React.JSX.Element | null> {
  const industries = await fetchTopIndustriesWithTickers();

  if (industries.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 sm:mb-10">
      <div className="text-center mb-6">
        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">Browse our most popular industries and their highest-rated companies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {industries.map((industry) => (
          <div key={industry.industryKey} className="bg-block-bg-color rounded-lg border border-color overflow-hidden hover:border-indigo-500 transition-all">
            {/* Industry Header - Clickable */}
            <Link
              href={`/stocks/industries/${encodeURIComponent(industry.industryKey)}`}
              className="block bg-[#374151] px-3 py-2 border-b border-color hover:bg-[#4B5563] transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white truncate flex-1 pr-2" title={industry.industryName}>
                  {industry.industryName}
                </h3>
                <span className="text-[13px] text-white bg-[#4F46E5] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {industry.tickerCount} {industry.tickerCount === 1 ? 'stock' : 'stocks'}
                </span>
              </div>
            </Link>

            {/* Top 3 Tickers - in 3 columns */}
            <div className="grid grid-cols-3 gap-2 p-2">
              {industry.topTickers.map((ticker) => {
                const { textColorClass, bgColorClass } = getScoreColorClasses(ticker.score);
                return (
                  <Link
                    key={`${ticker.exchange}-${ticker.symbol}`}
                    href={`/stocks/${ticker.exchange}/${ticker.symbol}`}
                    className="block hover:bg-[#2D3748] transition-colors rounded p-1.5"
                    title={ticker.name}
                  >
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className={`${textColorClass} ${bgColorClass} bg-opacity-15 px-1.5 py-0.5 rounded-md text-xs font-mono tabular-nums w-full`}>
                        {ticker.score}/25
                      </div>
                      <div className="whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium bg-[#4F46E5] text-white w-full">{ticker.symbol}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-6">
        <Link href="/stocks" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-sm">
          View all industries and stocks
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
