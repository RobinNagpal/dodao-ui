import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Compact term → definition list.
 *
 * - `codes` (default): a grid of short monospace codes and their meanings, for
 *   code legends and glossaries (e.g. the Special Program Indicators that
 *   appear in a chapter's FTA rate column).
 * - `fields`: labelled fields of one record ("Saves", "Applies to", …) — a
 *   fixed label column beside the value, stacking on phones.
 */

const list = cva('grid gap-x-4', {
  variants: {
    columns: { '1': 'grid-cols-1', '1-2': 'grid-cols-1 sm:grid-cols-2', '1-2-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' },
    look: { codes: 'gap-y-1.5', fields: 'gap-y-2' },
  },
  defaultVariants: { columns: '1-2', look: 'codes' },
});

const row = cva('flex', {
  variants: {
    look: { codes: 'items-baseline gap-2', fields: 'flex-col gap-0.5 sm:flex-row sm:gap-3' },
  },
  defaultVariants: { look: 'codes' },
});

const term = cva('shrink-0', {
  variants: {
    look: { codes: 'font-mono text-xs font-semibold text-primary', fields: 'text-sm text-muted sm:w-28' },
  },
  defaultVariants: { look: 'codes' },
});

const definition = cva('min-w-0', {
  variants: {
    look: { codes: 'text-xs text-muted', fields: 'text-sm text-body' },
  },
  defaultVariants: { look: 'codes' },
});

export interface DefinitionListItem {
  term: React.ReactNode;
  definition: React.ReactNode;
}

export type DefinitionListProps = VariantProps<typeof list> & {
  items: DefinitionListItem[];
  className?: string;
};

export default function DefinitionList({ items, columns, look, className }: DefinitionListProps): React.JSX.Element {
  return (
    <dl className={cn(list({ columns, look }), className)}>
      {items.map((item, index) => (
        <div key={index} className={row({ look })}>
          <dt className={term({ look })}>{item.term}</dt>
          <dd className={definition({ look })}>{item.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
