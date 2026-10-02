import { cn } from '@/lib/utils';
import React from 'react';

export interface CreditHistoryCardProps {
  /** What happened, e.g. "Report generation for AAPL (NASDAQ)". */
  title: React.ReactNode;
  /** Signed change, e.g. "+10" / "-1". */
  credits: string;
  /** Optional status badge under the title. */
  badge?: React.ReactNode;
  /** Small line under the title: date, balance, amount, receipt. */
  meta: React.ReactNode;
  className?: string;
}

/** One credit history row as a compact card, for phone widths. */
export default function CreditHistoryCard({ title, credits, badge, meta, className }: CreditHistoryCardProps): React.JSX.Element {
  return (
    <div className={cn('rounded-lg border border-border bg-surface px-3 py-2.5', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-sm font-medium text-heading">{title}</span>
        <span className="shrink-0 text-sm font-semibold text-heading">{credits}</span>
      </div>
      {badge && <div className="mt-1">{badge}</div>}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">{meta}</div>
    </div>
  );
}
