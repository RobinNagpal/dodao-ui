// components/stocks/StocksGrid.tsx
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import Link from 'next/link';
import { use } from 'react';

export type StocksDataPayload = {
  tickers: TickerWithIndustryNames[];
  filtersApplied: boolean;
};

type Grouped = Record<
  string, // mainIndustry key
  Record<
    string, // subIndustry key
    { tickers: TickerWithIndustryNames[]; total: number }
  >
>;

export default function StocksGrid({ dataPromise }: { dataPromise: Promise<StocksDataPayload> }) {
  const data = use(dataPromise);
  const { tickers, filtersApplied } = data;

  if (!tickers || tickers.length === 0) {
    return (
      <div className="text-center py-12">
        {filtersApplied ? (
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

  // Sort by cachedScore and take top 4 per sub-industry
  for (const main of Object.keys(byMain)) {
    for (const sub of Object.keys(byMain[main])) {
      byMain[main][sub].tickers = byMain[main][sub].tickers
        .slice()
        .sort((a, b) => (b.cachedScore ?? 0) - (a.cachedScore ?? 0))
        .slice(0, 4);
    }
  }

  return (
    <>
      {Object.entries(byMain).map(([mainIndustry, subIndustries]) => {
        const totals = Object.values(subIndustries).reduce((sum, s) => sum + s.total, 0);
        const sampleTicker = Object.values(subIndustries)[0]?.tickers[0];
        const industryDisplayName = (sampleTicker?.industryName as string | undefined) || (sampleTicker?.industryKey as string | undefined) || mainIndustry;

        return (
          <div key={mainIndustry} className="mb-12">
            {/* Industry header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
              <Link
                href={`/stocks/industries/${encodeURIComponent(mainIndustry)}`}
                className="text-md bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-4 py-2 rounded-lg shadow-md flex items-center"
              >
                View All {totals} Companies
                <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Sub-industry cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {Object.entries(subIndustries).map(([subKey, { tickers: subTickers, total }]) => {
                const subName = (subTickers[0]?.subIndustryName as string | undefined) || subKey;
                return <SubIndustryCard key={subKey} subIndustry={subKey} subIndustryName={subName} tickers={subTickers} total={total} />;
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
