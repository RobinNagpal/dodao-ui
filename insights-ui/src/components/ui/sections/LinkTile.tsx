import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Clickable tile with a title, a highlighted meta value and supporting body
 * text — used for the "jump to a product group" grid and similar navigational
 * card grids. `RelatedSectionsNav` renders flat pill links; this is the richer
 * tile for when each link needs its own numbers.
 *
 * `href` may be an in-page anchor (`#0104`) or a route.
 */

const tile = cva('block rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-primary/50', {
  variants: {
    size: { sm: 'p-3', md: 'p-4' },
  },
  defaultVariants: { size: 'sm' },
});

export type LinkTileProps = VariantProps<typeof tile> & {
  href: string;
  /** Small monospace eyebrow, e.g. the HTS heading "0104". */
  eyebrow?: string;
  title: string;
  /** Right-aligned highlighted value, e.g. the group's rate summary. */
  meta?: string;
  children?: React.ReactNode;
  /** Muted footer line, e.g. "2 lines · 1 dutiable". */
  footer?: string;
  className?: string;
};

export default function LinkTile({ href, eyebrow, title, meta, children, footer, size, className }: LinkTileProps): React.JSX.Element {
  return (
    <Link href={href} className={cn(tile({ size }), className)}>
      <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <span className="flex items-baseline gap-2">
          {eyebrow && <span className="font-mono text-xs text-primary">{eyebrow}</span>}
          <span className="text-sm font-semibold text-body">{title}</span>
        </span>
        {meta && <span className="min-w-0 text-xs font-medium text-primary">{meta}</span>}
      </span>
      {children && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{children}</span>}
      {footer && <span className="mt-2 block text-xs text-muted">{footer}</span>}
    </Link>
  );
}
