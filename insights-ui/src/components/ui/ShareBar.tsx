import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Inline horizontal bar + label for a share column in a table ("19.9%"), with
 * the label right after the bar. `widthPct` is the bar's length relative to
 * the column's largest value (100 = the longest bar); the longest bar takes
 * three-quarters of the cell so its label still fits beside it.
 *
 * Tones match the series colors of the tariff import charts (ImportsByYearChart):
 * `primary` (brand purple) and `teal`. Colors are inline so the bar never
 * depends on a utility class being generated.
 */

const BAR_COLOR = {
  primary: 'var(--primary-color)',
  teal: '#14b8a6',
} as const;

export interface ShareBarProps {
  /** Bar length, 0–100, relative to the column's largest value. */
  widthPct: number;
  label: React.ReactNode;
  tone?: keyof typeof BAR_COLOR;
  className?: string;
}

export default function ShareBar({ widthPct, label, tone = 'primary', className }: ShareBarProps): React.JSX.Element {
  const width = Math.max(1, Math.min(100, widthPct)) * 0.75;
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="block h-3 shrink-0 rounded" style={{ width: `${width}%`, backgroundColor: BAR_COLOR[tone] }} />
      <span className="whitespace-nowrap text-xs text-body">{label}</span>
    </span>
  );
}
