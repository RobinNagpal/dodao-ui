import { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import { formatCurrency, formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';

interface FinancialInfoProps {
  data: FinancialInfoResponse;
}

interface FinancialCardProps {
  label: string;
  value?: string;
  isLoading?: boolean;
}

export function FinancialCard({ label, value, isLoading = false }: FinancialCardProps): JSX.Element {
  return (
    <div className="bg-gray-800 px-2 py-1 rounded-md">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {isLoading ? <div className="rounded animate-pulse">--</div> : <div className="text-xs font-semibold">{value}</div>}
    </div>
  );
}

export default function FinancialInfo({ data }: FinancialInfoProps): JSX.Element {
  // Check if we should show dividend info
  const hasDividends = data.annualDividend !== null && data.annualDividend !== 0;

  return (
    <section id="financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-2 gap-2">
        <FinancialCard label="Current Price" value={formatCurrency(data.price, data.currency)} />
        <FinancialCard label="52 Week Range" value={`${formatCurrency(data.yearLow, data.currency)} - ${formatCurrency(data.yearHigh, data.currency)}`} />
        <FinancialCard label="Market Cap" value={data.marketCap || 'N/A'} />
        <FinancialCard label="EPS (Diluted TTM)" value={formatCurrency(data.epsDilutedTTM, data.currency)} />
        <FinancialCard label="P/E Ratio" value={formatNumber(data.pe)} />
        <FinancialCard label="Forward P/E" value={formatNumber(data.forwardPE)} />
        <FinancialCard label="Beta" value={formatNumber(data.beta)} />
        <FinancialCard label="Day Volume" value={formatVolume(data.dayVolume)} />
        <FinancialCard label="Total Revenue (TTM)" value={data.totalRevenue || 'N/A'} />
        <FinancialCard label="Net Income (TTM)" value={data.netIncome || 'N/A'} />
        <FinancialCard label="Annual Dividend" value={hasDividends ? formatCurrency(data.annualDividend, data.currency) : '--'} />
        <FinancialCard label="Dividend Yield" value={hasDividends ? formatPercentageDecimal(data.dividendYield) : '--'} />
      </div>
    </section>
  );
}
