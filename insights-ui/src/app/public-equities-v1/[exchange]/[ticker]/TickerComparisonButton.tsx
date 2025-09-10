'use client';

import ComparisonModal from '@/app/public-equities-v1/[exchange]/[ticker]/ComparisonModal';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export interface TickerComparisonButtonProps {
  tickerName: string;
  tickerSymbol: string;
  tickerIndustry: string;
  tickerSubIndustry: string;
}

export default function TickerComparisonButton({ tickerSymbol, tickerName, tickerIndustry, tickerSubIndustry }: TickerComparisonButtonProps) {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const handleCompareClick = () => {
    setIsComparisonModalOpen(true);
  };

  return (
    <div className="flex-shrink-0 ml-4">
      <button
        onClick={handleCompareClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <span className="mr-2">
          <ScaleIcon className="w-4 h-4" aria-hidden="true" />
        </span>
        Compare with others
      </button>
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        currentTicker={{
          symbol: tickerSymbol,
          name: tickerName,
          industryKey: tickerIndustry,
          subIndustryKey: tickerSubIndustry,
        }}
      />
    </div>
  );
}
