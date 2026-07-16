'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo, useState } from 'react';
import { PriceHistoryResponse, PriceRangeKey } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { usePageTheme } from '@/components/theme/page-theme-context';
import { chartAxisTheme } from '@/util/chart-theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceChartProps {
  data: PriceHistoryResponse;
  /**
   * Render without the outer `<section>` wrapper and title — used when this
   * chart is hosted inside another tabbed container (e.g. the ETF detail
   * page's combined Price / Returns / CAGR section).
   */
  embedded?: boolean;
  /**
   * Controlled range. When provided, the chart reflects this range instead of
   * its internal state — used by the embedded host that renders the range
   * buttons itself in a different layout slot.
   */
  range?: PriceRangeKey;
  /**
   * Skip rendering the range button row. Pair with `range` when the host owns
   * the button UI; the line chart still updates because `range` is honored.
   */
  hideRangeButtons?: boolean;
}

export const PRICE_CHART_RANGES: ReadonlyArray<PriceRangeKey> = ['1M', '6M', '1Y', '3Y', '5Y'] as const;

// 1M and 6M use daily points; 1Y / 3Y / 5Y use weekly points.
const DAILY_RANGES: ReadonlySet<PriceRangeKey> = new Set(['1M', '6M']);

const LINE_COLOR = { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' };

function filterByRange(points: PriceHistoryPoint[], range: PriceRangeKey): PriceHistoryPoint[] {
  if (points.length === 0) return points;

  const cutoff = new Date();
  switch (range) {
    case '1M':
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    case '6M':
      cutoff.setMonth(cutoff.getMonth() - 6);
      break;
    case '1Y':
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    case '3Y':
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      break;
    case '5Y':
      cutoff.setFullYear(cutoff.getFullYear() - 5);
      break;
  }
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  return points.filter((p) => p.date >= cutoffIso);
}

function formatDateLabel(isoDate: string, range: PriceRangeKey): string {
  const d = new Date(isoDate);
  if (range === '1M') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (range === '6M' || range === '1Y') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatPrice(value: number | null, currency: string | null): string {
  if (value === null) return 'N/A';
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${formatted} ${currency}` : formatted;
}

export default function PriceChart({ data, embedded = false, range, hideRangeButtons = false }: PriceChartProps) {
  const [internalRange, setInternalRange] = useState<PriceRangeKey>('5Y');
  const selectedRange = range ?? internalRange;
  const setSelectedRange = (next: PriceRangeKey) => {
    // Only update internal state when uncontrolled — callers that pass
    // `range` are expected to handle changes via their own state.
    if (range === undefined) setInternalRange(next);
  };

  const series = useMemo(() => {
    const source = DAILY_RANGES.has(selectedRange) ? data.daily : data.weekly;
    return filterByRange(source, selectedRange);
  }, [data, selectedRange]);

  const axis = chartAxisTheme(usePageTheme());

  const chartData: ChartData<'line'> = {
    labels: series.map((p) => formatDateLabel(p.date, selectedRange)),
    datasets: [
      {
        label: 'Close',
        data: series.map((p) => p.close),
        borderColor: LINE_COLOR.border,
        backgroundColor: LINE_COLOR.background,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: LINE_COLOR.border,
        pointBorderColor: '#1f2937',
        pointBorderWidth: 2,
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => `Close: ${formatPrice(item.raw as number | null, data.currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: axis.grid },
        ticks: {
          color: axis.tick,
          font: { size: 11 },
          maxTicksLimit: 8,
          autoSkip: true,
        },
      },
      y: {
        grid: { color: axis.grid },
        ticks: {
          color: axis.tick,
          font: { size: 11 },
          callback: (value) => (typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value),
        },
      },
    },
  };

  const hasData = series.length > 0;
  const intervalNote = DAILY_RANGES.has(selectedRange) ? 'daily' : 'weekly';
  const metaLine = [data.currency, intervalNote].filter(Boolean).join(' • ');

  const rangeButtons = (
    <div className="flex flex-wrap gap-2">
      {PRICE_CHART_RANGES.map((r) => (
        <button
          key={r}
          onClick={() => setSelectedRange(r)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedRange === r ? 'text-heading' : 'bg-surface-2 text-body hover:bg-surface-3 hover:text-heading'
          }`}
          style={selectedRange === r ? { backgroundColor: LINE_COLOR.border } : {}}
        >
          {r}
        </button>
      ))}
    </div>
  );

  const chartBody = (
    <div className="h-64 sm:h-72">
      {hasData ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-sm text-muted">No price data available for this range.</div>
      )}
    </div>
  );

  if (embedded) {
    // Caller (e.g. EtfChartTabs) owns the section wrapper, title, and tab
    // strip. When `hideRangeButtons` is set the host also owns the range
    // buttons, so we render only the chart body.
    return hideRangeButtons ? (
      chartBody
    ) : (
      <div>
        <div className="flex justify-end mb-3">{rangeButtons}</div>
        {chartBody}
      </div>
    );
  }

  return (
    <section id="price-chart" className="bg-surface rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      {/* min-h locks the header height so swapping the lazy skeleton with the rendered chart causes no layout shift. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-h-[44px]">
        <div>
          <h3 className="text-lg font-semibold text-heading">Price History</h3>
          {metaLine && <p className="text-xs text-muted mt-1">{metaLine}</p>}
        </div>
        {rangeButtons}
      </div>
      {chartBody}
    </section>
  );
}
