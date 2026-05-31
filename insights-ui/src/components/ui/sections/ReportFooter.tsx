import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

export type ReportTagTone = 'family' | 'competitive' | 'category' | 'movers' | 'none';

/** Rounded tag pill shown in the report footer. `tone` covers the known
 *  families; `className` is an escape hatch for a data-driven category color. */
const tag = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      family: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      competitive: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
      category: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300',
      movers: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      none: '',
    },
  },
  defaultVariants: { tone: 'none' },
});

export interface ReportFooterTag {
  label: React.ReactNode;
  tone?: ReportTagTone;
  /** Escape hatch for a per-category color not covered by `tone`. */
  className?: string;
}

export interface ReportFooterProps {
  modifiedDate: Date;
  formattedModifiedDate: string;
  tags?: ReportFooterTag[];
  className?: string;
}

/**
 * Report footer: "Last updated by KoalaGains on {date}" (with schema.org
 * author/dateModified) plus a row of category tag pills. Shared by the stock
 * and ETF category reports, competition views, and management-team page.
 */
export default function ReportFooter({ modifiedDate, formattedModifiedDate, tags, className }: ReportFooterProps): React.JSX.Element {
  return (
    <footer className={cn('mt-8 pt-6 border-t border-color', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span>Last updated by </span>
          <span itemProp="author" itemScope itemType="https://schema.org/Organization">
            <span itemProp="name">KoalaGains</span>
          </span>
          <span> on </span>
          <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
            {formattedModifiedDate}
          </time>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex gap-2">
            {tags.map((t, i) => (
              <span key={i} className={cn(tag({ tone: t.tone ?? 'none' }), t.className)}>
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
