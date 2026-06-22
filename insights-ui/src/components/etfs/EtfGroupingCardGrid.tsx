import CompactEtfGroupingCard from '@/components/etfs/CompactEtfGroupingCard';
import type { EtfGroupingPreviewItem } from '@/types/etf/etf-listings-types';
import React from 'react';

export interface EtfGroupingCardSpec {
  key: string;
  title: string;
  href: string;
  totalCount?: number;
  etfs: EtfGroupingPreviewItem[];
}

interface EtfGroupingCardGridProps {
  items: EtfGroupingCardSpec[];
  /** Max columns at the largest breakpoint: 3 (asset-class / provider indexes) or 4 (groups index). */
  columns?: 3 | 4;
}

/** Responsive grid of {@link CompactEtfGroupingCard} preview cards, shared by every ETF grouping index. */
export default function EtfGroupingCardGrid({ items, columns = 4 }: EtfGroupingCardGridProps): React.JSX.Element {
  const gridClass =
    columns === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6';

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <CompactEtfGroupingCard key={item.key} title={item.title} href={item.href} totalCount={item.totalCount} etfs={item.etfs} />
      ))}
    </div>
  );
}
