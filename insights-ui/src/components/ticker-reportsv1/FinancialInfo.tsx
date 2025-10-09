import { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';

type Num = number | null;

interface FinancialInfoProps {
  data: FinancialInfoResponse;
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

// Helper to format percentage (for values that are already in decimal form)
function formatPercentage(value: Num): string {
  if (value === null) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

// Helper to format percentage from decimal (Yahoo Finance already gives percentage as decimal)
function formatPercentageDecimal(value: Num): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Helper to format currency
function formatCurrency(value: Num, currency: string | null): string {
  if (value === null) return 'N/A';
  const currencySymbol = currency === 'USD' ? '$' : currency ? `${currency} ` : '';
  return `${currencySymbol}${formatNumber(value)}`;
}

export default function FinancialInfo({ data }: FinancialInfoProps): JSX.Element {
  // Check if we should show dividend info
  const hasDividends = data.annualDividend !== null && data.annualDividend !== 0;

  return (
    <section id="financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {/* Row 1: Price & Performance Metrics */}
        {/* Current Price */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Current Price</div>
          <div className="text-xs font-semibold">{formatCurrency(data.price, data.currency)}</div>
        </div>

        {/* 52 Week Range */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">52 Week Range</div>
          <div className="text-xs">
            {formatCurrency(data.yearLow, data.currency)} - {formatCurrency(data.yearHigh, data.currency)}
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Market Cap</div>
          <div className="text-xs font-semibold">{formatInMillions(data.marketCap)}</div>
        </div>

        {/* EPS (Diluted TTM) */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">EPS (Diluted TTM)</div>
          <div className="text-xs font-semibold">{formatCurrency(data.epsDilutedTTM, data.currency)}</div>
        </div>

        {/* P/E Ratio */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">P/E Ratio</div>
          <div className="text-xs font-semibold">{formatNumber(data.pe)}</div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Net Profit Margin</div>
          <div className="text-xs font-semibold">{formatPercentage(data.netProfitMargin)}</div>
        </div>

        {/* Row 2: Volume & Income Metrics */}
        {/* Avg Volume (3M) */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Avg Volume (3M)</div>
          <div className="text-xs font-semibold">{formatInMillions(data.avgVolume3M)}</div>
        </div>

        {/* Day Volume */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Day Volume</div>
          <div className="text-xs font-semibold">{formatInMillions(data.dayVolume)}</div>
        </div>

        {/* Total Revenue (TTM) */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Total Revenue (TTM)</div>
          <div className="text-xs font-semibold">{formatInMillions(data.totalRevenue)}</div>
        </div>

        {/* Net Income (TTM) */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Net Income (TTM)</div>
          <div className="text-xs font-semibold">{formatInMillions(data.netIncome)}</div>
        </div>

        {/* Annual Dividend */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Annual Dividend</div>
          <div className="text-xs font-semibold">{hasDividends ? formatCurrency(data.annualDividend, data.currency) : '--'}</div>
        </div>

        {/* Dividend Yield */}
        <div className="bg-gray-800 px-2 py-1 sm:p-2 rounded-md">
          <div className="text-xs text-gray-400 mb-1">Dividend Yield</div>
          <div className="text-xs font-semibold">{hasDividends ? formatPercentageDecimal(data.dividendYield) : '--'}</div>
        </div>
      </div>
    </section>
  );
}
