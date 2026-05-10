import { EtfGroupingPreviewItem } from '@/utils/etf-grouping-utils';
import Link from 'next/link';
import React from 'react';

interface CompactEtfGroupingCardProps {
  title: string;
  href: string;
  totalCount?: number;
  etfs: EtfGroupingPreviewItem[];
}

function getEtfScoreColorClasses(score: number | null): { textColorClass: string; bgColorClass: string } {
  if (score === null) {
    return { textColorClass: 'text-gray-400', bgColorClass: 'bg-gray-500' };
  }
  if (score >= 75) return { textColorClass: 'text-green-500', bgColorClass: 'bg-green-500' };
  if (score >= 50) return { textColorClass: 'text-yellow-500', bgColorClass: 'bg-yellow-500' };
  if (score >= 25) return { textColorClass: 'text-orange-500', bgColorClass: 'bg-orange-500' };
  return { textColorClass: 'text-red-500', bgColorClass: 'bg-red-500' };
}

export default function CompactEtfGroupingCard({ title, href, totalCount, etfs }: CompactEtfGroupingCardProps): React.JSX.Element {
  return (
    <div className="bg-block-bg-color rounded-lg border border-color overflow-hidden">
      <Link href={href} className="block px-3 py-1.5 bg-[#374151] hover:bg-[#2D3748] transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug mb-0.5 text-left flex justify-between items-start gap-2" title={title}>
          <span className="whitespace-normal break-words">{title}</span>
          {typeof totalCount === 'number' && totalCount > 0 && <span className="text-xs font-normal text-gray-300 shrink-0">{totalCount} ETFs</span>}
        </h3>
      </Link>

      {etfs.length > 0 ? (
        <div className="px-3 py-1">
          <ul className="space-y-1">
            {etfs.map((etf) => {
              const { textColorClass, bgColorClass } = getEtfScoreColorClasses(etf.finalScore);
              const scoreLabel = etf.finalScore !== null ? String(etf.finalScore) : '—';

              return (
                <li key={etf.id}>
                  <Link
                    href={`/etfs/${etf.exchange}/${etf.symbol}`}
                    className="flex items-center gap-1.5 py-1 hover:bg-[#2D3748] transition-colors rounded px-1 -mx-1"
                  >
                    <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[34px] text-right`}>
                      <span className={`${textColorClass} text-xs font-mono`}>{scoreLabel}</span>
                    </p>
                    <span className="text-xs font-medium bg-[#4F46E5] text-white ml-1.5 px-1.5 py-0.5 rounded">{etf.symbol}</span>
                    <span className="text-xs text-white truncate">{etf.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="px-3 py-2">
          <p className="text-xs text-gray-400">No ETFs available.</p>
        </div>
      )}
    </div>
  );
}
