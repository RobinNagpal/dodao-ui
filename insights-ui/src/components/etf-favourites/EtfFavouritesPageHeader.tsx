import { HeartIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface EtfFavouritesPageHeaderProps {
  favouritesCount: number;
}

export default function EtfFavouritesPageHeader({ favouritesCount }: EtfFavouritesPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 tracking-tight">
        <HeartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 shrink-0" />
        My Favourite ETFs
      </h1>
      <p className="text-sm text-gray-400 mt-1">
        <span className="font-semibold text-gray-100">{favouritesCount}</span> favourite {favouritesCount === 1 ? 'ETF' : 'ETFs'}
      </p>
    </div>
  );
}
