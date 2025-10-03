'use client';

import { BasicTickersResponse, IndustryTickersResponse } from '@/types/ticker-typesv1';
import { useState, useEffect } from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getScoreColorClasses } from '@/utils/score-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { PlusIcon } from '@heroicons/react/24/outline';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TickerComparison, { ComparisonTicker } from '@/components/ticker-reportsv1/TickerComparison';
import { TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';

// Using ComparisonTicker interface imported from TickerComparison component

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTicker: {
    symbol: string;
    name: string;
    industryKey: string;
    subIndustryKey: string;
    industryName: string;
    subIndustryName: string;
  };
}

export default function ComparisonModal({ isOpen, onClose, currentTicker }: ComparisonModalProps) {
  const [comparisonTickers, setComparisonTickers] = useState<ComparisonTicker[]>([]);
  const [availableTickers, setAvailableTickers] = useState<BasicTickersResponse['tickers']>([]);
  const [loading, setLoading] = useState(false);

  // Initialize with current ticker
  useEffect(() => {
    if (isOpen && currentTicker.symbol) {
      // Load current ticker data
      loadCurrentTickerData();
      // Load available tickers from same industry
      loadAvailableTickers();
    }
  }, [isOpen, currentTicker]);

  const loadCurrentTickerData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${currentTicker.symbol}`);
      const data: TickerV1FastResponse = await response.json();

      const categoryResults = Object.values(TickerAnalysisCategory).reduce((acc, category) => {
        const categoryResult = data.categoryAnalysisResults?.find((r) => r.categoryKey === category);
        const factorResults = categoryResult?.factorResults || [];

        acc[category] = {
          factorResults: factorResults.map((f) => ({
            factorTitle: f.analysisCategoryFactor?.factorAnalysisTitle || 'Unknown Factor',
            factorAnalysisKey: f.analysisCategoryFactor?.factorAnalysisKey || '',
            result: f.result,
            oneLineExplanation: f.oneLineExplanation,
          })),
        };

        return acc;
      }, {} as ComparisonTicker['categoryResults']);

      const currentTickerData: ComparisonTicker = {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        exchange: data.exchange,
        cachedScore: data.cachedScore as number,
        categoryResults,
      };

      setComparisonTickers([currentTickerData]);
    } catch (error) {
      console.error('Error loading current ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTickers = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${currentTicker.industryKey}/${currentTicker.subIndustryKey}?basicOnly=true`
      );
      const data: BasicTickersResponse = await response.json();
      setAvailableTickers(data.tickers.filter((t) => t.symbol !== currentTicker.symbol));
    } catch (error) {
      console.error('Error loading available tickers:', error);
    }
  };

  const addTicker = async (ticker: BasicTickersResponse['tickers'][0]) => {
    if (comparisonTickers.length >= 5) return;
    if (comparisonTickers.some((t) => t.symbol === ticker.symbol)) return;

    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.symbol}`);
      const data: TickerV1FastResponse = await response.json();

      const categoryResults = Object.values(TickerAnalysisCategory).reduce((acc, category) => {
        const categoryResult = data.categoryAnalysisResults?.find((r) => r.categoryKey === category);
        const factorResults = categoryResult?.factorResults || [];

        acc[category] = {
          factorResults: factorResults.map((f) => ({
            factorTitle: f.analysisCategoryFactor?.factorAnalysisTitle || 'Unknown Factor',
            factorAnalysisKey: f.analysisCategoryFactor?.factorAnalysisKey || '',
            result: f.result,
            oneLineExplanation: f.oneLineExplanation,
          })),
        };

        return acc;
      }, {} as ComparisonTicker['categoryResults']);

      const newTicker: ComparisonTicker = {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        exchange: data.exchange,
        cachedScore: data.cachedScore as number,
        categoryResults,
      };

      setComparisonTickers((prev) => [...prev, newTicker]);
    } catch (error) {
      console.error('Error loading ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeTicker = (symbol: string) => {
    setComparisonTickers((prev) => prev.filter((t) => t.symbol !== symbol));
  };

  // These functions are now part of the TickerComparison component

  const modalTitle = (
    <div className="flex items-center w-full relative">
      <div className="flex-1 text-center">
        <h2 className="text-xl font-semibold">
          Stock Comparison - {currentTicker.industryName} - {currentTicker.subIndustryName} - Selected: {comparisonTickers.length}/5
        </h2>
      </div>
      <p className="absolute right-0 text-sm text-gray-400"></p>
    </div>
  );

  return (
    <FullScreenModal open={isOpen} onClose={onClose} title={modalTitle} showCloseButton={true} showTitleBg={true}>
      <PageWrapper>
        <div className="px-6">
          {/* Ticker Header with Scores */}
          <div className="mb-6">
            {/* Add Ticker Section */}
            {comparisonTickers.length < 5 && (
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {availableTickers
                    .filter((ticker) => !comparisonTickers.some((ct) => ct.symbol === ticker.symbol))
                    .slice(0, 12)
                    .map((ticker) => (
                      <button
                        key={ticker.symbol}
                        onClick={() => addTicker(ticker)}
                        disabled={loading}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 text-left font-medium text-sm w-full"
                      >
                        <div className="flex items-center">
                          <PlusIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span
                                className={ticker.cachedScore !== undefined ? getScoreColorClasses(Number(ticker.cachedScore)).textColorClass : 'text-gray-100'}
                              >
                                {ticker.cachedScore !== undefined ? Number(ticker.cachedScore) : '-'}/25
                              </span>
                              <span className="font-medium ml-1 mr-1">{ticker.symbol}</span>
                              <span className="text-xs text-gray-400 truncate">{ticker.name}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <TickerComparison comparisonTickers={comparisonTickers} removeTicker={removeTicker} isModal={true} />

          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-300">Loading ticker data...</span>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
}
