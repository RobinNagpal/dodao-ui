import { cn } from '@/lib/utils';
import React from 'react';

interface PassFailBadgeProps {
  passed: boolean;
  size?: 'sm' | 'xs';
  passLabel?: React.ReactNode;
  failLabel?: React.ReactNode;
  className?: string;
}

export default function PassFailBadge({ passed, size = 'sm', passLabel = 'Pass', failLabel = 'Fail', className }: PassFailBadgeProps): JSX.Element {
  const sizeClass = size === 'xs' ? 'text-xs' : 'text-sm';
  const colorClass = passed ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200';
  return <span className={cn('px-2 py-1 rounded-full', sizeClass, colorClass, className)}>{passed ? passLabel : failLabel}</span>;
}
