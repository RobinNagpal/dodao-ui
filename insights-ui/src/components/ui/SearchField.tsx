'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Search box for filtering a listing in place: magnifier, clear button and an
 * optional result count. Wraps the chrome so feature code passes only
 * `value` / `onChange` / copy.
 */

const field = cva(
  'relative flex items-center rounded-md border border-border transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40',
  {
    variants: {
      size: { lg: 'h-12 rounded-lg bg-bg', md: 'h-10 bg-surface-2', sm: 'h-9 bg-surface-2' },
    },
    defaultVariants: { size: 'md' },
  }
);

export type SearchFieldProps = VariantProps<typeof field> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible label; also the `aria-label` on the input. */
  label: string;
  /** Right-aligned count, e.g. "12 of 126 lines". */
  resultLabel?: string;
  className?: string;
};

export default function SearchField({ value, onChange, placeholder, label, resultLabel, size, className }: SearchFieldProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3', className)}>
      <div className={cn(field({ size }), 'flex-1')}>
        <MagnifyingGlassIcon className="ml-3 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-full w-full appearance-none border-0 bg-transparent px-2 text-body',
            size === 'lg' ? 'text-base' : 'text-sm',
            'shadow-none outline-none ring-0 placeholder:text-muted focus:border-0 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none'
          )}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="mr-2 rounded-full p-1 text-muted hover:bg-surface hover:text-body"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {resultLabel && (
        <span className="text-xs text-muted whitespace-nowrap" aria-live="polite">
          {resultLabel}
        </span>
      )}
    </div>
  );
}
