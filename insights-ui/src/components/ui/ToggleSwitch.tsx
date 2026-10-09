'use client';

import { cn } from '@/lib/utils';
import React from 'react';

/**
 * On/off switch with its label inside one bordered button (track + knob, then
 * the label) — for a single setting that changes a whole table, e.g. "USMCA
 * claimed". `ToggleChip` is the lighter pill for narrowing a list.
 *
 * The track and knob are sized and colored inline so the switch never depends
 * on a utility class being generated.
 */

const TRACK: React.CSSProperties = { position: 'relative', display: 'inline-block', width: 36, height: 20, borderRadius: 999, flexShrink: 0 };
const KNOB: React.CSSProperties = { position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 999, background: '#ffffff', transition: 'left 150ms' };

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ToggleSwitch({ label, checked, onToggle, className }: ToggleSwitchProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={cn('inline-flex items-center gap-2 rounded-lg border border-primary bg-bg px-3 py-2.5 text-sm text-heading hover:bg-surface-2', className)}
    >
      <span style={{ ...TRACK, background: checked ? 'var(--primary-color)' : 'var(--surface-3)' }}>
        <span style={{ ...KNOB, left: checked ? 18 : 2 }} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
