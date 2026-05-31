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
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      '2-3-4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      '2-4-7': 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7',
    },
    gap: { sm: 'gap-2', md: 'gap-3', lg: 'gap-4', xl: 'gap-6' },
  },
  defaultVariants: { columns: '2', gap: 'sm' },
});

export type MetricGridProps = VariantProps<typeof metricGrid> & {
  children: React.ReactNode;
  className?: string;
};

export default function MetricGrid({ children, className, columns, gap }: MetricGridProps): React.JSX.Element {
  return <div className={cn(metricGrid({ columns, gap }), className)}>{children}</div>;
}
