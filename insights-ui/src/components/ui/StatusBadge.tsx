import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
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
    variant: {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      archived: 'text-gray-400 bg-gray-800 border border-gray-700',
    },
    size: {
      xs: 'px-2 py-1 rounded-full',
      sm: 'px-2 py-0.5 rounded',
    },
  },
  defaultVariants: { size: 'xs' },
});

export default function StatusBadge({ variant, label, size = 'xs', className }: StatusBadgeProps): React.JSX.Element {
  return <span className={cn(statusBadge({ variant, size }), className)}>{label}</span>;
}
