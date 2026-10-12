import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * A button that looks like `TextLink`, for a small in-page action that isn't navigation
 * (e.g. "Expand all" / "Collapse all" above a grouped table).
 */
const textButton = cva(
  'link-color font-medium hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      size: { xs: 'text-xs', sm: 'text-sm', base: 'text-base' },
    },
    defaultVariants: { size: 'sm' },
  }
);

export type TextButtonProps = VariantProps<typeof textButton> & {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export default function TextButton({ children, onClick, disabled, size, className }: TextButtonProps): React.JSX.Element {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(textButton({ size }), className)}>
      {children}
    </button>
  );
}
