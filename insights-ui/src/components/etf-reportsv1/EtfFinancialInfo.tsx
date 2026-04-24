import { EtfFinancialInfoResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/financial-info/route';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import { formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';
import { formatCompactAmount, formatCompactMillions } from '@/utils/etf-display-format-utils';

interface EtfFinancialInfoProps {
  data: EtfFinancialInfoResponse;
}

// Helper to format integer
function formatInteger(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toLocaleString('en-US');
}

export default function EtfFinancialInfo({ data }: EtfFinancialInfoProps): JSX.Element {
  // Check if we should show dividend info
  const hasDividends = data.dividendTtm !== null && data.dividendTtm !== 0;

  return (
    <section id="etf-financial-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <div className="grid grid-cols-2 gap-2">
        <FinancialCard label="AUM" value={formatCompactAmount(data.aum)} />
        <FinancialCard label="Expense Ratio" value={data.expenseRatio ? `${data.expenseRatio}%` : 'N/A'} />
        <FinancialCard label="P/E Ratio" value={formatNumber(data.pe)} />
        <FinancialCard label="Shares Outstanding" value={formatCompactMillions(data.sharesOut)} />
        <FinancialCard label="Dividend TTM" value={hasDividends ? `$${formatNumber(data.dividendTtm)}` : '--'} />
        <FinancialCard label="Dividend Yield" value={hasDividends ? formatPercentageDecimal(data.dividendYield) : '--'} />
        <FinancialCard label="Payout Frequency" value={data.payoutFrequency || 'N/A'} />
        <FinancialCard label="Payout Ratio" value={data.payoutRatio ? formatPercentageDecimal(data.payoutRatio) : 'N/A'} />
        <FinancialCard label="Volume" value={formatVolume(data.volume)} />
        <FinancialCard label="52 Week Range" value={`${formatNumber(data.yearLow)} - ${formatNumber(data.yearHigh)}`} />
        <FinancialCard label="Beta" value={formatNumber(data.beta)} />
        <FinancialCard label="Holdings" value={formatInteger(data.holdings)} />
      </div>
    </section>
  );
}
