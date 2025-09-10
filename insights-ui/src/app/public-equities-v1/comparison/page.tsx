'use client';

import { useState, useEffect } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CATEGORY_MAPPINGS, TickerAnalysisCategory, INDUSTRY_OPTIONS, SUB_INDUSTRY_OPTIONS, INDUSTRY_MAPPINGS, SUB_INDUSTRY_MAPPINGS } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1ReportResponse } from '@/app/api/[spaceId]/tickers-v1/[ticker]/route';
import { TickerV1 } from '@prisma/client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ComparisonData {
  ticker: string;
  name: string;
  categoryResults: {
    [key in TickerAnalysisCategory]: {
      passCount: number;
      failCount: number;
      totalCount: number;
      factorResults: Array<{
        factorTitle: string;
        result: 'Pass' | 'Fail';
        oneLineExplanation: string;
      }>;
    };
  };
}

export default function ComparisonPage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TickerAnalysisCategory>(TickerAnalysisCategory.BusinessAndMoat);
  const [allTickers, setAllTickers] = useState<TickerV1[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities-v1`,
      current: false,
    },
    {
      name: 'Comparison',
      href: `/public-equities-v1/comparison`,
      current: true,
    },
  ];

  // Fetch all available tickers
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`);
        const tickers = await response.json();
        setAllTickers(tickers);
      } catch (error) {
        console.error('Error fetching tickers:', error);
      }
    };

    fetchTickers();
  }, []);

  // Filter tickers based on industry and sub-industry
  const filteredTickers = allTickers.filter((ticker) => {
    const matchesIndustry = !selectedIndustry || ticker.industryKey === selectedIndustry;
    const matchesSubIndustry = !selectedSubIndustry || ticker.subIndustryKey === selectedSubIndustry;
    const matchesSearch =
      !searchQuery || ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || ticker.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesIndustry && matchesSubIndustry && matchesSearch;
  });

  // Load comparison data when stocks are selected
  useEffect(() => {
    if (selectedStocks.length === 0) {
      setComparisonData([]);
      return;
    }

    const loadComparisonData = async () => {
      setLoading(true);
      try {
        const promises = selectedStocks.map(async (tickerSymbol) => {
          const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${tickerSymbol}`);
          const data: TickerV1ReportResponse = await response.json();

          const categoryResults = Object.values(TickerAnalysisCategory).reduce((acc, category) => {
            const categoryResult = data.categoryAnalysisResults?.find((r) => r.categoryKey === category);
            const factorResults = categoryResult?.factorResults || [];

            acc[category] = {
              passCount: factorResults.filter((f) => f.result === 'Pass').length,
              failCount: factorResults.filter((f) => f.result === 'Fail').length,
              totalCount: factorResults.length,
              factorResults: factorResults.map((f) => ({
                factorTitle: f.analysisCategoryFactor?.factorAnalysisTitle || 'Unknown Factor',
                result: f.result,
                oneLineExplanation: f.oneLineExplanation,
              })),
            };

            return acc;
          }, {} as ComparisonData['categoryResults']);

          return {
            ticker: tickerSymbol,
            name: data.name,
            categoryResults,
          };
        });

        const results = await Promise.all(promises);
        setComparisonData(results);
      } catch (error) {
        console.error('Error loading comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedStocks]);

  const addStock = (ticker: TickerV1) => {
    if (selectedStocks.length >= 5) return;

    // If this is the first stock, set the industry/sub-industry filter
    if (selectedStocks.length === 0) {
      setSelectedIndustry(ticker.industryKey);
      setSelectedSubIndustry(ticker.subIndustryKey);
    }

    if (!selectedStocks.includes(ticker.symbol)) {
      setSelectedStocks([...selectedStocks, ticker.symbol]);
    }
  };

  const removeStock = (tickerSymbol: string) => {
    setSelectedStocks(selectedStocks.filter((s) => s !== tickerSymbol));

    // If no stocks left, reset filters
    if (selectedStocks.length === 1) {
      setSelectedIndustry('');
      setSelectedSubIndustry('');
    }
  };

  const clearAllStocks = () => {
    setSelectedStocks([]);
    setSelectedIndustry('');
    setSelectedSubIndustry('');
  };

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-pretty mb-2">Stock Comparison</h1>
          <p>Compare up to 5 stocks within the same industry and analyze their performance across different categories.</p>
        </div>

        {/* Stock Selection Section */}
        <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Stocks for Comparison</h2>

          {/* Current Selections */}
          {selectedStocks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-mediums">Selected Stocks ({selectedStocks.length}/5)</h3>
                <button onClick={clearAllStocks} className="text-sm text-red-600 hover:text-red-800">
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedStocks.map((tickerSymbol) => {
                  const ticker = allTickers.find((t) => t.symbol === tickerSymbol);
                  return (
                    <div key={tickerSymbol} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {ticker?.name} ({tickerSymbol})
                      <button onClick={() => removeStock(tickerSymbol)} className="ml-2 hover:bg-blue-200 rounded-full p-0.5">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setSelectedSubIndustry('');
                  if (selectedStocks.length === 0) {
                    setSelectedStocks([]);
                  }
                }}
                className="w-full border border-gray-300 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Industries</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub-Industry</label>
              <select
                value={selectedSubIndustry}
                onChange={(e) => setSelectedSubIndustry(e.target.value)}
                disabled={!selectedIndustry}
                className="w-full border bg-gray-800 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800"
              >
                <option value="">All Sub-Industries</option>
                {SUB_INDUSTRY_OPTIONS.filter(
                  (option) => !selectedIndustry || allTickers.some((t) => t.industryKey === selectedIndustry && t.subIndustryKey === option.key)
                ).map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or symbol..."
                  className="w-full pl-10 border bg-gray-800 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Available Stocks */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Available Stocks {selectedIndustry && `(${INDUSTRY_MAPPINGS[selectedIndustry as keyof typeof INDUSTRY_MAPPINGS] || selectedIndustry})`}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto bg-gray-800">
              {filteredTickers
                .filter((ticker) => !selectedStocks.includes(ticker.symbol))
                .slice(0, 20)
                .map((ticker) => (
                  <button
                    key={ticker.symbol}
                    onClick={() => addStock(ticker)}
                    disabled={selectedStocks.length >= 5}
                    className="text-left p-3 border border-gray-200 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="font-medium">{ticker.name}</div>
                    <div className="text-sm">{ticker.symbol}</div>
                    <div className="text-xs mt-1">
                      {SUB_INDUSTRY_MAPPINGS[ticker.subIndustryKey as keyof typeof SUB_INDUSTRY_MAPPINGS] || ticker.subIndustryKey}
                    </div>
                  </button>
                ))}
            </div>
            {filteredTickers.length > 20 && <p className="text-sm text-gray-500 mt-2">Showing first 20 results. Use search to find specific stocks.</p>}
          </div>
        </div>

        {/* Comparison Section */}
        {selectedStocks.length > 0 && (
          <div className="space-y-8">
            {/* Category Selector */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Select Category for Detailed Comparison</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.entries(CATEGORY_MAPPINGS).map(([categoryKey, categoryName]) => (
                  <button
                    key={categoryKey}
                    onClick={() => setSelectedCategory(categoryKey as TickerAnalysisCategory)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedCategory === categoryKey
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-gray-200 bg-gray-800 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-sm">{categoryName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Results */}
            {loading ? (
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading comparison data...</span>
                </div>
              </div>
            ) : (
              comparisonData.length > 0 && (
                <div className="space-y-6">
                  {/* Summary Table */}
                  <div className="bg-gray-900 rounded-lg shadow-sm  overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">{CATEGORY_MAPPINGS[selectedCategory]} - Summary</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Pass</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Fail</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Score</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-200">
                          {comparisonData.map((stock) => {
                            const categoryData = stock.categoryResults[selectedCategory];
                            const score = categoryData.totalCount > 0 ? (categoryData.passCount / categoryData.totalCount) * 100 : 0;

                            return (
                              <tr key={stock.ticker} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-100">{stock.name}</div>
                                  <div className="text-sm text-gray-400">{stock.ticker}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900 text-green-200">
                                    {categoryData.passCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-900 text-red-200">
                                    {categoryData.failCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">{categoryData.totalCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      score >= 80 ? 'bg-green-900 text-green-200' : score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-900 text-red-200'
                                    }`}
                                  >
                                    {score.toFixed(0)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Factor Analysis */}
                  <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-100">{CATEGORY_MAPPINGS[selectedCategory]} - Detailed Analysis</h3>

                    <div className="space-y-8">
                      {comparisonData.map((stock) => (
                        <div key={stock.ticker} className="border-b border-gray-700 pb-6 last:border-b-0">
                          <h4 className="text-md font-medium text-gray-100 mb-4">
                            {stock.name} ({stock.ticker})
                          </h4>

                          {stock.categoryResults[selectedCategory].factorResults.length > 0 ? (
                            <div className="grid gap-4">
                              {stock.categoryResults[selectedCategory].factorResults.map((factor, index) => (
                                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {factor.result === 'Pass' ? (
                                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <XCircleIcon className="h-5 w-5 text-red-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="text-sm font-medium text-gray-100">{factor.factorTitle}</h5>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          factor.result === 'Pass' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                                        }`}
                                      >
                                        {factor.result}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{factor.oneLineExplanation}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No analysis data available for this category.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Empty State */}
        {selectedStocks.length === 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Start Comparing Stocks</h3>
              <p className="text-gray-500 mb-6">
                Select stocks from the same industry above to begin comparing their performance across different analysis categories.
              </p>
              <div className="text-sm text-gray-400">
                • Compare up to 5 stocks at once
                <br />
                • All stocks must be from the same industry
                <br />• Analyze performance across 5 key categories
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
