'use client';

import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { FavouriteTickerResponse } from '@/types/ticker-user';
import FavouriteItem from './FavouriteItem';
import React from 'react';

interface FavouritesAccordionSectionProps {
  /** Stable id used to track open/closed state (list id, or e.g. "unlisted"). */
  sectionId: string;
  /** Display name shown in the accordion header. */
  name: string;
  favourites: FavouriteTickerResponse[];
  isOpen: boolean;
  onToggle: (e: React.MouseEvent<HTMLElement>, sectionId: string) => void;
  showBusinessAnalysis: boolean;
  onEdit: (e: React.MouseEvent, favourite: FavouriteTickerResponse) => void;
  onDelete: (e: React.MouseEvent, favourite: FavouriteTickerResponse) => void;
  selectable: boolean;
  selectedFavouriteIds: Set<string>;
  onSelectChange: (favourite: FavouriteTickerResponse, selected: boolean) => void;
}

/**
 * Renders a single collapsible list of favourites. Used for both the
 * user-defined lists and the "Unlisted Favourites" bucket so the rendering
 * logic lives in one place.
 */
export default function FavouritesAccordionSection({
  sectionId,
  name,
  favourites,
  isOpen,
  onToggle,
  showBusinessAnalysis,
  onEdit,
  onDelete,
  selectable,
  selectedFavouriteIds,
  onSelectChange,
}: FavouritesAccordionSectionProps) {
  // When collapsed, surface the contained tickers so users can scan without expanding.
  const tickerSymbols = favourites.map((f) => f.ticker.symbol).join(', ');
  const label = isOpen ? name : `${name} (${tickerSymbols})`;

  return (
    <Accordion isOpen={isOpen} label={label} onClick={(e) => onToggle(e, sectionId)}>
      <div className="space-y-2">
        {favourites.map((favourite) => (
          <FavouriteItem
            key={favourite.id}
            favourite={favourite}
            showBusinessAnalysis={showBusinessAnalysis}
            onEdit={onEdit}
            onDelete={onDelete}
            selectable={selectable}
            isSelected={selectedFavouriteIds.has(favourite.id)}
            onSelectChange={onSelectChange}
          />
        ))}
      </div>
    </Accordion>
  );
}
