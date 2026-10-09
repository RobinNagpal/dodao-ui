import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * One entry in a ruled list: a left column (a date and status pill, or a code
 * and name) beside the entry body, separated from the previous entry by a top
 * rule. Stacks on phones. `asideWidth="wide"` fits a short name in the left column.
 */

const aside = cva('flex shrink-0 flex-col items-start gap-1.5', {
  variants: {
    asideWidth: { narrow: 'sm:w-32', wide: 'sm:w-56' },
  },
  defaultVariants: { asideWidth: 'narrow' },
});

export type TimelineRowProps = VariantProps<typeof aside> & {
  /** Left column, e.g. the date and a status badge. */
  aside: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function TimelineRow({ aside: asideContent, asideWidth, children, className }: TimelineRowProps): React.JSX.Element {
  return (
    <article className={cn('flex flex-col gap-2 border-t border-border py-4 sm:flex-row sm:gap-4', className)}>
      <div className={aside({ asideWidth })}>{asideContent}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </article>
  );
}
