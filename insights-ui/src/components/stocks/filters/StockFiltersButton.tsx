'use client';

import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import StockFiltersModal, { type StockFiltersTopSection } from '@/components/stocks/filters/StockFiltersModal';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';

interface StockFiltersButtonProps {
  /** Currently selected filters, keyed by `FilterParamKey`. */
  selected: SelectedFiltersMap;
  /** Called with the new selection when the modal's "Apply Filters" is pressed. */
  onApply: (selected: SelectedFiltersMap) => void;
  /** Number shown in the badge. Defaults to the count of non-empty selections. */
  activeCount?: number;
  topSection?: StockFiltersTopSection;
  /** Label of the modal's apply button; defaults to "Apply Filters". */
  applyLabel?: string;
}

/**
 * "Filters" trigger + the stock filter modal, driven purely by props. Both the
 * URL-driven stock pages and client-side screens build on this.
 */
export default function StockFiltersButton({ selected, onApply, activeCount, topSection, applyLabel }: StockFiltersButtonProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const badgeCount: number = activeCount ?? Object.values(selected).filter((v) => v && v.length > 0).length;

  const handleApply = (next: SelectedFiltersMap): void => {
    onApply(next);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        type="button"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-black font-medium rounded-lg px-4 py-2.5 text-sm shadow-md"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Filters
        {badgeCount > 0 && <span className="bg-blue-500 px-2 py-0.5 font-bold rounded-full text-xs animate-pulse">{badgeCount}</span>}
      </button>

      <StockFiltersModal
        open={isModalOpen}
        initialSelected={selected}
        onApply={handleApply}
        onClose={() => setIsModalOpen(false)}
        topSection={topSection}
        applyLabel={applyLabel}
      />
    </>
  );
}
