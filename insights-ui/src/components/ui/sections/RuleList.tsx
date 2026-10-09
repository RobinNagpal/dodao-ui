import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * List whose items are separated by a top rule instead of boxed — for source
 * lists, citations and similar dense references. `columns` lays the items out
 * side by side on wider screens; each column keeps its own rules.
 */

const ruleList = cva('grid gap-x-6', {
  variants: {
    columns: { '1': 'grid-cols-1', '1-2': 'grid-cols-1 md:grid-cols-2' },
  },
  defaultVariants: { columns: '1' },
});

export type RuleListProps = VariantProps<typeof ruleList> & {
  children: React.ReactNode;
  /** `ol` for numbered/ordered references. Defaults to `ul`. */
  as?: 'ul' | 'ol';
  className?: string;
};

export function RuleList({ children, columns, as = 'ul', className }: RuleListProps): React.JSX.Element {
  const Tag = as;
  return <Tag className={cn(ruleList({ columns }), className)}>{children}</Tag>;
}

export function RuleListItem({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <li className={cn('flex flex-col gap-0.5 border-t border-border py-2.5', className)}>{children}</li>;
}
