import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Phone layout for a wide reference table (e.g. the chapter rate table): each row becomes one
 * list item with its code and key value on the first line and its label in full width below,
 * instead of a table that shows two columns at a time. The other columns move into the row's
 * detail, opened by tapping the row.
 *
 * Indentation uses a tighter scale than the table's `IndentedLabel` — a phone can't spare 64px
 * at the deepest level — and shifts the whole row, so the hierarchy reads as a tree.
 *
 * Rows can also be picked rather than expanded (`onSelect`), e.g. search results in a line picker;
 * `selected` on the list marks the one that was picked.
 */

const list = cva('rounded-lg border', {
  variants: {
    selected: { true: 'border-primary bg-primary/10', false: 'border-border' },
  },
  defaultVariants: { selected: false },
});

export type StackedRowListProps = VariantProps<typeof list> & {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function StackedRowList({ header, selected, children, className }: StackedRowListProps): React.JSX.Element {
  return (
    <div className={cn(list({ selected }), className)}>
      {header}
      <ul>{children}</ul>
    </div>
  );
}

/** Column labels above the list, pinned to the top of the window while the list scrolls past. */
export function StackedRowListHeader({ label, value }: { label: React.ReactNode; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="sticky top-0 z-10 flex items-baseline justify-between gap-3 rounded-t-lg border-b border-border bg-bg px-3 py-2.5 text-sm font-semibold text-muted">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

const item = cva('border-t border-border first:border-t-0', {
  variants: {
    // `group`: a heading row that only nests the rows below it, same treatment as the table's group rows.
    emphasis: { group: 'bg-bg/50 font-medium', normal: '' },
  },
  defaultVariants: { emphasis: 'normal' },
});

const content = cva('flex w-full min-h-11 flex-col justify-center gap-0.5 py-2 pr-3 text-left', {
  variants: {
    indent: { 0: 'pl-3', 1: 'pl-3', 2: 'pl-5', 3: 'pl-7', 4: 'pl-9', 5: 'pl-11', 6: 'pl-[3.25rem]' },
    interactive: {
      true: 'transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
      false: '',
    },
  },
  defaultVariants: { indent: 0, interactive: false },
});

const value = cva('shrink-0 whitespace-nowrap text-right text-sm', {
  variants: {
    tone: { body: 'text-body', muted: 'text-muted', emphasis: 'font-semibold text-heading', primary: 'font-medium text-primary' },
  },
  defaultVariants: { tone: 'body' },
});

export type StackedRowProps = VariantProps<typeof item> &
  VariantProps<typeof value> & {
    /** Monospace code on the first line (e.g. an HTS number). Without one, the label takes its place. */
    code?: React.ReactNode;
    /** The row's main text, e.g. the product description. */
    label: React.ReactNode;
    /** Key value, right-aligned on the first line (e.g. the base rate). */
    value?: React.ReactNode;
    /** Hierarchy depth, 0..6. Values above 6 clamp to 6. */
    indent?: number;
    /** Shown under the row while `expanded`. Rows without `onToggle` never expand. */
    detail?: React.ReactNode;
    expanded?: boolean;
    onToggle?: () => void;
    /** Picks the row instead of expanding it (no chevron, no detail). Ignored when `onToggle` is set. */
    onSelect?: () => void;
    id?: string;
  };

export function StackedRow({
  code,
  label,
  value: rowValue,
  tone,
  indent = 0,
  emphasis,
  detail,
  expanded = false,
  onToggle,
  onSelect,
  id,
}: StackedRowProps): React.JSX.Element {
  const depth = Math.max(0, Math.min(indent, 6)) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const interactive = Boolean(onToggle);
  const selectable = !interactive && Boolean(onSelect);
  const detailId = id ? `${id}-detail` : undefined;
  const labelText = <span className="min-w-0 text-sm text-body">{label}</span>;

  const body = (
    <>
      <span className="flex items-baseline justify-between gap-3">
        {code ? <span className="font-mono text-xs tabular-nums text-primary">{code}</span> : labelText}
        {rowValue && <span className={value({ tone })}>{rowValue}</span>}
      </span>
      {code && (
        <span className="flex items-start justify-between gap-3">
          {labelText}
          {interactive && (
            <ChevronDownIcon className={cn('mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
          )}
        </span>
      )}
    </>
  );

  return (
    <li id={id} className={item({ emphasis })}>
      {interactive ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? detailId : undefined}
          onClick={onToggle}
          className={content({ indent: depth, interactive })}
        >
          {body}
        </button>
      ) : selectable ? (
        <button type="button" onClick={onSelect} className={content({ indent: depth, interactive: true })}>
          {body}
        </button>
      ) : (
        <div className={content({ indent: depth })}>{body}</div>
      )}
      {interactive && expanded && detail && (
        <div id={detailId} className="px-3 pb-3">
          {detail}
        </div>
      )}
    </li>
  );
}
