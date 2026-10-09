import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Minimal filled info box (`bg-surface rounded-md`) for small grouped content
 * such as a label + explanation. A lighter-weight surface than `CardSection`.
 */
const inlineCard = cva('', {
  variants: {
    padding: { snug: 'px-3 py-2', cozy: 'px-3 py-3', roomy: 'p-4', spacious: 'p-5', factor: 'px-2 py-4 sm:p-4' },
    // `inset` sits inside a CardSection; `card` stands alone on the page background.
    surface: {
      inset: 'bg-surface-2 rounded-md',
      card: 'bg-surface border border-border rounded-xl',
      // A darker well inside a CardSection (one step back toward the page background).
      sunken: 'bg-bg border border-border rounded-lg',
      // A sunken well outlined in the brand color — the detail panel for a selected item.
      highlight: 'bg-bg border border-primary rounded-xl',
    },
  },
  defaultVariants: { padding: 'snug', surface: 'inset' },
});

type InlineCardElement = 'div' | 'li';

export type InlineCardProps = VariantProps<typeof inlineCard> & {
  children: React.ReactNode;
  /** Element to render (e.g. `li` inside a list). Defaults to `div`. Ignored when `href` is set. */
  as?: InlineCardElement;
  /** When set, the whole card becomes a Next.js link with a hover affordance. */
  href?: string;
  /** Stretch to the parent's full height, so cards in a grid row line up. */
  fill?: boolean;
  className?: string;
};

export default function InlineCard({ children, padding, surface, as = 'div', href, fill = false, className }: InlineCardProps): React.JSX.Element {
  if (href) {
    return (
      <Link href={href} prefetch={false} className={cn(inlineCard({ padding, surface }), 'block hover:bg-surface-3 transition-colors', className)}>
        {children}
      </Link>
    );
  }
  const Tag = as;
  return <Tag className={cn(inlineCard({ padding, surface }), fill && 'h-full', className)}>{children}</Tag>;
}
