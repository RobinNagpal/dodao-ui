import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Responsive grid for metric/stat cells. Column presets are full literal class
 * strings (so Tailwind's content scanner keeps them) — add new presets here
 * instead of writing `grid-cols-*` upstream.
 */
const metricGrid = cva('grid', {
  variants: {
    columns: {
      '1': 'grid-cols-1',
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      '1-3': 'grid-cols-1 md:grid-cols-3',
      '1-3-wide': 'grid-cols-1 lg:grid-cols-3',
      '1-2': 'grid-cols-1 lg:grid-cols-2',
      '2-3-4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      '2-4': 'grid-cols-2 lg:grid-cols-4',
      '2-4-7': 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7',
      '2-3-5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    },
    gap: { sm: 'gap-2', md: 'gap-3', lg: 'gap-4', xl: 'gap-6' },
  },
  defaultVariants: { columns: '2', gap: 'sm' },
});

export type MetricGridColumns = NonNullable<VariantProps<typeof metricGrid>['columns']>;

/** Columns for a grid of text cards: whole rows where the count allows, one per row on phones. */
export function cardGridColumns(count: number): MetricGridColumns {
  if (count <= 1) return '1';
  if (count === 2 || count === 4) return '1-2';
  if (count === 3) return '1-3-wide';
  return '1-2-3';
}

export type MetricGridProps = VariantProps<typeof metricGrid> & {
  children: React.ReactNode;
  className?: string;
};

export default function MetricGrid({ children, className, columns, gap }: MetricGridProps): React.JSX.Element {
  return <div className={cn(metricGrid({ columns, gap }), className)}>{children}</div>;
}

/** A MetricGrid child that spans every column — for an item too wide for one cell (e.g. one with a table). */
export function GridItem({ children, span = 'one', className }: { children: React.ReactNode; span?: 'one' | 'full'; className?: string }): React.JSX.Element {
  return <div className={cn(span === 'full' && 'col-span-full', className)}>{children}</div>;
}
