'use client';

import { use } from 'react';

type Num = number | null;

export interface FinancialInfoResponse {
  symbol: string;
  currency: string | null;
  price: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  marketCap: Num;
  epsDilutedTTM: Num;
  pe: Num;
  avgVolume3M: Num;
  dayVolume: Num;
  annualDividend: Num;
  dividendYield: Num;
  totalRevenue: Num;
  netIncome: Num;
  netProfitMargin: Num;
}

interface FinancialInfoProps {
  dataPromise: Promise<FinancialInfoResponse>;
}

// Helper to format numbers in millions
function formatInMillions(value: Num): string {
  if (value === null) return 'N/A';
  const millions = value / 1_000_000;
  return `${millions.toFixed(2)}M`;
}

// Helper to format regular numbers with commas
function formatNumber(value: Num, decimals: number = 2): string {
  if (value === null) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Helper to format percentage
function formatPercentage(value: Num): string {
  if (value === null) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

// Helper to format currency
function formatCurrency(value: Num, currency: string | null): string {
  if (value === null) return 'N/A';
  const currencySymbol = currency === 'USD' ? '$' : currency ? `${currency} ` : '';
  return `${currencySymbol}${formatNumber(value)}`;
}

export default function FinancialInfo({ dataPromise }: FinancialInfoProps): JSX.Element {
  const data = use(dataPromise);

  // Check if we should show dividend info
  const hasDividends = data.annualDividend !== null && data.annualDividend !== 0;

  return (
    <section id="financial-info" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Key Financial Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Price & Market Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Price & Market</h3>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-lg font-semibold">{formatCurrency(data.price, data.currency)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Day Range</div>
            <div className="text-base">
              {formatCurrency(data.dayLow, data.currency)} - {formatCurrency(data.dayHigh, data.currency)}
            </div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">52 Week Range</div>
            <div className="text-base">
              {formatCurrency(data.yearLow, data.currency)} - {formatCurrency(data.yearHigh, data.currency)}
            </div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Market Cap</div>
            <div className="text-lg font-semibold">{formatCurrency(data.marketCap, data.currency)}</div>
          </div>
        </div>

        {/* Column 2: Performance Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Performance</h3>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">EPS (Diluted TTM)</div>
            <div className="text-lg font-semibold">{formatCurrency(data.epsDilutedTTM, data.currency)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">P/E Ratio</div>
            <div className="text-lg font-semibold">{formatNumber(data.pe)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Net Profit Margin</div>
            <div className="text-lg font-semibold">{formatPercentage(data.netProfitMargin)}</div>
          </div>

          {hasDividends && (
            <>
              <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
                <div className="text-sm text-gray-400 mb-1">Annual Dividend</div>
                <div className="text-lg font-semibold">{formatCurrency(data.annualDividend, data.currency)}</div>
              </div>

              <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
                <div className="text-sm text-gray-400 mb-1">Dividend Yield</div>
                <div className="text-lg font-semibold">{formatPercentage(data.dividendYield)}</div>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Volume & Revenue */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Volume & Revenue</h3>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Avg Volume (3M)</div>
            <div className="text-lg font-semibold">{formatInMillions(data.avgVolume3M)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Day Volume</div>
            <div className="text-lg font-semibold">{formatInMillions(data.dayVolume)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Total Revenue (TTM)</div>
            <div className="text-lg font-semibold">{formatInMillions(data.totalRevenue)}</div>
          </div>

          <div className="bg-gray-800 px-3 py-3 sm:p-4 rounded-md">
            <div className="text-sm text-gray-400 mb-1">Net Income (TTM)</div>
            <div className="text-lg font-semibold">{formatInMillions(data.netIncome)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
