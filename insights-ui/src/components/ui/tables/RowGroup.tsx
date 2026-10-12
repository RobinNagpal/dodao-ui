import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Collapsible groups of rows in a long reference table (e.g. the chapter rate table grouped by
 * 4-digit HTS heading). Each group has a full-width toggle row — code, title, an optional official
 * description, a key value and an aside such as the line count — that opens the group's rows.
 *
 * `TableRowGroup` is the desktop form: two `<tbody>`s inside a `DataTable` (the toggle row, then
 * the rows), so every group shares the table's one header and column widths. `StackedRowGroup` is
 * the phone form, a list item inside a `StackedRowList`.
 *
 * Collapsed rows are still rendered — the body only gets the `hidden` attribute — so every row stays
 * in the server HTML for search engines and a group opens without fetching anything.
 *
 * The toggle row's layout follows the heading summary row from PR #1822: it stacks on phones (code
 * and aside on one line, then title, description and value) and lines up in columns from `md`.
 */

const toggle = cva(
  'grid w-full scroll-mt-28 grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 px-3 py-3 text-left transition-colors ' +
    '[grid-template-areas:"code_aside_chev""title_title_title""desc_desc_desc""value_value_value"] ' +
    'md:grid-cols-[4.5rem_minmax(0,1fr)_14rem_8rem_1.25rem] md:gap-x-4 ' +
    'md:[grid-template-areas:"code_title_value_aside_chev""code_desc_value_aside_chev"] ' +
    'hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      expanded: { true: 'bg-surface-2', false: '' },
    },
    defaultVariants: { expanded: false },
  }
);

export interface RowGroupToggleProps {
  /** Monospace code, e.g. the HTS heading "0102". */
  code: string;
  title: React.ReactNode;
  /** Muted second line under the title, e.g. the heading's official wording. */
  description?: React.ReactNode;
  /** The group's key figure, e.g. its rate summary ("Free · 1¢/kg"). */
  value?: React.ReactNode;
  /** Muted note on the right, e.g. "35 lines" or "3 matches". */
  aside?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  /** Id of the element the toggle opens (`aria-controls`). */
  controls: string;
  className?: string;
}

/** The button that opens and closes a group. */
export function RowGroupToggle({ code, title, description, value, aside, expanded, onToggle, controls, className }: RowGroupToggleProps): React.JSX.Element {
  return (
    <button type="button" aria-expanded={expanded} aria-controls={controls} onClick={onToggle} className={cn(toggle({ expanded }), className)}>
      <span className="[grid-area:code] font-mono text-sm font-semibold tabular-nums text-primary">{code}</span>
      <span className="[grid-area:title] mt-1 text-base font-semibold text-heading md:mt-0">{title}</span>
      {description && <span className="[grid-area:desc] mt-0.5 text-xs text-muted">{description}</span>}
      {value && <span className="[grid-area:value] mt-1 text-sm text-body md:mt-0">{value}</span>}
      {aside && <span className="[grid-area:aside] justify-self-end whitespace-nowrap text-xs text-muted md:justify-self-start md:text-sm">{aside}</span>}
      <ChevronDownIcon
        className={cn('[grid-area:chev] h-5 w-5 shrink-0 self-center text-muted transition-transform', expanded && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  );
}

export type TableRowGroupProps = Omit<RowGroupToggleProps, 'controls'> & {
  /** Anchor id on the toggle row, e.g. "0102" so `#0102` lands on it. */
  id: string;
  /** Number of columns in the table, so the toggle row spans them all. */
  colSpan: number;
  /** The group's `TableRow`s. */
  children: React.ReactNode;
};

/** Desktop group inside a `DataTable`: the toggle row and the group's rows, hidden (not removed) while collapsed. */
export function TableRowGroup({ id, colSpan, children, ...toggleProps }: TableRowGroupProps): React.JSX.Element {
  const bodyId = `${id}-rows`;
  return (
    <>
      <tbody>
        <tr id={id} className="scroll-mt-28 border-t border-border">
          <td colSpan={colSpan} className="p-0">
            <RowGroupToggle {...toggleProps} controls={bodyId} />
          </td>
        </tr>
      </tbody>
      <tbody id={bodyId} hidden={!toggleProps.expanded}>
        {children}
      </tbody>
    </>
  );
}

export type StackedRowGroupProps = Omit<RowGroupToggleProps, 'controls'> & {
  /** Anchor id on the group, e.g. "phone-0102". */
  id: string;
  /** The group's `StackedRow`s. */
  children: React.ReactNode;
};

/** Phone group inside a `StackedRowList`: the toggle and a nested list, hidden (not removed) while collapsed. */
export function StackedRowGroup({ id, children, ...toggleProps }: StackedRowGroupProps): React.JSX.Element {
  const bodyId = `${id}-rows`;
  return (
    <li id={id} className="scroll-mt-28 border-t border-border first:border-t-0">
      <RowGroupToggle {...toggleProps} controls={bodyId} />
      <ul id={bodyId} hidden={!toggleProps.expanded} className="border-t border-border">
        {children}
      </ul>
    </li>
  );
}
