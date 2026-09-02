'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chip = cva('inline-flex items-center rounded-full', {
  variants: {
    tone: {
      // The applied-filters bar: the loud amber pill.
      accent: 'text-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500',
      // Inside a control (e.g. the selected values of a multi-select tile).
      neutral: 'badge-tone-neutral bg-gray-500/15 text-gray-300 border border-gray-500/40',
    },
    size: {
      md: 'gap-2 px-3 py-1.5 text-sm',
      sm: 'gap-1 px-2 py-0.5 text-xs',
    },
  },
  defaultVariants: { tone: 'accent', size: 'md' },
});

const removeIcon = cva('', {
  variants: {
    size: { md: 'h-4 w-4', sm: 'h-3 w-3' },
  },
  defaultVariants: { size: 'md' },
});

type AppliedFilterChipProps = VariantProps<typeof chip> & {
  label: string;
  onRemove: () => void;
  className?: string;
};

export default function AppliedFilterChip({ label, onRemove, tone, size, className = '' }: AppliedFilterChipProps): JSX.Element {
  return (
    <div className={cn(chip({ tone, size }), className)}>
      <span>{label}</span>
      <button onClick={onRemove} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5" aria-label={`Remove ${label}`} type="button">
        <XMarkIcon className={removeIcon({ size })} />
      </button>
    </div>
  );
}
