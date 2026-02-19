'use client';

import ComparisonModal from '@/app/stocks/[exchange]/[ticker]/ComparisonModal';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

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

  const handleCompareClick = () => {
    setIsComparisonModalOpen(true);
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleCompareClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] border border-transparent rounded-lg shadow-md relative z-10"
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
          industryKey: tickerIndustryKey,
          subIndustryKey: tickerSubIndustryKey,
          industryName: tickerIndustryName,
          subIndustryName: tickerSubIndustryName,
        }}
      />
    </div>
  );
}
