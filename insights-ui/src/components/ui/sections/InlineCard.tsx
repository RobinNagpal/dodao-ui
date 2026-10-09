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
      inset: 'bg-surface-2 rounded-md [--scroll-cover:var(--surface-2)]',
      card: 'bg-surface border border-border rounded-xl [--scroll-cover:var(--surface)]',
      // A darker well inside a CardSection (one step back toward the page background).
      sunken: 'bg-bg border border-border rounded-lg [--scroll-cover:var(--bg-color)]',
      // A raised, outlined panel — the detail view for a selected item.
      highlight: 'bg-surface-2 border border-surface-3 rounded-xl [--scroll-cover:var(--surface-2)]',
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
  /** Anchor id, e.g. for an in-page "jump to" link. Ignored when `href` is set. */
  id?: string;
  className?: string;
};

export default function InlineCard({ children, padding, surface, as = 'div', href, fill = false, id, className }: InlineCardProps): React.JSX.Element {
  if (href) {
    return (
      <Link href={href} prefetch={false} className={cn(inlineCard({ padding, surface }), 'block hover:bg-surface-3 transition-colors', className)}>
        {children}
      </Link>
    );
  }
  const Tag = as;
  return (
    <Tag id={id} className={cn(inlineCard({ padding, surface }), fill && 'h-full', 'scroll-mt-6', className)}>
      {children}
    </Tag>
  );
}
