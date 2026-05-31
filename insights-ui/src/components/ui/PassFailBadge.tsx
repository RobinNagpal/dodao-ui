import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
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
    tone: { pass: 'bg-green-900 text-green-200', fail: 'bg-red-900 text-red-200' },
  },
  defaultVariants: { size: 'sm' },
});

export default function PassFailBadge({ passed, size = 'sm', passLabel = 'Pass', failLabel = 'Fail', className }: PassFailBadgeProps): React.JSX.Element {
  return <span className={cn(passFailBadge({ size, tone: passed ? 'pass' : 'fail' }), className)}>{passed ? passLabel : failLabel}</span>;
}
