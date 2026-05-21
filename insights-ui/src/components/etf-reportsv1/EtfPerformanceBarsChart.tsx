'use client';

import { BarElement, CategoryScale, Chart as ChartJS, type ChartData, type ChartOptions, Legend, LinearScale, Tooltip } from 'chart.js';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ETF_PERFORMANCE_PERIODS, type EtfPerformanceMetric, type EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface EtfPerformanceBarsChartProps {
  data: EtfPerformanceMetricsPayload;
  etfSymbol: string;
}

const METRIC_LABELS: Record<EtfPerformanceMetric, string> = {
  return: 'Returns',
  cagr: 'CAGR',
};

const ETF_COLOR = '#10b981';
const CATEGORY_COLOR = '#7f78ff';

function formatPct(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function EtfPerformanceBarsChart({ data, etfSymbol }: EtfPerformanceBarsChartProps): JSX.Element | null {
  const [metric, setMetric] = useState<EtfPerformanceMetric>('return');

  const series = metric === 'return' ? data.returns : data.cagr;

  // Hide individual periods where the focal ETF has no value — even if the
  // category average has one, a bare category bar is misleading.
  const visible = useMemo(() => series.values.filter((v) => v.etf !== null), [series]);

  const hasCategoryAverage = useMemo(() => visible.some((v) => v.categoryAverage !== null), [visible]);

  // If neither tab has any ETF data, suppress the whole section. Computed
  // across both metrics so toggling the tab doesn't flash an empty chart.
  const anyData = data.returns.values.some((v) => v.etf !== null) || data.cagr.values.some((v) => v.etf !== null);
  if (!anyData) return null;

  const labels = visible.map((v) => {
    const period = ETF_PERFORMANCE_PERIODS.find((p) => p.key === v.periodKey);
    return period ? period.label : v.periodKey;
  });

  const datasets: ChartData<'bar'>['datasets'] = [
    {
      label: etfSymbol,
      data: visible.map((v) => v.etf),
      backgroundColor: ETF_COLOR,
      borderColor: ETF_COLOR,
      borderWidth: 0,
      borderRadius: 4,
      categoryPercentage: 0.7,
      barPercentage: 0.9,
    },
  ];

  if (hasCategoryAverage) {
    datasets.push({
      label: 'Category Average',
      data: visible.map((v) => v.categoryAverage),
      backgroundColor: CATEGORY_COLOR,
      borderColor: CATEGORY_COLOR,
      borderWidth: 0,
      borderRadius: 4,
      categoryPercentage: 0.7,
      barPercentage: 0.9,
    });
  }

  const chartData: ChartData<'bar'> = { labels, datasets };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: hasCategoryAverage,
        position: 'top',
        align: 'end',
        labels: {
          color: '#d1d5db',
          font: { size: 11 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (item) => `${item.dataset.label}: ${formatPct(item.raw as number | null)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
        },
      },
      y: {
        grid: { color: 'rgba(55, 65, 81, 0.5)' },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value) => (typeof value === 'number' ? `${value}%` : value),
        },
      },
    },
  };

  const metaPieces = [data.category ? `Category: ${data.category}` : null, hasCategoryAverage ? `${data.categoryPeerCount} peers` : null].filter(
    (s): s is string => !!s
  );

  return (
    <section id="etf-performance-bars-chart" className="bg-gray-900 rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-h-[44px]">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Returns &amp; CAGR</h3>
          {metaPieces.length > 0 && <p className="text-xs text-gray-400 mt-1">{metaPieces.join(' • ')}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['return', 'cagr'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                metric === m ? 'text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
              }`}
              style={metric === m ? { backgroundColor: ETF_COLOR } : {}}
            >
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72">
        {visible.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">No {METRIC_LABELS[metric]} data available for this ETF.</div>
        )}
      </div>
    </section>
  );
}
