import EtfCategoryCard from '@/components/etfs/EtfCategoryCard';
import type { EtfGroupingPreviewItem } from '@/types/etf/etf-listings-types';
import React from 'react';

export interface EtfCategoryCardSpec {
  key: string;
  categoryName: string;
  href: string;
  etfs: EtfGroupingPreviewItem[];
  total: number;
}

const CARD_HEADER_PX = 41;
const ROW_PX = 36;

function estimateCardHeight(rowCount: number): number {
  return CARD_HEADER_PX + rowCount * ROW_PX;
}

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

interface EtfCategoriesGridProps {
  categories: EtfCategoryCardSpec[];
  emptyMessage?: string;
}

/**
 * Mirrors `IndustryStocksGrid`: pack category cards into 1/2/3 columns based on
 * estimated card height so the columns end roughly the same height.
 */
export default function EtfCategoriesGrid({ categories, emptyMessage }: EtfCategoriesGridProps): React.JSX.Element {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#E5E7EB] text-lg">{emptyMessage ?? 'No ETFs available.'}</p>
      </div>
    );
  }

  const items = categories.map((c) => ({ ...c, estH: estimateCardHeight(c.etfs.length) }));
  const cols1 = [items];
  const cols2 = packIntoColumns(items, 2);
  const cols3 = packIntoColumns(items, 3);

  const renderCard = (c: (typeof items)[number]) => <EtfCategoryCard key={c.key} categoryName={c.categoryName} href={c.href} etfs={c.etfs} total={c.total} />;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 mb-10 md:hidden">
        <div className="flex flex-col gap-6">{cols1[0].map(renderCard)}</div>
      </div>

      <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 mb-10">
        {cols2.map((col, i) => (
          <div key={`md-col-${i}`} className="flex flex-col gap-6">
            {col.map(renderCard)}
          </div>
        ))}
      </div>

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
