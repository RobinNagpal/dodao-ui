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
const cellBox = cva('rounded-md bg-gray-800', {
  variants: {
    size: { sm: 'px-2 py-1.5', xs: 'px-2 py-1' },
  },
  defaultVariants: { size: 'sm' },
});

const cellValue = cva('font-semibold', {
  variants: {
    size: { sm: 'text-sm', xs: 'text-xs' },
    sentiment: { positive: 'text-green-400', negative: 'text-red-400', neutral: 'text-gray-100', none: '' },
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
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {loading ? (
        <div className="rounded animate-pulse">--</div>
      ) : (
        <div className={cn(cellValue({ size, sentiment }))}>{value ?? '—'}</div>
      )}
    </div>
  );
}
