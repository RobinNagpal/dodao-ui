import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const packOption = cva('relative w-full rounded-lg border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed', {
  variants: {
    layout: {
      /** Tile form used on the credits page, where there is room for a grid. */
      tile: 'px-4 py-3',
      /** Compact row form used inside the narrow regenerate modal. */
      row: 'flex items-center justify-between gap-3 px-4 py-2.5',
    },
    selected: {
      true: 'border-primary bg-surface-2',
      false: 'border-border bg-surface hover:bg-surface-2',
    },
  },
  defaultVariants: { layout: 'tile', selected: false },
});

export type CreditPackOptionProps = VariantProps<typeof packOption> & {
  credits: number;
  /** Formatted price, e.g. "$10.00". */
  price: string;
  /** Per-credit line, e.g. "10 reports · $1.00 each". */
  detail: string;
  selected: boolean;
  recommended?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  className?: string;
};

/**
 * One pack in the buy-credits picker. A real `<button>` with `aria-pressed`
 * rather than a styled div, so it is keyboard-reachable and announces whether
 * it is the selected pack.
 */
export default function CreditPackOption({
  credits,
  price,
  detail,
  selected,
  recommended,
  disabled,
  layout,
  onSelect,
  className,
}: CreditPackOptionProps): React.JSX.Element {
  const badge = recommended ? (
    <span className="badge-tone-info rounded-full border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-300">Popular</span>
  ) : null;

  if (layout === 'row') {
    return (
      <button type="button" onClick={onSelect} disabled={disabled} aria-pressed={selected} className={cn(packOption({ layout, selected }), className)}>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-heading">
            {credits} credits — {price}
          </span>
          <span className="text-xs text-muted">{detail}</span>
        </span>
        {badge}
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} disabled={disabled} aria-pressed={selected} className={cn(packOption({ layout, selected }), className)}>
      {recommended && <span className="absolute -top-2 right-3">{badge}</span>}
      <span className="block text-lg font-semibold text-heading">{price}</span>
      <span className="block text-sm text-body">{credits} credits</span>
      <span className="block text-xs text-muted">{detail}</span>
    </button>
  );
}
