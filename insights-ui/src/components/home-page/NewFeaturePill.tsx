import { SparklesIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

export interface NewFeaturePillProps {
  /** Short label, e.g. "New: ETF Reports". */
  label: string;
  /** Destination — an in-page anchor (e.g. `#etf-analysis`) or a route. */
  href: string;
  className?: string;
}

/**
 * Small, reusable "New" pill used to surface a freshly launched section without changing the
 * primary hero copy. Links to an in-page anchor (scroll) or a route so users can jump straight to
 * the new content even when it sits below the fold.
 */
export default function NewFeaturePill({ label, href, className = '' }: NewFeaturePillProps): React.JSX.Element {
  // `badge-tone-accent` is a style-free hook — light mode darkens the
  // indigo-300 text (unreadable on white) via `.page-theme-light`.
  return (
    <Link
      href={href}
      className={`badge-tone-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold
                  bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/30
                  hover:bg-indigo-500/25 hover:text-link transition-colors ${className}`}
    >
      <SparklesIcon className="h-4 w-4" aria-hidden="true" />
      {label}
      <span aria-hidden>→</span>
    </Link>
  );
}
