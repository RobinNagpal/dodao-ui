import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export interface ReportSectionHeaderProps {
  /** Main heading content (e.g. an analysis title or a fund name). */
  title: React.ReactNode;
  /** When set, appended after the title as a muted `(SYMBOL)` suffix. */
  symbol?: string;
  /** Exchange label shown as the first meta pill. */
  exchange: string;
  /** Optional pass/total score chip (omitted on competition pages). */
  score?: { pass: number; total: number };
  /** Last-modified date (drives the `<time>` machine-readable attribute). */
  modifiedDate: Date;
  /** Human-formatted modified date (caller controls locale). */
  formattedModifiedDate: string;
  /** Destination for the right-aligned action link. */
  actionHref: string;
  actionLabel?: React.ReactNode;
  /** Optional extra row under the meta line (e.g. metadata badges). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Bordered report header: title (h1) + a meta row (exchange pill, optional
 * score chip, modified date) + an optional metadata slot + a right-aligned
 * "View Full Report" link. Shared verbatim by the stock and ETF category
 * reports and the competition views.
 */
export default function ReportSectionHeader({
  title,
  symbol,
  exchange,
  score,
  modifiedDate,
  formattedModifiedDate,
  actionHref,
  actionLabel = 'View Full Report →',
  children,
  className,
}: ReportSectionHeaderProps): React.JSX.Element {
  return (
    <header className={cn('mb-6 pb-4 border-b border-border', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-body mb-2" itemProp="headline">
            {title}
            {symbol && <span className="text-muted-foreground"> ({symbol})</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
            {/* `badge-tone-info` is a style-free hook — light mode darkens the sky-300 text via `.page-theme-light`. */}
            <span className="badge-tone-info inline-flex items-center rounded-full bg-sky-500/15 border border-sky-500/40 px-2.5 py-0.5 text-xs font-medium text-sky-300">
              {exchange}
            </span>
            {score && (
              <>
                <span className="text-muted-foreground">•</span>
                <div
                  className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                >
                  {score.pass}/{score.total}
                </div>
              </>
            )}
            <span className="text-muted-foreground">•</span>
            <time dateTime={modifiedDate.toISOString()} className="text-muted-foreground text-sm" itemProp="dateModified">
              {formattedModifiedDate}
            </time>
          </div>
          {children}
        </div>
        <Link href={actionHref} prefetch={false} className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1">
          {actionLabel}
        </Link>
      </div>
    </header>
  );
}
