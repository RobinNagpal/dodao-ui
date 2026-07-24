import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Inline text link leaf (the `link-color hover:underline text-sm font-medium`
 * anchor repeated across report headers and tables). Use it so high-level
 * components never hand-write link styling.
 */
const textLink = cva('link-color hover:underline font-medium whitespace-nowrap', {
  variants: {
    size: { xs: 'text-xs', sm: 'text-sm', base: 'text-base' },
  },
  defaultVariants: { size: 'sm' },
});

export type TextLinkProps = VariantProps<typeof textLink> & {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function TextLink({ href, children, size, className }: TextLinkProps): React.JSX.Element {
  return (
    <Link href={href} prefetch={false} className={cn(textLink({ size }), className)}>
      {children}
    </Link>
  );
}
