import { EtfGroupingPreviewItem } from '@/utils/etf-grouping-utils';
import { getEtfScoreColorClasses } from '@/utils/score-utils';
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
      <Link href={href} className="block px-3 py-2 sm:px-4 border-b border-color bg-[#374151] hover:bg-[#2D3748] transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug break-words pr-24" title={categoryName}>
          {categoryName}
        </h3>
      </Link>
      <div className="absolute top-2 right-2 z-10 text-[13px] text-white bg-[#4F46E5] px-2 py-0.5 rounded-full" aria-label={etfLabel} title={etfLabel}>
        {etfLabel}
      </div>
      <ul className="divide-y divide-color flex-1">
        {etfs.map((etf) => {
          const { textColorClass, bgColorClass } = getEtfScoreColorClasses(etf.finalScore);
          const scoreLabel = etf.finalScore !== null ? `${etf.finalScore}/20` : '—';
          return (
            <li key={etf.id} className="px-3 sm:px-4 py-1.5 hover:bg-[#2D3748] transition-colors">
              <Link
                href={`/etfs/${etf.exchange}/${etf.symbol}`}
                className="flex gap-1.5 items-center min-w-0 w-full"
                aria-label={`View ${etf.name}`}
                title={etf.name}
              >
                <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[46px] text-right shrink-0`}>
                  <span className={`${textColorClass} font-mono tabular-nums text-right text-xs`}>{scoreLabel}</span>
                </p>
                <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm shrink-0">
                  {etf.symbol}
                </p>
                <p className="text-sm font-medium text-break break-words text-white truncate min-w-0 flex-1">{etf.name}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
