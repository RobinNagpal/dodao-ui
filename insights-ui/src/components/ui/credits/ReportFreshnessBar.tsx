import { cn } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ReportFreshnessBarProps {
  /** Formatted date the report was last generated, or null when never generated. */
  generatedAt: string | null;
  /** The regenerate button, pinned to the right end of the line. */
  action?: React.ReactNode;
  /** Optional status after the date, e.g. the viewer's own regeneration badge. */
  note?: React.ReactNode;
  className?: string;
}

/**
 * The single "Report generated on …" line shown above a report: the date and
 * the viewer's own regeneration status on the left, the regenerate button on
 * the right. On narrow screens the button wraps under the text.
 */
export default function ReportFreshnessBar({ generatedAt, action, note, className }: ReportFreshnessBarProps): React.JSX.Element {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted', className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ClockIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{generatedAt ? `Report generated on ${generatedAt}` : 'This report has not been generated yet'}</span>
        {note && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex flex-wrap items-center gap-x-2">{note}</span>
          </>
        )}
      </div>
      {action}
    </div>
  );
}
