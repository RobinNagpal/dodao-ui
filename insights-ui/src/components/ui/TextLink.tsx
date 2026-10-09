import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Inline text link leaf (the `link-color hover:underline text-sm font-medium`
 * anchor repeated across report headers and tables). Use it so high-level
 * components never hand-write link styling.
 */
const textLink = cva('link-color hover:underline font-medium', {
  variants: {
    size: { xs: 'text-xs', sm: 'text-sm', base: 'text-base' },
    /** Let long labels (source titles, agency names) wrap instead of overflowing narrow screens. */
    wrap: { false: 'whitespace-nowrap', true: 'whitespace-normal break-words' },
  },
  defaultVariants: { size: 'sm', wrap: false },
});

export type TextLinkProps = VariantProps<typeof textLink> & {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function TextLink({ href, children, size, wrap, className }: TextLinkProps): React.JSX.Element {
  return (
    <Link href={href} prefetch={false} className={cn(textLink({ size, wrap }), className)}>
      {children}
    </Link>
  );
}
