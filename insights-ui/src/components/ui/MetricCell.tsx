import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Small label + value box used across financial / key-metric grids. Replaces
 * the previously duplicated local `MetricCell` / `FinancialCard` definitions.
 *
 * `sentiment` drives the value color: positive (green) / negative (red) /
 * neutral (gray-100) / none (inherit the surrounding text color).
 */
const cellBox = cva('', {
  variants: {
    // `lg` is a headline stat card: bordered surface box with a large value.
    size: {
      sm: 'rounded-md bg-surface-2 px-2 py-1.5',
      xs: 'rounded-md bg-surface-2 px-2 py-1',
      lg: 'flex flex-col justify-between gap-1 rounded-lg border border-border bg-surface px-4 py-4',
    },
  },
  defaultVariants: { size: 'sm' },
});

const cellLabel = cva('text-muted', {
  variants: {
    size: { sm: 'text-xs mb-1', xs: 'text-xs mb-1', lg: 'text-sm' },
  },
  defaultVariants: { size: 'sm' },
});

const cellValue = cva('font-semibold', {
  variants: {
    size: { sm: 'text-sm', xs: 'text-xs', lg: 'text-xl font-bold text-heading sm:text-2xl' },
    sentiment: { positive: 'text-emerald-400', negative: 'text-red-400', neutral: 'text-body', none: '' },
  },
  defaultVariants: { size: 'sm', sentiment: 'none' },
});

export type MetricCellProps = VariantProps<typeof cellBox> & {
  label: string;
  value?: React.ReactNode;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'none';
  loading?: boolean;
  className?: string;
};

export default function MetricCell({ label, value, size, sentiment, loading = false, className }: MetricCellProps): React.JSX.Element {
  return (
    <div className={cn(cellBox({ size }), className)}>
      <div className={cellLabel({ size })}>{label}</div>
      {loading ? <div className="rounded animate-pulse">--</div> : <div className={cn(cellValue({ size, sentiment }))}>{value ?? '—'}</div>}
    </div>
  );
}
