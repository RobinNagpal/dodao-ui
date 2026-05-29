import type { EtfKeyMetricsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';
import { FinancialCard } from '@/components/ticker-reportsv1/FinancialInfo';

interface EtfKeyMetricsProps {
  metrics: EtfKeyMetricsResponse;
}

function formatRatio(value: number | null): string | undefined {
  return value === null ? undefined : value.toFixed(2);
}

function formatPercent(value: number | null): string | undefined {
  return value === null ? undefined : `${value.toFixed(1)}%`;
}

/**
 * Compact risk/return row shown under the financial-info + radar block. Renders
 * only when at least one figure exists; missing figures show as "—" so the grid
 * stays aligned. The expected-return cells carry the LLM's rationale as a hover
 * tooltip.
 */
export default function EtfKeyMetrics({ metrics }: EtfKeyMetricsProps): JSX.Element | null {
  const cells: Array<{ label: string; value: string | undefined; reason?: string | null }> = [
    { label: 'Sharpe Ratio', value: formatRatio(metrics.sharpe) },
    { label: 'Sortino Ratio', value: formatRatio(metrics.sortino) },
    { label: 'Beta (5Y)', value: formatRatio(metrics.beta5y) },
    { label: 'Max Drawdown', value: formatPercent(metrics.maxDrawdown) },
    { label: 'Exp. Return (1Y)', value: formatPercent(metrics.expectedNext1YrReturns), reason: metrics.expectedNext1YrReturnsReason },
    { label: 'Exp. Return (3Y)', value: formatPercent(metrics.expectedNext3YrReturns), reason: metrics.expectedNext3YrReturnsReason },
    { label: 'Exp. Return (5Y)', value: formatPercent(metrics.expectedNext5YrReturns), reason: metrics.expectedNext5YrReturnsReason },
  ];

  if (cells.every((c) => c.value === undefined)) return null;

  return (
    <section id="etf-key-metrics" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-1 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {cells.map((c) =>
          c.reason ? (
            <div key={c.label} className="group relative cursor-help">
              <FinancialCard label={c.label} value={c.value ?? '—'} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-64 max-w-[min(16rem,80vw)] -translate-x-1/2 rounded-md border border-color block-bg-color px-3 py-2 text-xs font-normal leading-snug text-color opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
              >
                {c.reason}
              </span>
            </div>
          ) : (
            <FinancialCard key={c.label} label={c.label} value={c.value ?? '—'} />
          )
        )}
      </div>
    </section>
  );
}
