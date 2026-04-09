import { EtfFinancialInfoResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/financial-info/route';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';
import { formatNumber, formatPercentageDecimal, formatVolume } from '@/components/reportsv1/financialFormatters';

interface EtfFinancialInfoProps {
  data: EtfFinancialInfoResponse;
}

function parseNumericString(value: string | null): number | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  // Supports values like:
  // - "$47.46B", "257.25M", "1.60M", "259,668"
  // Keep parsing tolerant because we store "display strings" in DB.
  const cleaned = raw.replace(/,/g, '').replace(/^\$/, '').trim();
  const match = cleaned.match(/^([+-]?\d+(?:\.\d+)?)\s*([KMBT])?$/i);
  if (!match) return null;

  const num = Number(match[1]);
  if (!Number.isFinite(num)) return null;

  const suffix = (match[2] || '').toUpperCase();
  const mult = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : suffix === 'T' ? 1_000_000_000_000 : 1;
  return num * mult;
}

function formatCompactAmount(value: string | null): string {
  const n = parseNumericString(value);
  if (n === null) return 'N/A';
  const prefix = (value ?? '').trim().startsWith('$') ? '$' : '';
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(2)}K`;
  return `${prefix}${n.toFixed(2)}`;
}

function formatCompactMillions(value: string | null): string {
  const n = parseNumericString(value);
  if (n === null) return 'N/A';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return `${n.toFixed(2)}`;
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
