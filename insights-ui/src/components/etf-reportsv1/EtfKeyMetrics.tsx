import type { EtfKeyMetricsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';

interface EtfKeyMetricsProps {
  metrics: EtfKeyMetricsResponse;
}

function formatRatio(value: number | null): string | undefined {
  return value === null ? undefined : value.toFixed(2);
}

function formatPercent(value: number | null): string | undefined {
  return value === null ? undefined : `${value.toFixed(1)}%`;
}

/** Green for positive returns, red for negative; neutral when absent. */
function returnValueClass(value: number | null): string {
  if (value === null) return 'text-gray-100';
  return value >= 0 ? 'text-green-400' : 'text-red-400';
}

function MetricCell({ label, value, valueClass = 'text-gray-100' }: { label: string; value: string | undefined; valueClass?: string }): JSX.Element {
  return (
    <div className="bg-gray-800 px-2 py-1.5 rounded-md">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value ?? '—'}</div>
    </div>
  );
}

/**
 * Risk/return figures + expected-return rationale, shown inside the Future
 * Performance Outlook card. Renders nothing when no figure exists. The expected
 * returns (and their reasons) come from the future report's EtfFutureReturns row.
 */
export default function EtfKeyMetrics({ metrics }: EtfKeyMetricsProps): JSX.Element | null {
  const figures: Array<{ label: string; value: string | undefined; valueClass?: string }> = [
    { label: 'Sharpe Ratio', value: formatRatio(metrics.sharpe) },
    { label: 'Sortino Ratio', value: formatRatio(metrics.sortino) },
    { label: 'Beta (5Y)', value: formatRatio(metrics.beta5y) },
    { label: 'Max Drawdown', value: formatPercent(metrics.maxDrawdown), valueClass: returnValueClass(metrics.maxDrawdown) },
    { label: 'Exp. Return (1Y)', value: formatPercent(metrics.expectedNext1YrReturns), valueClass: returnValueClass(metrics.expectedNext1YrReturns) },
    { label: 'Exp. Return (3Y)', value: formatPercent(metrics.expectedNext3YrReturns), valueClass: returnValueClass(metrics.expectedNext3YrReturns) },
    { label: 'Exp. Return (5Y)', value: formatPercent(metrics.expectedNext5YrReturns), valueClass: returnValueClass(metrics.expectedNext5YrReturns) },
  ];

  const reasons: Array<{ label: string; reason: string }> = [
    { label: '1-Year', reason: metrics.expectedNext1YrReturnsReason ?? '' },
    { label: '3-Year', reason: metrics.expectedNext3YrReturnsReason ?? '' },
    { label: '5-Year', reason: metrics.expectedNext5YrReturnsReason ?? '' },
  ].filter((r) => r.reason.trim().length > 0);

  if (figures.every((f) => f.value === undefined) && reasons.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {figures.map((f) => (
          <MetricCell key={f.label} label={f.label} value={f.value} valueClass={f.valueClass} />
        ))}
      </div>

      {reasons.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-semibold text-gray-200">Why these expected returns</h4>
          {reasons.map((r) => (
            <div key={r.label} className="bg-gray-800 rounded-md px-3 py-2">
              <p className="text-xs leading-snug text-gray-400">
                <span className="font-semibold text-gray-300">{r.label}</span> - {r.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
