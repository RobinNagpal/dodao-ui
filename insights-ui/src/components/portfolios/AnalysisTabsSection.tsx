'use client';

import { useState } from 'react';
import { ChartBarIcon, StarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { IndustryByCountry, FavouriteWithFullDetails, NoteWithFullDetails } from '@/types/portfolio';
import IndustryAnalysisGrid from './IndustryAnalysisGrid';
import StockTable from './StockTable';

type TabType = 'industry' | 'favorites' | 'notes';

interface AnalysisTabsSectionProps {
  industriesByCountry: IndustryByCountry[];
  allFavorites: FavouriteWithFullDetails[];
  allNotes: NoteWithFullDetails[];
  portfolioManagerId: string;
}

const tabs = [
  { id: 'industry' as TabType, name: 'By Industry', icon: ChartBarIcon },
  { id: 'favorites' as TabType, name: 'All Favourites', icon: StarIcon },
  { id: 'notes' as TabType, name: 'All Notes', icon: DocumentTextIcon },
];

export default function AnalysisTabsSection({ industriesByCountry, allFavorites, allNotes, portfolioManagerId }: AnalysisTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('industry');

  // Don't render if no data at all
  if (industriesByCountry.length === 0 && allFavorites.length === 0 && allNotes.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-500" />
          Analysis & Favourites
        </h2>
        <p className="text-gray-400 mt-1">Stocks analyzed, marked as favorites, or with notes by this portfolio manager</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'industry' ? industriesByCountry.length : tab.id === 'favorites' ? allFavorites.length : allNotes.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'}
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-400'}
                  `}
                />
                {tab.name}
                {count > 0 && (
                  <span
                    className={`
                      ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium
                      ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'industry' && <IndustryAnalysisGrid industriesByCountry={industriesByCountry} portfolioManagerId={portfolioManagerId} />}
        {activeTab === 'favorites' && <StockTable items={allFavorites} type="favorites" />}
        {activeTab === 'notes' && <StockTable items={allNotes} type="notes" />}
      </div>
    </div>
  );
}
