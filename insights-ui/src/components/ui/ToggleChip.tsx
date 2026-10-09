'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * On/off filter chip — the pressed sibling of `AppliedFilterChip` (which is a
 * removable chip for filters already applied). Used for the quick narrowing
 * toggles above a data table ("Only lines with a duty", …).
 */

const chip = cva('inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors', {
  variants: {
    size: { sm: 'px-3 py-1.5 text-xs', md: 'min-h-11 px-3.5 text-sm' },
    // `filled`: chip on a raised track. `outline`: dark chip with a visible border, for use on a card surface.
    look: { filled: '', outline: '' },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    // Pressed chips use brand purple: purple marks links, HTS codes and whatever is currently selected.
    { look: 'filled', active: true, className: 'badge-tone-accent border-primary/40 bg-primary/15 text-primary' },
    { look: 'filled', active: false, className: 'badge-tone-neutral border-border bg-surface-2 text-muted hover:text-body' },
    { look: 'outline', active: true, className: 'badge-tone-accent border-primary bg-primary/20 text-heading' },
    { look: 'outline', active: false, className: 'border-surface-3 bg-bg text-body hover:border-primary/60' },
  ],
  defaultVariants: { size: 'sm', look: 'filled', active: false },
});

export type ToggleChipProps = VariantProps<typeof chip> & {
  label: string;
  active: boolean;
  onToggle: () => void;
  /** Optional trailing count, e.g. the number of matching rows. */
  count?: number;
  className?: string;
};

export default function ToggleChip({ label, active, onToggle, count, size, look, className }: ToggleChipProps): React.JSX.Element {
  return (
    <button type="button" aria-pressed={active} onClick={onToggle} className={cn(chip({ size, look, active }), className)}>
      <span>{label}</span>
      {count !== undefined && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
  );
}
