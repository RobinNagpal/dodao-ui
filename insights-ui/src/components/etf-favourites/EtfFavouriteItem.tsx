import FavouriteNotes from '@/components/favourites/FavouriteNotes';
import { FavouriteEtfResponse } from '@/types/etf-user';
import { getEtfScoreColorClasses } from '@/utils/score-utils';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

interface EtfFavouriteItemProps {
  favourite: FavouriteEtfResponse;
  onEdit: (e: React.MouseEvent, favourite: FavouriteEtfResponse) => void;
  onDelete: (e: React.MouseEvent, favourite: FavouriteEtfResponse) => void;
}

export default function EtfFavouriteItem({ favourite, onEdit, onDelete }: EtfFavouriteItemProps) {
  const cachedScore = favourite.etf.cachedScore;

  return (
    <div className="bg-bg rounded-lg p-3 border border-border hover:border-border transition-colors">
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex-1 flex items-center gap-x-2 gap-y-1 flex-wrap">
          <Link
            href={`/etfs/${favourite.etf.exchange}/${favourite.etf.symbol}`}
            prefetch={false}
            className="hover:text-heading"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-semibold tracking-tight text-body leading-tight">
              {favourite.etf.name} ({favourite.etf.symbol})
            </h4>
          </Link>
          {cachedScore &&
            (() => {
              const { textColorClass, bgColorClass } = getEtfScoreColorClasses(cachedScore.finalScore);
              return (
                <span className={`${textColorClass} px-1.5 rounded ${bgColorClass} bg-opacity-15 font-semibold text-xs leading-5`}>
                  {cachedScore.finalScore}/20
                </span>
              );
            })()}
          {favourite.myScore !== null && favourite.myScore !== undefined && (
            <span className="font-semibold text-xs tracking-tight" style={{ color: 'var(--primary-color, #3B82F6)' }}>
              My Score: {favourite.myScore % 1 === 0 ? favourite.myScore.toString() : favourite.myScore.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          <button onClick={(e) => onEdit(e, favourite)} className="text-link hover:text-heading p-0.5" title="Edit">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={(e) => onDelete(e, favourite)} className="badge-tone-danger text-red-400 hover:text-red-300 p-0.5" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <FavouriteNotes notes={favourite.myNotes} />
    </div>
  );
}
