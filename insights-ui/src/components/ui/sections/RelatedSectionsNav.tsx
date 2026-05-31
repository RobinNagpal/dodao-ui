import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export interface RelatedSectionsNavItem {
  /** Destination URL for the section link. */
  href: string;
  /** Visible link content (the caller supplies any trailing arrow/decoration). */
  label: React.ReactNode;
}

export interface RelatedSectionsNavProps {
  /** Accessible label for the nav landmark. */
  ariaLabel: string;
  /** Heading rendered above the link grid. */
  heading: React.ReactNode;
  items: RelatedSectionsNavItem[];
  className?: string;
}

/**
 * "Jump to related sections" nav: a top-bordered block with a heading and a
 * responsive grid of pill links. Owns all chrome so report pages compose it
 * with zero Tailwind. Used for the ETF (and, eventually, stock) detail pages'
 * "More analyses" footer.
 */
export default function RelatedSectionsNav({ ariaLabel, heading, items, className }: RelatedSectionsNavProps): React.JSX.Element {
  return (
    <nav aria-label={ariaLabel} className={cn('mt-10 pt-6 border-t border-border', className)}>
      <h2 className="text-lg font-semibold mb-3">{heading}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.href} className="h-full">
            <Link
              href={item.href}
              prefetch={false}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-surface hover:bg-surface-2 text-body hover:text-heading transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
