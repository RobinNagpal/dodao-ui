import { cva, type VariantProps } from 'class-variance-authority';
import ActiveTabScroller from '@/components/ui/ActiveTabScroller';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Segmented control whose segments are links to real URLs (not client-side
 * tabs), so each side keeps its own page, title and search ranking. The
 * current segment is filled and carries `aria-current="page"`.
 *
 * `variant="tabs"` renders the same links as an underlined tab row (the
 * current tab gets a primary underline) for page-level section navigation.
 * The row stays on one line and scrolls sideways when it is wider than the
 * screen, instead of wrapping into several rows.
 */

const container = cva('', {
  variants: {
    variant: {
      segmented: 'inline-flex gap-1 rounded-lg border border-border bg-surface-2 p-1',
      tabs: 'flex min-w-max gap-1 border-b border-border',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

const segment = cva('inline-flex items-center text-sm transition-colors', {
  variants: {
    variant: {
      segmented: 'rounded-md px-4 py-1.5',
      tabs: '-mb-px min-h-11 whitespace-nowrap rounded-t-md border-b-2 px-3.5',
    },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    // Brand purple marks where you are (the current page / side), like links and HTS codes.
    { variant: 'segmented', active: true, className: 'badge-tone-accent bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/40' },
    { variant: 'segmented', active: false, className: 'font-medium text-muted hover:bg-surface-3 hover:text-body' },
    { variant: 'tabs', active: true, className: 'border-primary bg-surface-2 font-semibold text-heading' },
    { variant: 'tabs', active: false, className: 'border-transparent font-medium text-muted hover:bg-surface-2 hover:text-body' },
  ],
  defaultVariants: { variant: 'segmented', active: false },
});

export interface SegmentedLinkItem {
  key: string;
  href: string;
  label: string;
  active: boolean;
}

export interface SegmentedLinksProps extends VariantProps<typeof container> {
  ariaLabel: string;
  items: SegmentedLinkItem[];
  className?: string;
}

export default function SegmentedLinks({ ariaLabel, items, variant, className }: SegmentedLinksProps): React.JSX.Element {
  const links = items.map((item) => (
    <Link key={item.key} href={item.href} aria-current={item.active ? 'page' : undefined} className={segment({ variant, active: item.active })}>
      {item.label}
    </Link>
  ));

  // Tabs scroll in an outer box; the underline lives on the inner row so the
  // active tab's border can overlap it without being clipped by the scroll box.
  if (variant === 'tabs') {
    return (
      <nav aria-label={ariaLabel} className={className}>
        <ActiveTabScroller>
          <div className={container({ variant })}>{links}</div>
        </ActiveTabScroller>
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={cn(container({ variant }), className)}>
      {links}
    </nav>
  );
}
