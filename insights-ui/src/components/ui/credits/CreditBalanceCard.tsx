import { cn } from '@/lib/utils';
import React from 'react';

export interface CreditBalanceCardProps {
  credits: number;
  /** Credits held by reports still being generated. Hidden when zero. */
  reserved?: number;
  /** Who the balance belongs to — "User balance" when an admin is reading it. */
  label?: string;
  className?: string;
}

function creditsLabel(count: number): string {
  return count === 1 ? 'credit' : 'credits';
}

/** Compact, accented balance tile shown beside the credits page title. */
export default function CreditBalanceCard({ credits, reserved = 0, label = 'Your balance', className }: CreditBalanceCardProps): React.JSX.Element {
  return (
    <div className={cn('rounded-xl border-2 border-primary bg-surface px-4 py-2.5', className)}>
      <span className="block whitespace-nowrap text-sm">
        <span className="font-medium uppercase tracking-wide text-muted">{label}:</span>{' '}
        <span className="text-lg font-semibold text-heading">
          {credits} {creditsLabel(credits)}
        </span>
      </span>
      {reserved > 0 && (
        <span className="mt-0.5 block text-xs text-muted">
          +{reserved} {creditsLabel(reserved)} in use for reports being made
        </span>
      )}
    </div>
  );
}
