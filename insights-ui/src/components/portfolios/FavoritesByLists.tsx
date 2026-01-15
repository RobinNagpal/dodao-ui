'use client';

import { FavouriteWithFullDetails } from '@/types/portfolio';
import { UserTickerList } from '@prisma/client';
import StockTable from './StockTable';

interface FavoritesByListsProps {
  allFavorites: FavouriteWithFullDetails[];
}

export default function FavoritesByLists({ allFavorites }: FavoritesByListsProps) {
  // Group favorites by list
  const listsMap = new Map<string, { list: UserTickerList; favorites: FavouriteWithFullDetails[] }>();
  const unlisted: FavouriteWithFullDetails[] = [];

  allFavorites.forEach((favorite) => {
    if (favorite.lists && favorite.lists.length > 0) {
      favorite.lists.forEach((list: UserTickerList) => {
        if (!listsMap.has(list.id)) {
          listsMap.set(list.id, { list, favorites: [] });
        }
        listsMap.get(list.id)!.favorites.push(favorite);
      });
    } else {
      unlisted.push(favorite);
    }
  });

  // Sort favorites within each list by industry + score (same as StockTable default)
  listsMap.forEach((listData) => {
    listData.favorites.sort((a, b) => {
      // Sort by industry first
      const industryA = a.ticker.industry?.name ?? '';
      const industryB = b.ticker.industry?.name ?? '';
      const industryCompare = industryA.localeCompare(industryB);
      if (industryCompare !== 0) return industryCompare;

      // Then by sub-industry
      const subIndustryA = a.ticker.subIndustry?.name ?? '';
      const subIndustryB = b.ticker.subIndustry?.name ?? '';
      const subIndustryCompare = subIndustryA.localeCompare(subIndustryB);
      if (subIndustryCompare !== 0) return subIndustryCompare;

      // Finally by score descending
      const scoreA = a.ticker.cachedScoreEntry?.finalScore ?? 0;
      const scoreB = b.ticker.cachedScoreEntry?.finalScore ?? 0;
      return scoreB - scoreA;
    });
  });

  // Sort unlisted favorites the same way
  unlisted.sort((a, b) => {
    const industryA = a.ticker.industry?.name ?? '';
    const industryB = b.ticker.industry?.name ?? '';
    const industryCompare = industryA.localeCompare(industryB);
    if (industryCompare !== 0) return industryCompare;

    const subIndustryA = a.ticker.subIndustry?.name ?? '';
    const subIndustryB = b.ticker.subIndustry?.name ?? '';
    const subIndustryCompare = subIndustryA.localeCompare(subIndustryB);
    if (subIndustryCompare !== 0) return subIndustryCompare;

    const scoreA = a.ticker.cachedScoreEntry?.finalScore ?? 0;
    const scoreB = b.ticker.cachedScoreEntry?.finalScore ?? 0;
    return scoreB - scoreA;
  });

  const listsWithFavorites = Array.from(listsMap.values()).sort((a, b) => a.list.name.localeCompare(b.list.name));

  if (allFavorites.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
        <p className="text-gray-400">No favorite stocks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Favorites grouped by lists */}
      {listsWithFavorites.map(({ list, favorites }) => (
        <div key={list.id}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded"></span>
            {list.name} ({favorites.length} {favorites.length === 1 ? 'stock' : 'stocks'})
          </h3>
          <StockTable items={favorites} type="favorites" />
        </div>
      ))}

      {/* Unlisted Favorites */}
      {unlisted.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gray-500 rounded"></span>
            Other Favorites ({unlisted.length} {unlisted.length === 1 ? 'stock' : 'stocks'})
          </h3>
          <StockTable items={unlisted} type="favorites" />
        </div>
      )}
    </div>
  );
}
