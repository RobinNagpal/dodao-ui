import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Renders its children only on one side of a breakpoint, for a component that needs a different
 * layout on phones (e.g. a wide matrix that becomes a list). Both layouts stay in the HTML; the
 * hidden one is `display: none`.
 */
const showAt = cva('', {
  variants: {
    range: { 'lg-up': 'hidden lg:block', 'below-lg': 'lg:hidden' },
  },
});

export type ShowAtProps = Required<VariantProps<typeof showAt>> & {
  children: React.ReactNode;
  className?: string;
};

export default function ShowAt({ range, children, className }: ShowAtProps): React.JSX.Element {
  return <div className={cn(showAt({ range }), className)}>{children}</div>;
}
