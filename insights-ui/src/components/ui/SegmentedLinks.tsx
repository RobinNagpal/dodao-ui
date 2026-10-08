import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Segmented control whose segments are links to real URLs (not client-side
 * tabs), so each side keeps its own page, title and search ranking. The
 * current segment is filled and carries `aria-current="page"`.
 */

const segment = cva('inline-flex items-center rounded-md px-4 py-1.5 text-sm transition-colors', {
  variants: {
    active: {
      true: 'badge-tone-accent bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/40',
      false: 'font-medium text-muted hover:bg-surface-3 hover:text-body',
    },
  },
  defaultVariants: { active: false },
});

export interface SegmentedLinkItem {
  key: string;
  href: string;
  label: string;
  active: boolean;
}

export interface SegmentedLinksProps {
  ariaLabel: string;
  items: SegmentedLinkItem[];
  className?: string;
}

export default function SegmentedLinks({ ariaLabel, items, className }: SegmentedLinksProps): React.JSX.Element {
  return (
    <nav aria-label={ariaLabel} className={cn('inline-flex gap-1 rounded-lg border border-border bg-surface-2 p-1', className)}>
      {items.map((item) => (
        <Link key={item.key} href={item.href} aria-current={item.active ? 'page' : undefined} className={segment({ active: item.active })}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
