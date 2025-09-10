'use client';

import { useState, useEffect } from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { TickerV1ReportResponse } from '@/app/api/[spaceId]/tickers-v1/[ticker]/route';
import { CATEGORY_MAPPINGS, TickerAnalysisCategory, INDUSTRY_MAPPINGS, SUB_INDUSTRY_MAPPINGS } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getScoreColorClasses } from '@/utils/score-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

interface ComparisonTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore?: number;
  categoryResults: {
    [key in TickerAnalysisCategory]: {
      factorResults: Array<{
        factorTitle: string;
        factorAnalysisKey: string;
        result: 'Pass' | 'Fail';
        oneLineExplanation: string;
      }>;
    };
  };
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTicker: {
    symbol: string;
    name: string;
    industryKey: string;
    subIndustryKey: string;
  };
}

interface IndustryTickersResponse {
  tickers: Array<{
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    industryKey: string;
    subIndustryKey: string;
    cachedScore?: Number;
  }>;
  count: number;
}

export default function ComparisonModal({ isOpen, onClose, currentTicker }: ComparisonModalProps) {
  const [comparisonTickers, setComparisonTickers] = useState<ComparisonTicker[]>([]);
  const [availableTickers, setAvailableTickers] = useState<IndustryTickersResponse['tickers']>([]);
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
      const data: TickerV1ReportResponse = await response.json();

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
        id: data.ticker.id,
        name: data.ticker.name,
        symbol: data.ticker.symbol,
        exchange: data.ticker.exchange,
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
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${currentTicker.industryKey}/${currentTicker.subIndustryKey}`);
      const data: IndustryTickersResponse = await response.json();
      setAvailableTickers(data.tickers.filter((t) => t.symbol !== currentTicker.symbol));
    } catch (error) {
      console.error('Error loading available tickers:', error);
    }
  };

  const addTicker = async (ticker: IndustryTickersResponse['tickers'][0]) => {
    if (comparisonTickers.length >= 5) return;
    if (comparisonTickers.some((t) => t.symbol === ticker.symbol)) return;

    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.symbol}`);
      const data: TickerV1ReportResponse = await response.json();

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
        id: data.ticker.id,
        name: data.ticker.name,
        symbol: data.ticker.symbol,
        exchange: data.ticker.exchange,
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

  const getCategoryFactorRows = () => {
    const rows: Array<{
      category: TickerAnalysisCategory;
      categoryName: string;
      factorIndex: number;
      factorTitle: string;
      isCategoryHeader: boolean;
    }> = [];

    // Use the first ticker's data to get actual factor titles
    const firstTicker = comparisonTickers[0];
    if (!firstTicker) return rows;

    Object.values(TickerAnalysisCategory).forEach((category) => {
      const categoryData = firstTicker.categoryResults[category];

      // Add category header
      rows.push({
        category,
        categoryName: CATEGORY_MAPPINGS[category],
        factorIndex: -1,
        factorTitle: '',
        isCategoryHeader: true,
      });

      // Add factors for this category using actual factor titles
      if (categoryData?.factorResults) {
        categoryData.factorResults.forEach((factor, index) => {
          rows.push({
            category,
            categoryName: CATEGORY_MAPPINGS[category],
            factorIndex: index,
            factorTitle: factor.factorTitle,
            isCategoryHeader: false,
          });
        });
      }
    });

    return rows;
  };

  const getFactorResult = (ticker: ComparisonTicker, category: TickerAnalysisCategory, factorIndex: number) => {
    const categoryData = ticker.categoryResults[category];
    if (!categoryData?.factorResults?.[factorIndex]) {
      return { result: null, explanation: 'No data available' };
    }

    const factor = categoryData.factorResults[factorIndex];
    return {
      result: factor.result,
      explanation: factor.oneLineExplanation,
    };
  };

  const modalTitle = (
    <div className="flex items-center w-full relative">
      <div className="flex-1 text-center">
        <h2 className="text-xl font-semibold">
          Stock Comparison - {INDUSTRY_MAPPINGS[currentTicker.industryKey as keyof typeof INDUSTRY_MAPPINGS] || currentTicker.industryKey} -{' '}
          {SUB_INDUSTRY_MAPPINGS[currentTicker.subIndustryKey as keyof typeof SUB_INDUSTRY_MAPPINGS] || currentTicker.subIndustryKey}
        </h2>
      </div>
      <p className="absolute right-0 text-sm text-gray-400">Selected: {comparisonTickers.length}/5</p>
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
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-full divide-y divide-gray-700">
                {/* Header */}
                <div className="bg-gray-800 grid" style={{ gridTemplateColumns: `minmax(300px, 1fr) repeat(${comparisonTickers.length}, minmax(200px, 1fr))` }}>
                  <div className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800">
                    Comparison Factors
                  </div>
                  {comparisonTickers.map((ticker) => (
                    <div key={ticker.symbol} className="px-2 py-3 text-left text-xs font-medium text-gray-300 tracking-wider">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          {ticker.cachedScore !== undefined ? (
                            <span className={getScoreColorClasses(ticker.cachedScore).textColorClass}>{ticker.cachedScore}/25</span>
                          ) : (
                            <span className="text-gray-400">-/25</span>
                          )}
                          <span className="ml-1">{ticker.symbol}</span>
                          <button
                            onClick={() => removeTicker(ticker.symbol)}
                            className="text-gray-400 hover:text-red-400 flex-shrink-0"
                            disabled={comparisonTickers.length === 1}
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{ticker.name}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Body */}
                <div className="bg-gray-900 divide-y divide-gray-700">
                  {getCategoryFactorRows().map((row, rowIndex) => (
                    <div
                      key={`${row.category}-${row.factorIndex}`}
                      className={`grid ${row.isCategoryHeader ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                      style={{ gridTemplateColumns: `minmax(300px, 1fr) repeat(${comparisonTickers.length}, minmax(200px, 1fr))` }}
                    >
                      <div className="px-4 py-3 sticky left-0 text-left min-w-0 bg-gray-900">
                        {row.isCategoryHeader ? (
                          <div className="font-bold text-gray-100 text-base">{row.categoryName}</div>
                        ) : (
                          <div className="text-gray-300 text-sm leading-tight pl-4 break-words overflow-wrap-anywhere">{row.factorTitle}</div>
                        )}
                      </div>
                      {comparisonTickers.map((ticker) => {
                        if (row.isCategoryHeader) {
                          return (
                            <div key={`${ticker.symbol}-header`} className="px-2 py-3 text-left" style={{ backgroundColor: 'rgb(17 24 39)' }}>
                              <span className="text-gray-400 text-sm">-</span>
                            </div>
                          );
                        }

                        const factorResult = getFactorResult(ticker, row.category, row.factorIndex);

                        return (
                          <div key={`${ticker.symbol}-${row.category}-${row.factorIndex}`} className="px-2 py-3 text-left">
                            {factorResult.result ? (
                              <div className="flex flex-col items-start space-y-2">
                                <div className="flex items-center space-x-1">
                                  {factorResult.result === 'Pass' ? (
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs font-medium ${factorResult.result === 'Pass' ? 'text-green-400' : 'text-red-400'}`}>
                                    {factorResult.result}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 leading-tight max-w break-words">{factorResult.explanation}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
