import { cn } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ReportFreshnessBarProps {
  /** Formatted date the report was last generated, or null when never generated. */
  generatedAt: string | null;
  /** The regenerate control. Rendered inline on desktop, wrapping on mobile. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The single "Report generated on …" line shown above a report, with the
 * regenerate action sitting next to the date it refers to. Quiet by design —
 * it is provenance, not a call to action, so it must not compete with the
 * report heading directly above it.
 */
export default function ReportFreshnessBar({ generatedAt, action, className }: ReportFreshnessBarProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted mb-4', className)}>
      <ClockIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{generatedAt ? `Report generated on ${generatedAt}` : 'This report has not been generated yet'}</span>
      {action}
    </div>
  );
}
