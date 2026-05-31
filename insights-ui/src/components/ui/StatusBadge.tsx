import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'neutral' | 'archived';
export type StatusBadgeSize = 'xs' | 'sm';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: React.ReactNode;
  size?: StatusBadgeSize;
  className?: string;
}

const variantClass: Record<StatusBadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  archived: 'text-gray-400 bg-gray-800 border border-gray-700',
};

const sizeClass: Record<StatusBadgeSize, string> = {
  xs: 'px-2 py-1 rounded-full',
  sm: 'px-2 py-0.5 rounded',
};

export default function StatusBadge({ variant, label, size = 'xs', className = '' }: StatusBadgeProps): JSX.Element {
  return <span className={`${sizeClass[size]} text-xs ${variantClass[variant]}${className ? ` ${className}` : ''}`}>{label}</span>;
}
