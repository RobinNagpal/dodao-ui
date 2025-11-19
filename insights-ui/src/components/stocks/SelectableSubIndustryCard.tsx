import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { BasicTickerInfo } from '@/types/ticker-typesv1';
import StockTickerItem from './StockTickerItem';

interface SelectableSubIndustryCardProps {
  subIndustry: string;
  tickers: BasicTickerInfo[] | any[];
  subIndustryName?: string;
  total: number;
  // Selection props
  selectedTickerIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onMoveClick?: () => void;
  // Optional: disable selection
  selectionMode?: boolean;
}

export default function SelectableSubIndustryCard({
  subIndustry,
  subIndustryName,
  tickers,
  total,
  selectedTickerIds = [],
  onSelectionChange,
  onMoveClick,
  selectionMode = false,
}: SelectableSubIndustryCardProps) {
  const displayName = subIndustryName || subIndustry;
  const companyLabel = `${total.toLocaleString()} ${total === 1 ? 'company' : 'companies'}`;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedTickerIds.length === tickers.length) {
      // If all selected, unselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(tickers.map((t) => t.id));
    }
  };

  const handleTickerSelection = (tickerIds: string[]) => {
    if (!onSelectionChange) return;
    onSelectionChange(tickerIds);
  };

  const allSelected = selectedTickerIds.length === tickers.length && tickers.length > 0;
  const someSelected = selectedTickerIds.length > 0 && selectedTickerIds.length < tickers.length;

  return (
    <div className="relative bg-block-bg-color rounded-lg border border-color overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`px-3 py-2 sm:px-4 border-b border-color bg-[#374151]`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold heading-color leading-snug break-words ${selectionMode ? 'pr-8' : 'pr-28'}`} title={displayName}>
            {displayName}
          </h3>
          {selectionMode && tickers.length > 0 && (
            <div className="flex items-center gap-1 mr-24">
              <Button size="sm" variant="outlined" onClick={handleSelectAll} className="text-xs px-2 py-1">
                {allSelected ? 'Unselect' : 'Select All'}
              </Button>
              {selectedTickerIds.length > 0 && onMoveClick && (
                <Button size="sm" onClick={onMoveClick} className="text-xs px-2 py-1">
                  Move ({selectedTickerIds.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Company count badge */}
      <div className="absolute top-2 right-2 z-10 text-[13px] text-white bg-[#4F46E5] px-2 py-0.5 rounded-full" aria-label={companyLabel} title={companyLabel}>
        {companyLabel}
      </div>

      {/* Selection summary (when in selection mode) */}
      {selectionMode && (
        <div className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-color">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {selectedTickerIds.length === 0 && 'No tickers selected'}
              {selectedTickerIds.length > 0 && `${selectedTickerIds.length} of ${tickers.length} selected`}
            </span>
            {someSelected && <span className="text-blue-600 dark:text-blue-400 font-medium">Partial Selection</span>}
            {allSelected && <span className="text-green-600 dark:text-green-400 font-medium">All Selected</span>}
          </div>
        </div>
      )}

      {/* Ticker List */}
      <div className="flex-1">
        {!selectionMode ? (
          // Regular display mode (original behavior)
          <ul className="divide-y divide-color">
            {tickers.map((ticker) => (
              <li key={`${ticker.exchange}-${ticker.symbol}`} className="px-3 sm:px-4 py-1.5 hover:bg-[#2D3748] transition-colors">
                <div className="min-w-0 w-full">
                  <StockTickerItem symbol={ticker.symbol} name={ticker.name} exchange={ticker.exchange} score={ticker.cachedScoreEntry?.finalScore ?? 0} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          // Selection mode
          <div className="p-3 sm:p-4">
            <Checkboxes
              items={tickers.map(
                (ticker): CheckboxItem => ({
                  id: ticker.id,
                  name: `ticker-${ticker.id}`,
                  label: (
                    <div className="flex-grow cursor-pointer ml-2">
                      <StockTickerItem symbol={ticker.symbol} name={ticker.name} exchange={ticker.exchange} score={ticker.cachedScoreEntry?.finalScore ?? 0} />
                    </div>
                  ),
                })
              )}
              selectedItemIds={selectedTickerIds}
              onChange={handleTickerSelection}
            />
          </div>
        )}
      </div>

      {tickers.length === 0 && <div className="px-3 sm:px-4 py-8 text-center text-gray-500 dark:text-gray-400">No tickers found for this sub-industry.</div>}
    </div>
  );
}
