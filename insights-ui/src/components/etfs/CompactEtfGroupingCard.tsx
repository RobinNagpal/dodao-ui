import EtfScoreBadge from '@/components/ui/badges/EtfScoreBadge';
import type { EtfGroupingPreviewItem } from '@/types/etf/etf-listings-types';
import Link from 'next/link';
import React from 'react';

interface CompactEtfGroupingCardProps {
  title: string;
  href: string;
  totalCount?: number;
  etfs: EtfGroupingPreviewItem[];
  maxRows?: number;
}

const DEFAULT_MAX_ROWS = 4;

export default function CompactEtfGroupingCard({ title, href, totalCount, etfs, maxRows = DEFAULT_MAX_ROWS }: CompactEtfGroupingCardProps): React.JSX.Element {
  const displayedEtfs = etfs.slice(0, maxRows);

  return (
    <div className="bg-block-bg-color rounded-lg border border-color overflow-hidden">
      <Link href={href} prefetch={false} className="block px-3 py-1.5 bg-surface-2 hover:bg-surface-3 transition-colors">
        <h3 className="text-sm font-semibold heading-color leading-snug mb-0.5 text-left flex justify-between items-start gap-2" title={title}>
          <span className="whitespace-normal break-words">{title}</span>
          {typeof totalCount === 'number' && totalCount > 0 && <span className="text-xs font-normal text-body shrink-0">{totalCount} ETFs</span>}
        </h3>
      </Link>

      {displayedEtfs.length > 0 ? (
        <div className="px-3 py-1">
          <ul className="space-y-1">
            {displayedEtfs.map((etf) => (
              <li key={etf.id}>
                <Link
                  href={`/etfs/${etf.exchange}/${etf.symbol}`}
                  prefetch={false}
                  className="flex items-center gap-1.5 py-1 hover:bg-surface-3 transition-colors rounded px-1 -mx-1"
                >
                  <EtfScoreBadge score={etf.finalScore} />
                  <span className="text-xs font-medium bg-primary text-primary-text ml-1.5 px-1.5 py-0.5 rounded">{etf.symbol}</span>
                  <span className="text-xs text-heading truncate">{etf.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="px-3 py-2">
          <p className="text-xs text-muted">No ETFs available.</p>
        </div>
      )}
    </div>
  );
}
