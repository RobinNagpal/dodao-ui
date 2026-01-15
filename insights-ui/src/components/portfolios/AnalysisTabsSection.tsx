'use client';

import { useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { IndustryByCountry, FavouriteWithFullDetails, NoteWithFullDetails } from '@/types/portfolio';
import IndustryAnalysisGrid from './IndustryAnalysisGrid';
import StockTable from './StockTable';
import FavoritesByLists from './FavoritesByLists';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

type ViewType = 'industry' | 'favorites' | 'notes';

interface AnalysisTabsSectionProps {
  industriesByCountry: IndustryByCountry[];
  allFavorites: FavouriteWithFullDetails[];
  allNotes: NoteWithFullDetails[];
  portfolioManagerId: string;
}

export default function AnalysisTabsSection({ industriesByCountry, allFavorites, allNotes, portfolioManagerId }: AnalysisTabsSectionProps) {
  const [viewType, setViewType] = useState<ViewType>('industry');

  // Don't render if no data at all
  if (industriesByCountry.length === 0 && allFavorites.length === 0 && allNotes.length === 0) {
    return null;
  }

  // Get count for each view type
  const getCount = (type: ViewType) => {
    switch (type) {
      case 'industry':
        return industriesByCountry.length;
      case 'favorites':
        return allFavorites.length;
      case 'notes':
        return allNotes.length;
    }
  };

  // Build dropdown items with counts
  const viewOptions: StyledSelectItem[] = [
    { id: 'industry', label: `By Industry (${getCount('industry')})` },
    { id: 'favorites', label: `All Favourites (${getCount('favorites')})` },
    { id: 'notes', label: `All Notes (${getCount('notes')})` },
  ];

  return (
    <div className="mb-8">
      {/* Section Header with Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            Analysis & Favourites
          </h2>
          <p className="text-gray-400 mt-1">Stocks analyzed, marked as favorites, or with notes by this portfolio manager</p>
        </div>

        {/* View Type Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold whitespace-nowrap">View Type:</span>
          <div className="min-w-[200px]">
            <StyledSelect label="" selectedItemId={viewType} items={viewOptions} setSelectedItemId={(id) => setViewType((id as ViewType) || 'industry')} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {viewType === 'industry' && <IndustryAnalysisGrid industriesByCountry={industriesByCountry} portfolioManagerId={portfolioManagerId} />}
        {viewType === 'favorites' && <FavoritesByLists allFavorites={allFavorites} />}
        {viewType === 'notes' && <StockTable items={allNotes} type="notes" />}
      </div>
    </div>
  );
}
