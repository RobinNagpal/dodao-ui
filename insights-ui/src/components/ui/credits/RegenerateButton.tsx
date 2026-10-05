import { cn } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const regenerateButton = cva(
  'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-text shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      /**
       * `mobileOnly` hides it from `md` up, where `FloatingReportCta` offers the
       * same action — the two would otherwise sit on screen at once.
       */
      visibility: { always: '', mobileOnly: 'md:hidden' },
    },
    defaultVariants: { visibility: 'always' },
  }
);

export type RegenerateButtonProps = VariantProps<typeof regenerateButton> & {
  onClick: () => void;
  loading?: boolean;
  className?: string;
};

/**
 * "Regenerate" action on a report. Same filled primary style as the "View
 * Detailed Analysis" buttons, one size up so it stands out on the date line.
 */
export default function RegenerateButton({ onClick, loading, visibility, className }: RegenerateButtonProps): React.JSX.Element {
  return (
    <button type="button" onClick={onClick} disabled={loading} className={cn(regenerateButton({ visibility }), className)}>
      <ArrowPathIcon className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" />
      {loading ? 'Starting…' : 'Regenerate'}
    </button>
  );
}
