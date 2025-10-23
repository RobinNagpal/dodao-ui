// Removed unused imports
import { CATEGORY_MAPPINGS, TickerAnalysisCategory, EvaluationResult } from '@/lib/mappingsV1';
import { getScoreColorClasses } from '@/utils/score-utils';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define strict types for the component
export interface ComparisonTicker {
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

export interface TickerComparisonProps {
  comparisonTickers: ComparisonTicker[];
  removeTicker: (symbol: string) => void;
  isModal?: boolean;
}

export interface CategoryFactorRow {
  category: TickerAnalysisCategory;
  categoryName: string;
  factorIndex: number;
  factorTitle: string;
  isCategoryHeader: boolean;
}

export interface FactorResult {
  result: 'Pass' | 'Fail' | null;
  explanation: string;
}

export function TickerComparison({ comparisonTickers, removeTicker, isModal = false }: TickerComparisonProps) {
  const getCategoryFactorRows = (): CategoryFactorRow[] => {
    const rows: CategoryFactorRow[] = [];

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

  const getFactorResult = (ticker: ComparisonTicker, category: TickerAnalysisCategory, factorIndex: number): FactorResult => {
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

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-700">
          {/* Header */}
          <div className="bg-gray-800 grid" style={{ gridTemplateColumns: `minmax(300px, 1fr) repeat(${comparisonTickers.length}, minmax(200px, 1fr))` }}>
            <div className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800">Comparison Factors</div>
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
                            {factorResult.result === EvaluationResult.Pass ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className={`text-xs font-medium ${factorResult.result === EvaluationResult.Pass ? 'text-green-400' : 'text-red-400'}`}>
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
  );
}

export default TickerComparison;
