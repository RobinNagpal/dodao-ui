'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface DateFilterControlProps {
  id: string;
  label: string;
  /** Current value as `YYYY-MM-DD`, or '' when unset. */
  value: string;
  onChange: (value: string) => void;
  /** Optional bounds passed straight to the native date picker. */
  min?: string;
  max?: string;
}

/**
 * A single date bound in a filter modal: label + native calendar picker + a
 * clear button. Sized and toned to sit beside `NumericFilterControl` tiles.
 */
export default function DateFilterControl({ id, label, value, onChange, min, max }: DateFilterControlProps): JSX.Element {
  const isActive: boolean = value !== '';

  return (
    <div className={`rounded p-2 ${isActive ? 'bg-surface-2 ring-1 ring-amber-500' : 'bg-surface-2'}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="truncate text-xs text-muted" title={label}>
          {label}
        </label>
        {isActive && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={`Clear ${label}`}
            className="shrink-0 rounded p-0.5 text-muted hover:bg-surface-3 hover:text-heading"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border bg-surface-3 px-1.5 py-1 text-xs text-heading focus:border-transparent focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
