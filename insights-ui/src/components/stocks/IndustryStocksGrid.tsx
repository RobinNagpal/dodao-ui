// components/stocks/IndustryStocksGrid.tsx
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import type { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { use } from 'react';

export type IndustryStocksDataPayload = {
  tickers: TickerWithIndustryNames[];
  filtersApplied: boolean;
};

type GroupedSub = Record<
  string,
  {
    tickers: TickerWithIndustryNames[];
    total: number;
    subIndustryName: string;
  }
>;

type CardSpec = {
  key: string;
  subIndustry: string;
  subIndustryName: string;
  tickers: TickerWithIndustryNames[];
  total: number;
  estH: number; // estimated height for packing
};

// Tune to match the actual CSS used by SubIndustryCard’s header/list rows.
const CARD_HEADER_PX = 41;
const ROW_PX = 36;

function estimateCardHeight(rowCount: number): number {
  return CARD_HEADER_PX + rowCount * ROW_PX;
}

/** Greedy packer: seed one per column, then place next into the current shortest column. */
function packIntoColumns<T extends { estH: number }>(items: T[], cols: number): T[][] {
  const buckets: { items: T[]; h: number }[] = Array.from({ length: cols }, () => ({ items: [], h: 0 }));

  items.forEach((item, i) => {
    if (i < cols) {
      buckets[i].items.push(item);
      buckets[i].h += item.estH;
    } else {
      let min = 0;
      for (let c = 1; c < cols; c++) if (buckets[c].h < buckets[min].h) min = c;
      buckets[min].items.push(item);
      buckets[min].h += item.estH;
    }
  });

  return buckets.map((b) => b.items);
}

export default function IndustryStocksGrid({ dataPromise, industryName }: { dataPromise: Promise<IndustryStocksDataPayload>; industryName?: string }) {
  const { tickers, filtersApplied } = use(dataPromise);

  if (!tickers || tickers.length === 0) {
    return (
      <div className="text-center py-12">
        {filtersApplied ? (
          <>
            <p className="text-[#E5E7EB] text-lg">No {industryName ? `${industryName} ` : ''}stocks match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </>
        ) : (
          <>
            <p className="text-[#E5E7EB] text-lg">No {industryName ? `${industryName} ` : ''}stocks found.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
          </>
        )}
      </div>
    );
  }

  // Group by sub-industry
  const bySub: GroupedSub = {};
  for (const t of tickers) {
    const subKey = t.subIndustryKey || 'Other';
    const subName = (t.subIndustryName as string | undefined) || subKey;
    if (!bySub[subKey]) {
      bySub[subKey] = { tickers: [], total: 0, subIndustryName: subName };
    }
    bySub[subKey].tickers.push(t);
    bySub[subKey].total += 1;
  }

  // Sort each sub group by finalScore desc (show all — no slicing here)
  for (const subKey of Object.keys(bySub)) {
    bySub[subKey].tickers = bySub[subKey].tickers.slice().sort((a, b) => {
      // Handle both FilteredTicker (has totalScore) and TickerWithIndustryNames (has cachedScoreEntry)
      const aScore = (a as any).totalScore ?? (a as any).cachedScoreEntry?.finalScore ?? 0;
      const bScore = (b as any).totalScore ?? (b as any).cachedScoreEntry?.finalScore ?? 0;
      return bScore - aScore;
    });
  }

  // Build card specs w/ estimated heights for packing
  const cards: CardSpec[] = Object.entries(bySub).map(([subIndustry, group]) => ({
    key: subIndustry,
    subIndustry,
    subIndustryName: group.subIndustryName,
    tickers: group.tickers,
    total: group.total,
    estH: estimateCardHeight(group.total),
  }));

  const cols1 = [cards];
  const cols2 = packIntoColumns(cards, 2);
  const cols3 = packIntoColumns(cards, 3);

  const renderCard = (c: CardSpec) => (
    <SubIndustryCard key={c.key} subIndustry={c.subIndustry} subIndustryName={c.subIndustryName} tickers={c.tickers} total={c.total} />
  );

  return (
    <>
      {/* Mobile: 1 column */}
      <div className="grid grid-cols-1 gap-6 mb-10 md:hidden">
        <div className="flex flex-col gap-6">{cols1[0].map(renderCard)}</div>
      </div>

      {/* Tablet: 2 columns */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 mb-10">
        {cols2.map((col, i) => (
          <div key={`md-col-${i}`} className="flex flex-col gap-6">
            {col.map(renderCard)}
          </div>
        ))}
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cols3.map((col, i) => (
          <div key={`lg-col-${i}`} className="flex flex-col gap-6">
            {col.map(renderCard)}
          </div>
        ))}
      </div>
    </>
  );
}
