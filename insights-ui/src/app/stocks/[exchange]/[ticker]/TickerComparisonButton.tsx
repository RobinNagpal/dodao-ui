'use client';

import { ScaleIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// ComparisonModal pulls in TickerComparison (multi-ticker table) +
// FullScreenModal. Loaded on first click only — saves several hundred ms of
// main-thread eval on initial page load.
const ComparisonModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/ComparisonModal'), { ssr: false });

export interface TickerComparisonButtonProps {
  tickerName: string;
  tickerSymbol: string;
  tickerIndustryKey: string;
  tickerSubIndustryKey: string;
  tickerIndustryName: string;
  tickerSubIndustryName: string;
}

export default function TickerComparisonButton({
  tickerSymbol,
  tickerName,
  tickerIndustryKey,
  tickerSubIndustryKey,
  tickerIndustryName,
  tickerSubIndustryName,
}: TickerComparisonButtonProps) {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  // Once mounted we keep it mounted so the close animation stays smooth; the
  // dynamic chunk only fetches the first time `hasMountedModal` flips to true.
  const [hasMountedModal, setHasMountedModal] = useState(false);

  const handleCompareClick = () => {
    setHasMountedModal(true);
    setIsComparisonModalOpen(true);
  };

  return (
    <div className="flex-shrink-0 relative">
      <button
        onClick={handleCompareClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 border border-transparent rounded-lg shadow-md"
      >
        <span className="mr-2">
          <ScaleIcon className="w-4 h-4" aria-hidden="true" />
        </span>
        Compare with others
      </button>
      {hasMountedModal && (
        <ComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          currentTicker={{
            symbol: tickerSymbol,
            name: tickerName,
            industryKey: tickerIndustryKey,
            subIndustryKey: tickerSubIndustryKey,
            industryName: tickerIndustryName,
            subIndustryName: tickerSubIndustryName,
          }}
        />
      )}
    </div>
  );
}
