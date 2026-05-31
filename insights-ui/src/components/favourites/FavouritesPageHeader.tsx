import { HeartIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface FavouritesPageHeaderProps {
  favouritesCount: number;
  listsCount: number;
}

/**
 * Page title + summary line for the favourites screen.
 * Kept generic so it can be reused for ETF favourites later.
 */
export default function FavouritesPageHeader({ favouritesCount, listsCount }: FavouritesPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5 tracking-tight">
        <HeartIcon className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 shrink-0" />
        My Favourites
      </h1>
      <p className="text-sm text-gray-400 mt-1.5">
        <span className="font-semibold text-gray-300">{favouritesCount}</span> favourite {favouritesCount === 1 ? 'stock' : 'stocks'} across{' '}
        <span className="font-semibold text-gray-300">{listsCount}</span> {listsCount === 1 ? 'list' : 'lists'}
      </p>
    </div>
  );
}
