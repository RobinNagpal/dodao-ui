import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { badgeTone, type BadgeTone } from '@/components/ui/badges/badgeTone';
import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'neutral' | 'archived';
export type StatusBadgeSize = 'xs' | 'sm';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: React.ReactNode;
  size?: StatusBadgeSize;
  className?: string;
}

const statusBadge = cva('text-xs', {
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
  warning: 'warning',
  neutral: 'neutral',
  archived: 'neutral',
};

export default function StatusBadge({ variant, label, size = 'xs', className }: StatusBadgeProps): React.JSX.Element {
  return <span className={cn(statusBadge({ size }), badgeTone({ tone: VARIANT_TONE[variant] }), className)}>{label}</span>;
}
