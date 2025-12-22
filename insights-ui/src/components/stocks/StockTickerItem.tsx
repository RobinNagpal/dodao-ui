'use client';

import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { TickerV1Notes } from '@prisma/client';
import { useState } from 'react';
import AddEditNotesModal from '@/app/stocks/[exchange]/[ticker]/AddEditNotesModal';
import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import { ExpandedFavouriteTicker } from '@/types/api/ticker-industries';

interface StockTickerItemProps {
  symbol: string;
  name: string;
  exchange: string;
  score: number;
  displayExchange?: string; // Optional formatted exchange (e.g., "US: NYSE")
  industry?: string; // Optional industry name
  favouriteTicker?: ExpandedFavouriteTicker | null; // Optional favourite data with full relations
  tickerNotes?: TickerV1Notes | null; // Optional notes data
}

export default function StockTickerItem({ symbol, name, exchange, score, displayExchange, industry, favouriteTicker, tickerNotes }: StockTickerItemProps) {
  const { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score || 0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isFavouriteModalOpen, setIsFavouriteModalOpen] = useState(false);

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNotesModalOpen(true);
  };

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavouriteModalOpen(true);
  };

  return (
    <>
      <Link href={`/stocks/${exchange}/${symbol}`} className="w-full" aria-label={`View ${name}`} title={`View ${name}`}>
        <div className="flex gap-1.5 items-center min-w-0">
          <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right shrink-0`}>
            <span className="font-mono tabular-nums text-right text-xs">{score}/25</span>
          </p>
          <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm shrink-0">{symbol}</p>
          <p className="text-sm font-medium text-break break-words text-white truncate min-w-0 flex-1">{name}</p>
          {industry && <p className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0 ml-2">{industry}</p>}
          {displayExchange && !industry && <p className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0 ml-2">{displayExchange}</p>}
          {tickerNotes && (
            <button onClick={handleNotesClick} className="shrink-0" title="View notes">
              <DocumentTextIcon className="w-4 h-4 text-green-300 hover:text-green-200" />
            </button>
          )}
          {favouriteTicker && (
            <button onClick={handleFavouriteClick} className="shrink-0" title="View favourite">
              <HeartIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
            </button>
          )}
        </div>
      </Link>

      {tickerNotes && (
        <AddEditNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          tickerId=""
          tickerSymbol={symbol}
          tickerName={name}
          existingNote={tickerNotes}
          onUpsert={() => {}}
          viewOnly={true}
        />
      )}

      {favouriteTicker && (
        <AddEditFavouriteModal
          isOpen={isFavouriteModalOpen}
          onClose={() => setIsFavouriteModalOpen(false)}
          tickerId=""
          tickerSymbol={symbol}
          tickerName={name}
          lists={favouriteTicker.lists || []}
          tags={favouriteTicker.tags || []}
          onManageLists={() => {}}
          onManageTags={() => {}}
          favouriteTicker={
            {
              ...favouriteTicker,
              ticker: {
                id: favouriteTicker.tickerId,
                symbol,
                name,
                exchange,
                cachedScoreEntry: null,
              } as any,
              competitorsConsidered: favouriteTicker.competitorsConsidered || [],
              betterAlternatives: favouriteTicker.betterAlternatives || [],
            } as any
          }
          onUpsert={() => {}}
          viewOnly={true}
        />
      )}
    </>
  );
}
