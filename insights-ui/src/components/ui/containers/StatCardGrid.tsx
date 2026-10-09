import MetricCell from '@/components/ui/MetricCell';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';

/**
 * A row of headline stat cards (`MetricCell size="lg"`) for any number of
 * stats. Two per row on phones and tablets and all in one row on desktop; with
 * an odd count the last card spans the full row below desktop, so no row is
 * left half-empty.
 */

const grid = cva('grid grid-cols-2 gap-3', {
  variants: {
    desktop: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      // Six cards are too narrow for their values at small desktop widths.
      6: 'lg:grid-cols-3 xl:grid-cols-6',
      many: 'lg:grid-cols-4',
    },
  },
});

export interface StatCardGridProps {
  stats: Array<{ label: string; value: React.ReactNode; note?: string }>;
  className?: string;
}

export default function StatCardGrid({ stats, className }: StatCardGridProps): React.JSX.Element {
  const count = stats.length;
  const desktop = count <= 6 ? (Math.max(count, 1) as 1 | 2 | 3 | 4 | 5 | 6) : 'many';
  // When some cards carry a note, the others keep an empty note line so every value sits at the same height.
  const hasNotes = stats.some((stat) => Boolean(stat.note));
  return (
    <div className={cn(grid({ desktop }), className)}>
      {stats.map((stat, index) => (
        <MetricCell
          key={stat.label}
          size="lg"
          label={stat.label}
          value={stat.value}
          note={stat.note ?? (hasNotes ? '\u00a0' : undefined)}
          className={cn(count % 2 === 1 && index === count - 1 && 'col-span-2 lg:col-span-1')}
        />
      ))}
    </div>
  );
}
