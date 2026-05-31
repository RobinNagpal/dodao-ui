import type { EtfFinancialInfoResponse } from '@/types/etf/etf-detail-response-types';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import CardSection from '@/components/ui/CardSection';
import MetricGrid from '@/components/ui/MetricGrid';
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
    <CardSection id="etf-financial-info" padding="compact" mt="md">
      <MetricGrid columns="2" gap="sm">
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
      </MetricGrid>
    </CardSection>
  );
}
