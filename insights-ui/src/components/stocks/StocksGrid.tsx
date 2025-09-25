// components/stocks/StocksGrid.tsx
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import type { FilteredTicker, TickerWithIndustryNames } from '@/types/ticker-typesv1';

type SearchParams = { [key: string]: string | string[] | undefined };

const toScalar = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v.join(',') : v);

const toSortedQueryString = (sp: SearchParams): string => {
  const usp = new URLSearchParams();
  Object.keys(sp)
    .sort()
    .forEach((k) => {
      if (k === 'page') return;
      const v = toScalar(sp[k]);
      if (v) usp.set(k, v);
    });
  usp.set('country', 'US');
  return usp.toString();
};

const hasFiltersApplied = (sp: SearchParams): boolean => {
  const keys = Object.keys(sp);
  return keys.some((k) => k.includes('Threshold')) || Boolean(toScalar(sp['search']));
};

// --- CACHED FETCHERS ---------------------------------------------------------

// Unfiltered list: cache for 1 hour, tag by country.
const getUSTickers = unstable_cache(
  async (): Promise<TickerWithIndustryNames[]> => {
    const base = getBaseUrl() || 'https://koalagains.com';
    const url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;
    const res = await fetch(url, { next: { revalidate: 3600, tags: ['tickers:US'] } });
    if (!res.ok) return [];
    return (await res.json()) as TickerWithIndustryNames[];
  },
  ['tickers:US:all'],
  { revalidate: 3600, tags: ['tickers:US'] }
);

// Filtered list: cache for 5 minutes keyed by the query string.
const getFilteredUSTickers = unstable_cache(
  async (qs: string): Promise<FilteredTicker[]> => {
    const base = getBaseUrl() || 'https://koalagains.com';
    const url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1-filtered?${qs}`;
    const res = await fetch(url, { next: { revalidate: 300, tags: ['tickers:US:filtered'] } });
    if (!res.ok) return [];
    return (await res.json()) as FilteredTicker[];
  },
  ['tickers:US:filtered'],
  { revalidate: 300, tags: ['tickers:US:filtered'] }
);

// --- TYPES -------------------------------------------------------------------

type AnyTicker = (TickerWithIndustryNames | FilteredTicker) & {
  industryKey?: string | null;
  subIndustryKey?: string | null;
  industryName?: string | null;
  subIndustryName?: string | null;
  cachedScore: number;
  symbol: string;
  name: string;
  exchange: string;
};

type Grouped = Record<
  string, // mainIndustry key
  Record<
    string, // subIndustry key
    { tickers: AnyTicker[]; total: number }
  >
>;

// --- RENDER ------------------------------------------------------------------

export default async function StocksGrid({ searchParams }: { searchParams: SearchParams }) {
  const filters = hasFiltersApplied(searchParams);
  const qs = toSortedQueryString(searchParams);

  let tickers: AnyTicker[] = [];
  if (filters) {
    tickers = (await getFilteredUSTickers(qs)) as AnyTicker[];
  } else {
    tickers = (await getUSTickers()) as AnyTicker[];
  }

  if (!tickers || tickers.length === 0) {
    return (
      <div className="text-center py-12">
        {filters ? (
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
                className="text-md bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center"
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
