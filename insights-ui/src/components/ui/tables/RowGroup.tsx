import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Collapsible groups of rows in a long reference table (e.g. the chapter rate table grouped by
 * 4-digit HTS heading). Each group has a full-width toggle row — code, title, an optional official
 * description, an optional plain-language body, a key value with an optional note under it and an
 * aside such as the line count — that opens the group's rows.
 *
 * The groups are list items inside a `StackedRowList`, under a `RowGroupListHeader` that labels the
 * toggle row's columns (it shares the toggle's grid, so the labels line up with every heading).
 * An open group carries its own column header for its rows, so the row columns line up with the
 * labels above them:
 * - `TableRowGroup` (desktop): the body is a `DataTable` with its own `TableHead`; a sticky head
 *   stays pinned while that group's rows scroll past and leaves with the group.
 * - `StackedRowGroup` (phones): the body is a `StackedRowListHeader placement="group"` and a list
 *   of `StackedRow`s.
 *
 * Collapsed rows are still rendered — the body only gets the `hidden` attribute — so every row stays
 * in the server HTML for search engines and a group opens without fetching anything.
 *
 * The toggle row stacks on phones (code and aside on one line, then title, description and value)
 * and lines up in columns from `md` (layout from PR #1822's summary row). Every text area may wrap,
 * so a long blurb or rate summary never widens the page.
 */

// One grid template for the toggle rows and the header that labels them, so their columns match.
const GROUP_GRID =
  'grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 px-3 md:grid-cols-[4.5rem_minmax(0,1fr)_14rem_6rem_1.25rem] md:gap-x-4 lg:grid-cols-[5rem_minmax(0,1fr)_16rem_7rem_1.25rem]';

const toggle = cva(
  `${GROUP_GRID} w-full items-baseline py-3 text-left transition-colors ` +
    '[grid-template-areas:"code_aside_chev""title_title_title""desc_desc_desc""body_body_body""value_value_value"] ' +
    'md:[grid-template-areas:"code_title_value_aside_chev""code_desc_value_aside_chev""code_body_value_aside_chev"] ' +
    'hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      expanded: { true: 'bg-surface-2', false: '' },
    },
    defaultVariants: { expanded: false },
  }
);

// Text areas of the toggle: `min-w-0` lets a grid item shrink below its longest word, and
// `break-words` breaks a word that still doesn't fit (a long compound rate, a URL-like token).
const TEXT = 'min-w-0 break-words';

export interface RowGroupToggleProps {
  /** Monospace code, e.g. the HTS heading "0102". */
  code: string;
  title: React.ReactNode;
  /** Muted second line under the title, e.g. the heading's official wording. */
  description?: React.ReactNode;
  /** A short paragraph under the title and description, e.g. what the heading covers. */
  body?: React.ReactNode;
  /** The group's key figure, e.g. its rate summary ("Free · 1¢/kg"). */
  value?: React.ReactNode;
  /** Muted note under the value, e.g. "2 with a base-rate duty". */
  valueNote?: React.ReactNode;
  /** Muted note on the right, e.g. "35 lines" or "3 matches". */
  aside?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  /** Id of the element the toggle opens (`aria-controls`). */
  controls: string;
  className?: string;
}

/** The button that opens and closes a group. */
export function RowGroupToggle({
  code,
  title,
  description,
  body,
  value,
  valueNote,
  aside,
  expanded,
  onToggle,
  controls,
  className,
}: RowGroupToggleProps): React.JSX.Element {
  return (
    <button type="button" aria-expanded={expanded} aria-controls={controls} onClick={onToggle} className={cn(toggle({ expanded }), className)}>
      <span className="[grid-area:code] whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-primary">{code}</span>
      <span className={cn('[grid-area:title] mt-1 text-base font-semibold text-heading md:mt-0', TEXT)}>{title}</span>
      {description && <span className={cn('[grid-area:desc] mt-0.5 text-xs text-muted', TEXT)}>{description}</span>}
      {body && <span className={cn('[grid-area:body] mt-1.5 text-sm text-body', TEXT)}>{body}</span>}
      {(value || valueNote) && (
        <span className={cn('[grid-area:value] mt-1.5 flex flex-col gap-0.5 md:mt-0', TEXT)}>
          {value && <span className="text-sm text-body">{value}</span>}
          {valueNote && <span className="text-xs text-muted">{valueNote}</span>}
        </span>
      )}
      {aside && (
        <span className={cn('[grid-area:aside] justify-self-end text-right text-xs text-muted md:justify-self-start md:text-left md:text-sm', TEXT)}>
          {aside}
        </span>
      )}
      <ChevronDownIcon
        className={cn('[grid-area:chev] h-5 w-5 shrink-0 self-center text-muted transition-transform', expanded && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  );
}

export interface RowGroupListHeaderProps {
  /** Label over the codes, e.g. "Heading". */
  code: React.ReactNode;
  /** Label over the titles, descriptions and bodies, e.g. "Product group". Shown from `md`. */
  title: React.ReactNode;
  /** Label over the values, e.g. "Base rates". Shown from `md`. */
  value: React.ReactNode;
  /** Label over the asides, e.g. "Lines". */
  aside: React.ReactNode;
}

/**
 * Column labels for a list of row groups — pass it as the `StackedRowList` `header`. It uses the
 * toggle row's grid, so each label sits over its column; on phones, where the toggle stacks, it
 * keeps only the code and aside labels.
 */
export function RowGroupListHeader({ code, title, value, aside }: RowGroupListHeaderProps): React.JSX.Element {
  return (
    <div className={cn(GROUP_GRID, 'items-baseline rounded-t-lg border-b border-border bg-bg py-2.5 text-sm font-semibold text-muted')}>
      <span className="whitespace-nowrap">{code}</span>
      <span className="hidden md:block">{title}</span>
      <span className="hidden md:block">{value}</span>
      <span className="col-start-2 justify-self-end md:col-start-auto md:justify-self-start">{aside}</span>
    </div>
  );
}

type RowGroupShellProps = Omit<RowGroupToggleProps, 'controls'> & {
  /** Anchor id on the group, e.g. "0102" so `#0102` lands on it. */
  id: string;
  children: React.ReactNode;
};

function RowGroupShell({ id, children, ...toggleProps }: RowGroupShellProps): React.JSX.Element {
  const bodyId = `${id}-rows`;
  return (
    <li id={id} className="scroll-mt-28 border-t border-border first:border-t-0">
      <RowGroupToggle {...toggleProps} controls={bodyId} />
      {/* The sticky column header inside is bounded by this element, so it leaves with the group. */}
      <div id={bodyId} hidden={!toggleProps.expanded} className="border-t border-border">
        {children}
      </div>
    </li>
  );
}

export type TableRowGroupProps = RowGroupShellProps;

/** Desktop group: the toggle and the group's own `DataTable` (with its column header), hidden (not removed) while collapsed. */
export function TableRowGroup(props: TableRowGroupProps): React.JSX.Element {
  return <RowGroupShell {...props} />;
}

export type StackedRowGroupProps = RowGroupShellProps & {
  /** Column labels at the top of the group's rows, e.g. a `StackedRowListHeader placement="group"`. */
  header?: React.ReactNode;
};

/** Phone group: the toggle, an optional column header and the group's `StackedRow`s, hidden (not removed) while collapsed. */
export function StackedRowGroup({ header, children, ...props }: StackedRowGroupProps): React.JSX.Element {
  return (
    <RowGroupShell {...props}>
      {header}
      <ul>{children}</ul>
    </RowGroupShell>
  );
}
