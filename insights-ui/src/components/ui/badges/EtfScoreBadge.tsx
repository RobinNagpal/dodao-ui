import { cn } from '@/lib/utils';
import { getEtfScoreColorClasses } from '@/utils/score-utils';
import { cva } from 'class-variance-authority';
import React from 'react';

interface EtfScoreBadgeProps {
  /** KoalaGains final score (0–20); `null` renders a neutral em-dash. */
  score: number | null;
  /** `row` = fixed-width right-aligned pill (grouping-card lists); `inline` = compact pill (filterable grid header). */
  variant?: 'row' | 'inline';
  className?: string;
}

const etfScoreBadge = cva('rounded-md bg-opacity-15 font-mono tabular-nums text-xs', {
  variants: {
    variant: {
      row: 'px-1 w-[46px] text-right shrink-0 hover:bg-opacity-25',
      inline: 'px-1.5',
    },
  },
  defaultVariants: { variant: 'row' },
});

/** Single source of truth for the per-ETF score pill (color + label). */
export default function EtfScoreBadge({ score, variant = 'row', className }: EtfScoreBadgeProps): React.JSX.Element {
  const { textColorClass, bgColorClass } = getEtfScoreColorClasses(score);
  const label = score !== null ? `${score}/20` : '—';
  const title = score !== null ? `KoalaGains score: ${score}/20` : undefined;

  return (
    <span title={title} className={cn(etfScoreBadge({ variant }), textColorClass, bgColorClass, className)}>
      {label}
    </span>
  );
}
