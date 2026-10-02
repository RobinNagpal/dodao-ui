import { cn } from '@/lib/utils';
import React from 'react';

export interface ReportResultToastItemProps {
  /** Status badge, on its own line above the message. */
  badge: React.ReactNode;
  /** "AAPL (NASDAQ) report is ready." */
  children: React.ReactNode;
  className?: string;
}

/** One finished report inside `ReportResultToast`. */
export default function ReportResultToastItem({ badge, children, className }: ReportResultToastItemProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-start gap-1.5 py-3 first:pt-0 last:pb-0', className)}>
      {badge}
      <p className="text-sm leading-snug text-body">{children}</p>
    </div>
  );
}
