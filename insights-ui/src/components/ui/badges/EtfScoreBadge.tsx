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

  // NOTE: do NOT route these classes through `cn`/tailwind-merge. The faint-pill
  // look relies on `bg-opacity-15` sitting alongside a dynamic `bg-{color}`;
  // tailwind-merge treats them as conflicting and drops `bg-opacity-15`, which
  // makes the pill fully opaque and hides the same-colored text until hover.
  // Plain concatenation preserves the original (and JIT-safe) class pairing.
  const classes = [etfScoreBadge({ variant }), textColorClass, bgColorClass, className].filter(Boolean).join(' ');

  return (
    <span title={title} className={classes}>
      {label}
    </span>
  );
}
