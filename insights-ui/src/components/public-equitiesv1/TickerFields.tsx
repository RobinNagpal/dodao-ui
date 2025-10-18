import * as React from 'react';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { exchangeItems, toExchangeId } from '@/utils/exchangeUtils';
import type { TickerFieldsValue } from './types';

export type TickerFieldsLayout = 'grid' | 'vertical';

export interface TickerFieldsProps {
  /** Current value for the 4 core fields */
  value: TickerFieldsValue;
  /** Patch-style change handler; pass only the fields that changed */
  onPatch: (patch: Partial<TickerFieldsValue>) => void;
  /** Optional extra field(s) rendered after the core fields (e.g., stockAnalyzeUrl input) */
  renderAfter?: React.ReactNode;
  /** Optional inline validation/error text */
  inlineError?: string;
  /** Tailwind/extra className for the surrounding card block */
  className?: string;
  /**
   * Layout mode:
   * - "grid" (default): 1 col on mobile, `mdColumns` on md+
   * - "vertical": always single column (stacked) on all breakpoints
   */
  layout?: TickerFieldsLayout;
  /** Grid columns for medium+ screens (only used when layout === "grid") */
  mdColumns?: 4 | 5;
}

/**
 * Reusable, minimal field group for (Exchange, Company Name, Symbol, Website URL).
 * - Keeps Symbol uppercase
 * - Uses explicit types, no `any`
 */
export default function TickerFields({ value, onPatch, renderAfter, inlineError, className, layout = 'grid', mdColumns = 4 }: TickerFieldsProps): JSX.Element {
  // Avoid dynamic Tailwind class pitfalls by mapping explicitly
  const gridColsClass: 'md:grid-cols-4' | 'md:grid-cols-5' = mdColumns === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4';

  const containerInnerClass = layout === 'vertical' ? 'grid grid-cols-1 gap-4' : `grid grid-cols-1 ${gridColsClass} gap-4`;

  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className ?? ''}`}>
      <div className={containerInnerClass}>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Exchange</label>
          <StyledSelect
            label=""
            selectedItemId={value.exchange}
            items={exchangeItems}
            setSelectedItemId={(id?: string | null): void => {
              onPatch({ exchange: toExchangeId(id) });
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
          <input
            type="text"
            value={value.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onPatch({ name: e.target.value })}
            required
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g. Apple Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Symbol</label>
          <input
            type="text"
            value={value.symbol}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onPatch({ symbol: e.target.value.toUpperCase() })}
            required
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g. AAPL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website URL</label>
          <input
            type="url"
            value={value.websiteUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onPatch({ websiteUrl: e.target.value })}
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g. https://www.apple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock Analyze URL</label>
          <input
            type="url"
            value={value.stockAnalyzeUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onPatch({ stockAnalyzeUrl: e.target.value })}
            className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="e.g. https://stock-analyze.com/stocks/aapl"
          />
        </div>
      </div>

      {renderAfter}

      {inlineError && <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">⚠ {inlineError}</p>}
    </div>
  );
}
