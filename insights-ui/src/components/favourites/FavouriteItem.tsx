import { FavouriteTickerResponse } from '@/types/ticker-user';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getScoreColorClasses } from '@/utils/score-utils';
import CategoryScores from './CategoryScores';
import BusinessAnalysis from './BusinessAnalysis';
import FavouriteNotes from './FavouriteNotes';
import FavouriteTags from './FavouriteTags';
import CompetitorsAlternatives from './CompetitorsAlternatives';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';

interface FavouriteItemProps {
  favourite: FavouriteTickerResponse;
  showBusinessAnalysis: boolean;
  onEdit: (favourite: FavouriteTickerResponse) => void;
  onDelete: (favourite: FavouriteTickerResponse) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelectChange?: (favourite: FavouriteTickerResponse, selected: boolean) => void;
}

export default function FavouriteItem({
  favourite,
  showBusinessAnalysis,
  onEdit,
  onDelete,
  selectable = false,
  isSelected = false,
  onSelectChange,
}: FavouriteItemProps) {
  const getBusinessAndMoatSummary = (favourite: FavouriteTickerResponse): string | null => {
    const businessAndMoatResult = favourite.ticker.categoryAnalysisResults?.find((r) => r.categoryKey === TickerAnalysisCategory.BusinessAndMoat);
    const summary = businessAndMoatResult?.overallAnalysisDetails;
    return summary && summary.trim() !== '' ? summary : null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selectable && (
            <div className="mr-1" onClick={(e) => e.stopPropagation()}>
              <Checkboxes
                items={[
                  {
                    id: favourite.id,
                    name: `favourite-${favourite.id}`,
                    label: '',
                  },
                ]}
                selectedItemIds={isSelected ? [favourite.id] : []}
                onChange={(ids) => onSelectChange?.(favourite, ids.includes(favourite.id))}
                className="bg-transparent"
              />
            </div>
          )}
          <Link href={`/stocks/${favourite.ticker.exchange}/${favourite.ticker.symbol}`} className="hover:text-blue-400">
            <h4 className="text-base font-bold">
              {favourite.ticker.name} ({favourite.ticker.symbol})
            </h4>
          </Link>
          {favourite.ticker.cachedScoreEntry && (
            <>
              {(() => {
                const { textColorClass, bgColorClass } = getScoreColorClasses(favourite.ticker.cachedScoreEntry.finalScore);
                return (
                  <span className={`${textColorClass} px-1.5 py-0.5 rounded-md ${bgColorClass} bg-opacity-15 font-semibold text-xs`}>
                    {favourite.ticker.cachedScoreEntry.finalScore}/25
                  </span>
                );
              })()}
            </>
          )}
          {favourite.myScore !== null && favourite.myScore !== undefined && (
            <span className="font-bold text-xs" style={{ color: 'var(--primary-color, #3B82F6)' }}>
              My Score: {favourite.myScore % 1 === 0 ? favourite.myScore.toString() : favourite.myScore.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(favourite)} className="text-blue-400 hover:text-blue-300 p-1" title="Edit">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(favourite)} className="text-red-400 hover:text-red-300 p-1" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Scores */}
      <CategoryScores cachedScoreEntry={favourite.ticker.cachedScoreEntry} />

      {/* Business & Moat Details */}
      <BusinessAnalysis summary={getBusinessAndMoatSummary(favourite)} showBusinessAnalysis={showBusinessAnalysis} />

      {/* My Notes */}
      <FavouriteNotes notes={favourite.myNotes} />

      {/* Competitors and Alternatives */}
      <CompetitorsAlternatives competitorsConsidered={favourite.competitorsConsidered} betterAlternatives={favourite.betterAlternatives} />

      {/* Tags */}
      <FavouriteTags tags={favourite.tags} />
    </div>
  );
}
