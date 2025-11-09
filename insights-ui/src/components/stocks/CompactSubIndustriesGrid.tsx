import React from 'react';
import { use } from 'react';
import Link from 'next/link';
import CompactSubIndustryCard from './CompactSubIndustryCard';
import { TickerWithScore, getTickerScore } from '@/types/ticker-typesv1';
import { StocksDataPayload } from './StocksGrid';

type Grouped = Record<
  string, // mainIndustry key
  Record<
    string, // subIndustry key
    { tickers: TickerWithScore[]; total: number }
  >
>;

export default function CompactSubIndustriesGrid({ dataPromise }: { dataPromise: Promise<StocksDataPayload> }) {
  const data = use(dataPromise);
  const { tickers, filtersApplied } = data;

  if (!tickers || tickers.length === 0) {
    return null;
  }

  // Group by main → sub
  const byMain: Grouped = {};
  for (const t of tickers) {
    const main = t.industryKey || 'Other';
    const sub = t.subIndustryKey || 'Other';
    byMain[main] ??= {};
    byMain[main][sub] ??= { tickers: [], total: 0 };
    byMain[main][sub].tickers.push(t);
    byMain[main][sub].total += 1;
  }

  // Sort by finalScore (API already limits to top 3 per sub-industry)
  for (const main of Object.keys(byMain)) {
    for (const sub of Object.keys(byMain[main])) {
      byMain[main][sub].tickers = byMain[main][sub].tickers.slice().sort((a, b) => {
        const aScore = getTickerScore(a);
        const bScore = getTickerScore(b);
        return bScore - aScore;
      });
    }
  }

  return (
    <>
      {Object.entries(byMain).map(([mainIndustry, subIndustries]) => {
        const totals = Object.values(subIndustries).reduce((sum, s) => sum + s.total, 0);
        const sampleTicker = Object.values(subIndustries)[0]?.tickers[0];
        const industryDisplayName = (sampleTicker?.industryName as string | undefined) || (sampleTicker?.industryKey as string | undefined) || mainIndustry;

        return (
          <div key={mainIndustry} className="mb-8">
            {/* Industry header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
              <Link
                href={`/stocks/industries/${encodeURIComponent(mainIndustry)}`}
                className="text-sm bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-3 py-1 rounded-lg shadow-md flex items-center"
              >
                View All {totals} Companies
                <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Sub-industry cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {Object.entries(subIndustries).map(([subKey, { tickers: subTickers, total }]) => {
                const subName = (subTickers[0]?.subIndustryName as string | undefined) || subKey;
                return <CompactSubIndustryCard key={subKey} industryKey={mainIndustry} subIndustryName={subName} tickers={subTickers} />;
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
