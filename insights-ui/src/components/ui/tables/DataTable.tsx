import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Table primitives for data/reference tables (the tariff rate table, HTS code
 * listings, …). The web-core `Table` takes a fixed `columns: ReactNode[]`
 * array per row, which can't express a hierarchical, expandable, per-cell
 * styled table — so these leaves own the table chrome instead, and callers
 * compose real `<thead>`/`<tbody>` markup with zero Tailwind.
 *
 * Indentation is a constrained `indent` variant rather than an inline
 * `paddingLeft` style so the depth scale stays in one place; HTSUS goes to
 * indent 6.
 */

const tableScroll = cva('overflow-x-auto rounded-lg border border-border', {
  variants: {
    maxHeight: { none: '', lg: 'max-h-[70vh] overflow-y-auto' },
  },
  defaultVariants: { maxHeight: 'none' },
});

export type TableScrollProps = VariantProps<typeof tableScroll> & {
  children: React.ReactNode;
  className?: string;
};

/** Horizontal (and optionally vertical) scroll container with the table border. */
export function TableScroll({ children, maxHeight, className }: TableScrollProps): React.JSX.Element {
  return <div className={cn(tableScroll({ maxHeight }), className)}>{children}</div>;
}

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <table className={cn('w-full text-sm', className)}>{children}</table>;
}

const tableHead = cva('bg-surface-2 text-xs uppercase tracking-wide text-muted', {
  variants: {
    sticky: { true: 'sticky top-0 z-10', false: '' },
  },
  defaultVariants: { sticky: false },
});

export type TableHeadProps = VariantProps<typeof tableHead> & {
  children: React.ReactNode;
  className?: string;
};

export function TableHead({ children, sticky, className }: TableHeadProps): React.JSX.Element {
  return <thead className={cn(tableHead({ sticky }), className)}>{children}</thead>;
}

const headerCell = cva('text-left font-semibold px-3 py-3', {
  variants: {
    width: { auto: 'whitespace-nowrap', wide: 'min-w-[280px]', narrow: 'whitespace-nowrap w-px' },
  },
  defaultVariants: { width: 'auto' },
});

export type TableHeaderCellProps = VariantProps<typeof headerCell> & {
  children: React.ReactNode;
  /** Column header tooltip, e.g. what "Column 2" means. */
  title?: string;
  className?: string;
};

export function TableHeaderCell({ children, width, title, className }: TableHeaderCellProps): React.JSX.Element {
  return (
    <th scope="col" title={title} className={cn(headerCell({ width }), className)}>
      {children}
    </th>
  );
}

const tableRow = cva('border-t border-border', {
  variants: {
    emphasis: {
      // A grouping / heading row: slightly raised surface, bolder text.
      header: 'bg-surface-2 font-medium text-body',
      normal: '',
    },
    interactive: { true: 'hover:bg-surface-2 cursor-pointer', false: '' },
  },
  defaultVariants: { emphasis: 'normal', interactive: false },
});

export type TableRowProps = VariantProps<typeof tableRow> & {
  children: React.ReactNode;
  id?: string;
  onClick?: () => void;
  className?: string;
};

export function TableRow({ children, emphasis, interactive, id, onClick, className }: TableRowProps): React.JSX.Element {
  return (
    <tr id={id} onClick={onClick} className={cn(tableRow({ emphasis, interactive }), className)}>
      {children}
    </tr>
  );
}

const tableCell = cva('px-3 py-2.5 align-top', {
  variants: {
    variant: {
      text: '',
      /** Codes and numbers: monospace + tabular figures. */
      code: 'font-mono tabular-nums text-xs whitespace-nowrap',
      /** Rates: keep "Free (A+,AU,…)" from exploding the column. */
      rate: 'text-xs whitespace-nowrap',
      /** Long preference lists that may wrap. */
      rateWrap: 'text-xs break-words max-w-[180px]',
    },
    tone: { body: 'text-body', muted: 'text-muted' },
    colSpanFull: { true: 'px-3 py-3', false: '' },
  },
  defaultVariants: { variant: 'text', tone: 'body', colSpanFull: false },
});

export type TableCellProps = VariantProps<typeof tableCell> & {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
};

export function TableCell({ children, variant, tone, colSpan, colSpanFull, className }: TableCellProps): React.JSX.Element {
  return (
    <td colSpan={colSpan} className={cn(tableCell({ variant, tone, colSpanFull }), className)}>
      {children}
    </td>
  );
}

// Literal class strings per depth — Tailwind's scanner can't see an
// interpolated `pl-${n}`, so the scale is spelled out.
const indentedLabel = cva('flex items-start gap-1', {
  variants: {
    indent: {
      0: 'pl-0',
      1: 'pl-0',
      2: 'pl-1',
      3: 'pl-5',
      4: 'pl-9',
      5: 'pl-12',
      6: 'pl-16',
    },
  },
  defaultVariants: { indent: 0 },
});

export type IndentedLabelProps = {
  /** HTSUS indent, 0..6. Values above 6 clamp to 6. */
  indent: number;
  children: React.ReactNode;
  className?: string;
};

/** Description cell content, indented to its place in the HTS hierarchy. */
export function IndentedLabel({ indent, children, className }: IndentedLabelProps): React.JSX.Element {
  const depth = Math.max(0, Math.min(indent, 6)) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return <span className={cn(indentedLabel({ indent: depth }), className)}>{children}</span>;
}

/** Em-dash placeholder for an empty cell. */
export function EmptyCellValue(): React.JSX.Element {
  return <span className="text-muted">—</span>;
}

/** A rate inherited from a parent heading rather than stated on this row. */
export function InheritedValue({ value, from }: { value: string; from: string }): React.JSX.Element {
  return (
    <span className="text-muted" title={`Inherited from ${from}`}>
      {value}
    </span>
  );
}

const matrixCell = cva('flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors', {
  variants: {
    selected: { true: 'bg-primary/15 ring-1 ring-primary/50', false: 'hover:bg-surface-2' },
    dim: { true: 'opacity-60', false: '' },
  },
  defaultVariants: { selected: false, dim: false },
});

export type MatrixCellButtonProps = VariantProps<typeof matrixCell> & {
  /** Main value (e.g. the total rate). */
  primary: React.ReactNode;
  /** Muted second line (e.g. trade value). */
  secondary?: React.ReactNode;
  onSelect: () => void;
  /** Accessible name, e.g. "Cattle from Canada". */
  label: string;
  className?: string;
};

/** Selectable cell in a matrix table — opens a detail view for that cell. */
export function MatrixCellButton({ primary, secondary, onSelect, label, selected, dim, className }: MatrixCellButtonProps): React.JSX.Element {
  return (
    <button type="button" aria-pressed={Boolean(selected)} aria-label={label} onClick={onSelect} className={cn(matrixCell({ selected, dim }), className)}>
      <span className="text-xs font-semibold text-body">{primary}</span>
      {secondary && <span className="text-xs text-muted">{secondary}</span>}
    </button>
  );
}
