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
    // `pageSticky`: on desktop the table scrolls with the page (no box of its own), so a `sticky`
    // header pins to the top of the window instead of a nested scroll area. Phones keep the sideways scroll.
    pageSticky: { true: 'lg:overflow-x-visible', false: '' },
  },
  defaultVariants: { maxHeight: 'none', pageSticky: false },
});

// Edge shadows that appear only while there is more table to scroll to (the "local" covers scroll
// with the content and hide the "scroll" shadows at each end). The cover matches whatever surface the
// table sits on — `--scroll-cover`, set by the card leaves — so it is invisible until it is needed.
const SCROLL_HINT: React.CSSProperties = {
  background: [
    'linear-gradient(to right, var(--scroll-cover, var(--bg-color)) 30%, transparent) left center / 40px 100% no-repeat local',
    'linear-gradient(to left, var(--scroll-cover, var(--bg-color)) 30%, transparent) right center / 40px 100% no-repeat local',
    'radial-gradient(farthest-side at 0 50%, var(--surface-3), transparent) left center / 14px 100% no-repeat scroll',
    'radial-gradient(farthest-side at 100% 50%, var(--surface-3), transparent) right center / 14px 100% no-repeat scroll',
  ].join(', '),
};

export type TableScrollProps = VariantProps<typeof tableScroll> & {
  children: React.ReactNode;
  className?: string;
};

/** Horizontal (and optionally vertical) scroll container with the table border and edge scroll shadows. */
export function TableScroll({ children, maxHeight, pageSticky, className }: TableScrollProps): React.JSX.Element {
  return (
    <div className={cn(tableScroll({ maxHeight, pageSticky }), className)} style={SCROLL_HINT}>
      {children}
    </div>
  );
}

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <table className={cn('w-full text-sm', className)}>{children}</table>;
}

const tableHead = cva('text-muted', {
  variants: {
    sticky: { true: 'sticky top-0 z-10', false: '' },
    // `caps`: small uppercase labels on a raised row. `plain`: sentence-case labels on the page background.
    look: { caps: 'bg-surface-2 text-xs uppercase tracking-wide', plain: 'bg-bg text-sm' },
  },
  defaultVariants: { sticky: false, look: 'caps' },
});

export type TableHeadProps = VariantProps<typeof tableHead> & {
  children: React.ReactNode;
  className?: string;
};

export function TableHead({ children, sticky, look, className }: TableHeadProps): React.JSX.Element {
  return <thead className={cn(tableHead({ sticky, look }), className)}>{children}</thead>;
}

const headerCell = cva('font-semibold px-3 py-3', {
  variants: {
    width: { auto: 'whitespace-nowrap', wide: 'min-w-[280px]', narrow: 'whitespace-nowrap w-px', quarter: 'w-1/4 min-w-48' },
    align: { left: 'text-left', right: 'text-right' },
    // Keeps a row-label column in view while a wide table scrolls sideways (pair with TableCell `pinned`).
    pinned: { true: 'sticky left-0 z-10 bg-bg', false: '' },
  },
  defaultVariants: { width: 'auto', align: 'left', pinned: false },
});

export type TableHeaderCellProps = VariantProps<typeof headerCell> & {
  children: React.ReactNode;
  /** Column header tooltip, e.g. what "Column 2" means. */
  title?: string;
  className?: string;
};

export function TableHeaderCell({ children, width, align, pinned, title, className }: TableHeaderCellProps): React.JSX.Element {
  return (
    <th scope="col" title={title} className={cn(headerCell({ width, align, pinned }), className)}>
      {children}
    </th>
  );
}

const tableRow = cva('border-t border-border', {
  variants: {
    emphasis: {
      // A grouping / heading row: slightly raised surface, bolder text.
      header: 'bg-surface-2 font-medium text-body',
      // A grouping row that stays dark: a slight step toward the page background instead of a light band.
      group: 'bg-bg/50 font-medium text-body',
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
      /** Small explanatory text that wraps freely, e.g. a rate breakdown note. */
      note: 'min-w-48 text-xs',
    },
    tone: {
      body: 'text-body',
      muted: 'text-muted',
      primary: 'text-primary',
      emphasis: 'font-semibold text-heading',
      warning: 'font-semibold text-tariff-accent',
    },
    colSpanFull: { true: 'px-3 py-3', false: '' },
    align: { left: '', right: 'text-right' },
    // Sticky row label for a table that scrolls sideways; the surface fill hides the cells scrolling under it.
    pinned: { true: 'sticky left-0 z-10 bg-surface', false: '' },
  },
  defaultVariants: { variant: 'text', tone: 'body', colSpanFull: false, align: 'left', pinned: false },
});

export type TableCellProps = VariantProps<typeof tableCell> & {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
};

export function TableCell({ children, variant, tone, colSpan, colSpanFull, align, pinned, className }: TableCellProps): React.JSX.Element {
  return (
    <td colSpan={colSpan} className={cn(tableCell({ variant, tone, colSpanFull, align, pinned }), className)}>
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

// Plain cells (no box per cell), so a large matrix reads as a table rather than a wall of buttons.
// The phone min-width keeps a scrolled matrix readable instead of squeezing each rate onto several lines.
const matrixCell = cva(
  'flex min-h-11 w-full min-w-32 flex-col items-start justify-center gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors lg:min-w-0',
  {
    variants: {
      selected: { true: 'bg-primary/20 ring-1 ring-inset ring-primary', false: 'hover:bg-surface-2' },
      dim: { true: 'opacity-60', false: '' },
    },
    defaultVariants: { selected: false, dim: false },
  }
);

// How loud the cell's main value is: `quiet` for the default (e.g. "Free"),
// `high` (amber) for the values a reader should spot (e.g. a large extra duty).
const matrixValue = cva('text-xs', {
  variants: {
    emphasis: { quiet: 'text-muted', normal: 'font-semibold text-heading', high: 'font-semibold text-tariff-accent' },
  },
  defaultVariants: { emphasis: 'normal' },
});

export type MatrixCellButtonProps = VariantProps<typeof matrixCell> &
  VariantProps<typeof matrixValue> & {
    /** Optional name above the value, for the phone list where the row label isn't beside the cell. */
    name?: React.ReactNode;
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
export function MatrixCellButton({ name, primary, secondary, onSelect, label, selected, dim, emphasis, className }: MatrixCellButtonProps): React.JSX.Element {
  return (
    <button type="button" aria-pressed={Boolean(selected)} aria-label={label} onClick={onSelect} className={cn(matrixCell({ selected, dim }), className)}>
      {name && <span className="text-sm font-semibold text-heading">{name}</span>}
      <span className={matrixValue({ emphasis })}>{primary}</span>
      {secondary && <span className="text-xs text-muted">{secondary}</span>}
    </button>
  );
}

/** Read-only matrix cell with the same box and value styles as MatrixCellButton, for a matrix without a detail view. */
export function MatrixCell({
  primary,
  secondary,
  dim,
  emphasis,
  title,
  className,
}: Omit<MatrixCellButtonProps, 'onSelect' | 'label' | 'selected'> & { title?: string }): React.JSX.Element {
  return (
    <div title={title} className={cn(matrixCell({ dim }), 'hover:bg-transparent', className)}>
      <span className={matrixValue({ emphasis })}>{primary}</span>
      {secondary && <span className="text-xs text-muted">{secondary}</span>}
    </div>
  );
}
