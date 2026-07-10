import EtfScoreBadge from '@/components/ui/badges/EtfScoreBadge';
import type { EtfGroupingPreviewItem } from '@/types/etf/etf-listings-types';
import Link from 'next/link';
import React from 'react';

interface EtfCategoryCardProps {
  categoryName: string;
  href: string;
  etfs: EtfGroupingPreviewItem[];
  total: number;
}

/**
 * Full ETF list per category, mirroring `SubIndustryCard` on the stocks side.
 * Header acts as a link to the category detail page; "X ETFs" badge sits in
 * the corner.
 */
export default function EtfCategoryCard({ categoryName, href, etfs, total }: EtfCategoryCardProps): React.JSX.Element {
  const etfLabel = `${total.toLocaleString()} ${total === 1 ? 'ETF' : 'ETFs'}`;

  return (
    <div className="relative bg-block-bg-color rounded-lg border border-color overflow-hidden flex flex-col">
      <Link href={href} prefetch={false} className="block px-3 py-2 sm:px-4 border-b border-color bg-surface-2 hover:bg-surface-3 transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug break-words pr-24" title={categoryName}>
          {categoryName}
        </h3>
      </Link>
      <div className="absolute top-2 right-2 z-10 text-[13px] text-primary-text bg-primary px-2 py-0.5 rounded-full" aria-label={etfLabel} title={etfLabel}>
        {etfLabel}
      </div>
      <ul className="divide-y divide-color flex-1">
        {etfs.map((etf) => (
          <li key={etf.id} className="px-3 sm:px-4 py-1.5 hover:bg-surface-3 transition-colors">
            <Link
              href={`/etfs/${etf.exchange}/${etf.symbol}`}
              prefetch={false}
              className="flex gap-1.5 items-center min-w-0 w-full"
              aria-label={`View ${etf.name}`}
              title={etf.name}
            >
              <EtfScoreBadge score={etf.finalScore} />
              <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-primary text-primary-text self-center shadow-sm shrink-0">
                {etf.symbol}
              </p>
              <p className="text-sm font-medium text-break break-words text-heading truncate min-w-0 flex-1">{etf.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
