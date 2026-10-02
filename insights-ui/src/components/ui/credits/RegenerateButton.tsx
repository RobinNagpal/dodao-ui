import { cn } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface RegenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * "Regenerate" action on a report. Same filled primary style as the "View
 * Detailed Analysis" buttons, one size up so it stands out on the date line.
 */
export default function RegenerateButton({ onClick, loading, className }: RegenerateButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-text shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <ArrowPathIcon className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" />
      {loading ? 'Starting…' : 'Regenerate'}
    </button>
  );
}
