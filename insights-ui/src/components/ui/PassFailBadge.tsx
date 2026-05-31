import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { badgeTone } from '@/components/ui/badges/badgeTone';
import React from 'react';

interface PassFailBadgeProps {
  passed: boolean;
  size?: 'sm' | 'xs';
  passLabel?: React.ReactNode;
  failLabel?: React.ReactNode;
  className?: string;
}

const passFailBadge = cva('px-2 py-1 rounded-full', {
  variants: {
    size: { sm: 'text-sm', xs: 'text-xs' },
  },
  defaultVariants: { size: 'sm' },
});

export default function PassFailBadge({ passed, size = 'sm', passLabel = 'Pass', failLabel = 'Fail', className }: PassFailBadgeProps): React.JSX.Element {
  return <span className={cn(passFailBadge({ size }), badgeTone({ tone: passed ? 'success' : 'danger' }), className)}>{passed ? passLabel : failLabel}</span>;
}
