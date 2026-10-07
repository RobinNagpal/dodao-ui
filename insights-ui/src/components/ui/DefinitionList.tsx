import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Compact term → definition grid, for code legends and glossaries (e.g. the
 * Special Program Indicators that appear in a chapter's FTA rate column).
 */

const list = cva('grid gap-x-4 gap-y-1.5', {
  variants: {
    columns: { '1': 'grid-cols-1', '1-2': 'grid-cols-1 sm:grid-cols-2', '1-2-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' },
  },
  defaultVariants: { columns: '1-2' },
});

export interface DefinitionListItem {
  term: string;
  definition: string;
}

export type DefinitionListProps = VariantProps<typeof list> & {
  items: DefinitionListItem[];
  className?: string;
};

export default function DefinitionList({ items, columns, className }: DefinitionListProps): React.JSX.Element {
  return (
    <dl className={cn(list({ columns }), className)}>
      {items.map((item) => (
        <div key={item.term} className="flex items-baseline gap-2">
          <dt className="shrink-0 font-mono text-xs font-semibold text-primary">{item.term}</dt>
          <dd className="text-xs text-muted">{item.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
