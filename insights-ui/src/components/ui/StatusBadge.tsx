import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { badgeTone, type BadgeTone } from '@/components/ui/badges/badgeTone';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';

export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'accent' | 'neutral' | 'archived';
export type StatusBadgeSize = 'xs' | 'sm';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: React.ReactNode;
  size?: StatusBadgeSize;
  /** Shows a rotating icon before the label, for something still in progress. */
  spinning?: boolean;
  className?: string;
}

const statusBadge = cva('inline-flex items-center gap-1 text-xs', {
  variants: {
    size: {
      xs: 'px-2 py-1 rounded-full',
      sm: 'px-2 py-0.5 rounded',
    },
  },
  defaultVariants: { size: 'xs' },
});

const VARIANT_TONE: Record<StatusBadgeVariant, BadgeTone> = {
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  accent: 'accent',
  neutral: 'neutral',
  archived: 'neutral',
};

export default function StatusBadge({ variant, label, size = 'xs', spinning = false, className }: StatusBadgeProps): React.JSX.Element {
  return (
    <span className={cn(statusBadge({ size }), badgeTone({ tone: VARIANT_TONE[variant] }), className)}>
      {spinning && <ArrowPathIcon className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />}
      {label}
    </span>
  );
}
