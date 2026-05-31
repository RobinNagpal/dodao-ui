import { HeartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

interface FavouritesEmptyStateProps {
  /** Where the call-to-action button links to. Defaults to the stocks listing. */
  browseHref?: string;
  browseLabel?: string;
}

/**
 * Empty state shown when the user has no favourites yet.
 */
export default function FavouritesEmptyState({ browseHref = '/stocks', browseLabel = 'Browse Stocks' }: FavouritesEmptyStateProps) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-6 py-12 sm:py-16 text-center">
      <HeartIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-5" />
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No favourites yet</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
        Start adding stocks to your favourites and they&apos;ll show up here, grouped by your lists.
      </p>
      <Link
        href={browseHref}
        className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white text-sm font-semibold"
      >
        {browseLabel}
      </Link>
    </div>
  );
}
