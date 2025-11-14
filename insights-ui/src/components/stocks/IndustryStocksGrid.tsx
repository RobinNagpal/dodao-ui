import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import { SubIndustriesResponse, TickerMinimal } from '@/types/api/ticker-industries';
import { use } from 'react';

type CardSpec = {
  key: string;
  subIndustry: string;
  subIndustryName: string;
  tickers: TickerMinimal[];
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

export default function IndustryStocksGrid({
  data,
  dataPromise,
  industryName,
}: {
  data?: SubIndustriesResponse | null;
  dataPromise?: Promise<SubIndustriesResponse | null> | null;
  industryName?: string;
}) {
  // Handle both direct data and promise-based data
  const resolvedData = dataPromise ? use(dataPromise) : data;

  if (!resolvedData) {
    return null;
  }

  const { subIndustries, filtersApplied } = resolvedData;

  console.log(subIndustries);

  if (!subIndustries || subIndustries.flatMap((si) => si.tickers).length === 0) {
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

  // Build card specs w/ estimated heights for packing
  const cards: CardSpec[] = resolvedData.subIndustries.map((subIndustry) => ({
    key: subIndustry.subIndustryKey,
    subIndustry: subIndustry.subIndustryKey,
    subIndustryName: subIndustry.name,
    tickers: subIndustry.tickers,
    total: subIndustry.tickerCount,
    estH: estimateCardHeight(subIndustry.tickerCount),
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
