import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Inline text link leaf (the `link-color hover:underline text-sm font-medium`
 * anchor repeated across report headers and tables). Use it so high-level
 * components never hand-write link styling.
 */
const textLink = cva('font-medium', {
  variants: {
    /** `button` renders the link as a filled call-to-action (full width on phones), for a link that leads to a whole other page. */
    look: {
      text: 'link-color hover:underline',
      button:
        'flex w-full items-center justify-center gap-2 sm:inline-flex sm:w-auto rounded-md bg-primary px-4 py-2 font-semibold text-primary-text shadow-sm transition-opacity hover:opacity-90',
    },
    size: { xs: 'text-xs', sm: 'text-sm', base: 'text-base' },
    /** Let long labels (source titles, agency names) wrap instead of overflowing narrow screens. */
    wrap: { false: 'whitespace-nowrap', true: 'whitespace-normal break-words' },
  },
  defaultVariants: { look: 'text', size: 'sm', wrap: false },
});

export type TextLinkProps = VariantProps<typeof textLink> & {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function TextLink({ href, children, look, size, wrap, className }: TextLinkProps): React.JSX.Element {
  return (
    <Link href={href} prefetch={false} className={cn(textLink({ look, size, wrap }), className)}>
      {children}
    </Link>
  );
}
