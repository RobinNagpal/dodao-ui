import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * A short table-like list (code · title + description · value · aside) that
 * stays readable on phones. From `md` up the rows line up in four columns
 * under a header row; below `md` each row stacks — code and aside on one line,
 * then the title, the value and the description — so nothing scrolls sideways
 * and the markup is rendered once for both layouts.
 *
 * Used for the chapter overview's per-heading rate summary.
 */

// Phone: "code aside" / "title" / "value" / "desc". md+: four columns, with the
// title and description sharing the second column and the rest spanning both rows.
const ROW_GRID =
  'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 [grid-template-areas:"code_aside""title_title""value_value""desc_desc"] ' +
  'md:grid-cols-[4.5rem_minmax(0,1fr)_11rem_7rem] md:gap-x-6 md:[grid-template-areas:"code_title_value_aside""code_desc_value_aside"]';

export interface SummaryRowListProps {
  /** Labels for the four md+ columns, e.g. ["Heading", "Products", "Base rates", "Tariff lines"]. */
  columns: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
  children: React.ReactNode;
  className?: string;
}

export function SummaryRowList({ columns, children, className }: SummaryRowListProps): React.JSX.Element {
  return (
    <div className={className}>
      <div className={cn(ROW_GRID, 'hidden pb-2 text-sm font-semibold text-heading md:grid')}>
        <span className="[grid-area:code]">{columns[0]}</span>
        <span className="[grid-area:title]">{columns[1]}</span>
        <span className="[grid-area:value]">{columns[2]}</span>
        <span className="[grid-area:aside]">{columns[3]}</span>
      </div>
      <ul>{children}</ul>
    </div>
  );
}

const rowValue = cva('[grid-area:value] mt-2 text-sm md:mt-0', {
  variants: {
    emphasis: { true: 'font-semibold text-heading', false: 'text-body' },
  },
  defaultVariants: { emphasis: false },
});

export type SummaryRowProps = VariantProps<typeof rowValue> & {
  /** Anchor target, e.g. the HTS heading "0104". */
  id?: string;
  /** Monospace code, e.g. "0104". */
  code: string;
  title: string;
  /** The row's key figure, e.g. the heading's rate summary. */
  value: React.ReactNode;
  /** Muted note, e.g. "7 lines, 2 dutiable". */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function SummaryRow({ id, code, title, value, emphasis, aside, children, className }: SummaryRowProps): React.JSX.Element {
  return (
    <li id={id} className={cn(ROW_GRID, 'scroll-mt-24 items-baseline border-t border-border py-4', className)}>
      <span className="[grid-area:code] font-mono text-sm font-semibold text-primary">{code}</span>
      {aside && <span className="[grid-area:aside] justify-self-end text-xs text-muted md:justify-self-start md:text-sm">{aside}</span>}
      <span className="[grid-area:title] mt-1 text-base font-semibold text-heading md:mt-0">{title}</span>
      <span className={rowValue({ emphasis })}>{value}</span>
      {children && <span className="[grid-area:desc] mt-1 text-sm text-muted">{children}</span>}
    </li>
  );
}
