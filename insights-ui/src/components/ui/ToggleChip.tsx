'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * On/off filter chip — the pressed sibling of `AppliedFilterChip` (which is a
 * removable chip for filters already applied). Used for the quick narrowing
 * toggles above a data table ("Only lines with a duty", …).
 */

const chip = cva('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', {
  variants: {
    active: {
      true: 'badge-tone-accent border-primary/40 bg-primary/15 text-primary',
      false: 'badge-tone-neutral border-border bg-surface-2 text-muted hover:text-body',
    },
  },
  defaultVariants: { active: false },
});

export type ToggleChipProps = VariantProps<typeof chip> & {
  label: string;
  active: boolean;
  onToggle: () => void;
  /** Optional trailing count, e.g. the number of matching rows. */
  count?: number;
  className?: string;
};

export default function ToggleChip({ label, active, onToggle, count, className }: ToggleChipProps): React.JSX.Element {
  return (
    <button type="button" aria-pressed={active} onClick={onToggle} className={cn(chip({ active }), className)}>
      <span>{label}</span>
      {count !== undefined && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
  );
}
