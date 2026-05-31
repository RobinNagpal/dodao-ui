import { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import { formatCurrency, formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';
import CardSection from '@/components/ui/CardSection';
import MetricCell from '@/components/ui/MetricCell';
import MetricGrid from '@/components/ui/MetricGrid';

interface FinancialInfoProps {
  data: FinancialInfoResponse;
}

interface FinancialCardProps {
  label: string;
  value?: string;
  isLoading?: boolean;
}

export function FinancialCard({ label, value, isLoading = false }: FinancialCardProps): JSX.Element {
  return <MetricCell label={label} value={value} loading={isLoading} size="xs" />;
}

export default function FinancialInfo({ data }: FinancialInfoProps): JSX.Element {
  // Check if we should show dividend info
  const hasDividends = data.annualDividend !== null && data.annualDividend !== 0;

  return (
    <CardSection id="financial-info" padding="compact" mt="md">
      <MetricGrid columns="2" gap="sm">
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
      </MetricGrid>
    </CardSection>
  );
}
