import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Two-column responsive split (stacks on mobile, side-by-side `lg:w-1/2` on
 * large screens). Used for content-left / chart-right report layouts on both
 * the stock and ETF detail pages.
 */
const split = cva('flex flex-col lg:flex-row', {
  variants: {
    // `md` is the normalized default (was a 3-way drift of gap-8 / gap-4 lg:gap-8 / gap-6 lg:gap-8).
    gap: { md: 'gap-6 lg:gap-8', flat: 'gap-8', tight: 'gap-4 lg:gap-8' },
  },
  defaultVariants: { gap: 'md' },
});

export type SplitColumnsProps = VariantProps<typeof split> & {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
};

export default function SplitColumns({ left, right, gap, className }: SplitColumnsProps): React.JSX.Element {
  return (
    <div className={cn(split({ gap }), className)}>
      <div className="lg:w-1/2">{left}</div>
      <div className="lg:w-1/2">{right}</div>
    </div>
  );
}
