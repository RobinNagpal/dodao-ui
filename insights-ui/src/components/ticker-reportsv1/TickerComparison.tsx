// Removed unused imports
import { CATEGORY_MAPPINGS, EvaluationResult, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { getScoreColorClasses } from '@/utils/score-utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// Define strict types for the component
export interface ComparisonTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry?: {
    finalScore: number;
  } | null;
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
    <div className="bg-surface rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-border">
          {/* Header */}
          <div className="bg-surface-2 grid" style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${comparisonTickers.length}, minmax(130px, 1fr))` }}>
            <div className="px-2 py-3 text-left text-xs font-medium text-body uppercase tracking-wider sticky left-0 bg-surface-2">Factors</div>
            {comparisonTickers.map((ticker) => (
              <div key={ticker.symbol} className="px-1 py-3 text-left text-xs font-medium text-body tracking-wider">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1">
                    {ticker.cachedScoreEntry?.finalScore !== undefined ? (
                      <span className={getScoreColorClasses(ticker.cachedScoreEntry.finalScore).textColorClass}>{ticker.cachedScoreEntry.finalScore}/25</span>
                    ) : (
                      <span className="text-muted">-/25</span>
                    )}
                    <span className="ml-1 font-bold">{ticker.symbol}</span>
                    <button
                      onClick={() => removeTicker(ticker.symbol)}
                      className="text-muted hover:text-red-400 flex-shrink-0"
                      disabled={comparisonTickers.length === 1}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-muted truncate">{ticker.name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="bg-surface divide-y divide-border">
            {getCategoryFactorRows().map((row, rowIndex) => (
              <div
                key={`${row.category}-${row.factorIndex}`}
                className={`grid ${row.isCategoryHeader ? 'bg-surface-2' : 'hover:bg-surface-3'}`}
                style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${comparisonTickers.length}, minmax(130px, 1fr))` }}
              >
                <div className={`px-2 py-3 sticky left-0 text-left min-w-0 bg-surface`}>
                  {row.isCategoryHeader ? (
                    <div className="font-bold text-heading text-base">{row.categoryName}</div>
                  ) : (
                    <div className="text-body text-sm leading-tight pl-4 break-words overflow-wrap-anywhere">{row.factorTitle}</div>
                  )}
                </div>
                {comparisonTickers.map((ticker) => {
                  if (row.isCategoryHeader) {
                    return (
                      <div key={`${ticker.symbol}-header`} className="px-1 py-3 text-left" style={{ backgroundColor: 'var(--surface-2)' }}>
                        <span className="text-muted text-sm">-</span>
                      </div>
                    );
                  }

                  const factorResult = getFactorResult(ticker, row.category, row.factorIndex);

                  return (
                    <div key={`${ticker.symbol}-${row.category}-${row.factorIndex}`} className="px-1 py-3 text-left">
                      {factorResult.result ? (
                        <div className="flex flex-col items-start space-y-1">
                          <div className="flex items-center space-x-1">
                            {factorResult.result === EvaluationResult.Pass ? (
                              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className={`text-xs font-medium ${factorResult.result === EvaluationResult.Pass ? 'text-green-400' : 'text-red-400'}`}>
                              {factorResult.result}
                            </span>
                          </div>
                          <div className="text-xs text-muted leading-tight break-words">{factorResult.explanation}</div>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">-</span>
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
