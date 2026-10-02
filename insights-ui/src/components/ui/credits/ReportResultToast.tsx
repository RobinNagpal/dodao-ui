import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/20/solid';
import React from 'react';

export interface ReportResultToastProps {
  /** One `ReportResultToastItem` per finished report. */
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

/**
 * Top-right notice (just under the navbar) for finished paid reports. Unlike
 * the 3-second global toast it stays until closed, since it often appears
 * right as the user returns. Results are separated by dividers.
 */
export default function ReportResultToast({ children, onClose, className }: ReportResultToastProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('fixed top-20 right-4 left-4 z-50 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg sm:left-auto sm:w-96', className)}
    >
      <button type="button" onClick={onClose} className="absolute top-3 right-3 rounded-md text-muted hover:text-heading" aria-label="Close">
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="divide-y divide-border pr-6">{children}</div>
    </div>
  );
}
