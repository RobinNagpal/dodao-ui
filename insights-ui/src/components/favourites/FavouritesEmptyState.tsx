import { HeartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

interface FavouritesEmptyStateProps {
  /** Where the call-to-action button links to. Defaults to the stocks listing. */
  browseHref?: string;
  browseLabel?: string;
  /** Body copy under the title. Defaults to the stock-favourites wording. */
  description?: React.ReactNode;
}

/**
 * Empty state shown when the user has no favourites yet.
 */
export default function FavouritesEmptyState({
  browseHref = '/stocks',
  browseLabel = 'Browse Stocks',
  description = "Start adding stocks to your favourites and they'll show up here, grouped by your lists.",
}: FavouritesEmptyStateProps) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-12 sm:py-16 text-center">
      <HeartIcon className="w-14 h-14 sm:w-16 sm:h-16 text-muted mx-auto mb-5" />
      <h3 className="text-lg sm:text-xl font-semibold text-heading mb-2">No favourites yet</h3>
      <p className="text-sm text-muted mb-6 max-w-md mx-auto">{description}</p>
      <Link href={browseHref} className="inline-flex items-center px-5 py-2.5 bg-primary transition-colors rounded-lg text-primary-text text-sm font-semibold">
        {browseLabel}
      </Link>
    </div>
  );
}
