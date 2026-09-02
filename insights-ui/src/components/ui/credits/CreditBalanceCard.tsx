import { cn } from '@/lib/utils';
import React from 'react';

export interface CreditBalanceCardProps {
  credits: number;
  /** Sub-line explaining what the balance buys. */
  detail: string;
  /** Buy-credits action rendered on the right (wraps below on mobile). */
  action?: React.ReactNode;
  className?: string;
}

/** Headline balance panel at the top of the credits page. */
export default function CreditBalanceCard({ credits, detail, action, className }: CreditBalanceCardProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <span className="block text-sm text-muted">Available credits</span>
        <span className="block text-4xl font-semibold text-heading">{credits}</span>
        <span className="block text-sm text-muted">{detail}</span>
      </div>
      {action}
    </div>
  );
}
