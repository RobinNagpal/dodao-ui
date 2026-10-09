import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

/**
 * Clickable card with a monospace eyebrow, a title, a highlighted meta value
 * and supporting body text — used for the chapter's "headings" grid and
 * similar navigational card grids. `RelatedSectionsNav` renders flat pill
 * links; this is the richer card for when each link needs its own numbers.
 *
 * `href` may be an in-page anchor (`#0104`) or a route.
 */

export interface LinkTileProps {
  href: string;
  /** Monospace eyebrow, e.g. the HTS heading "0104". */
  eyebrow?: string;
  /** Muted note on the eyebrow row's right, e.g. "7 lines · 2 with a duty". */
  aside?: string;
  title: string;
  /** Emphasized line under the title, e.g. the heading's rate summary. */
  meta?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function LinkTile({ href, eyebrow, aside, title, meta, children, className }: LinkTileProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className={cn('flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50 sm:p-5', className)}
    >
      {(eyebrow || aside) && (
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          {eyebrow && <span className="font-mono font-semibold text-primary">{eyebrow}</span>}
          {aside && <span className="text-xs text-muted">{aside}</span>}
        </span>
      )}
      <span className="text-base font-semibold text-heading">{title}</span>
      {meta && <span className="text-sm font-semibold text-body">{meta}</span>}
      {children && <span className="text-sm text-muted">{children}</span>}
    </Link>
  );
}
