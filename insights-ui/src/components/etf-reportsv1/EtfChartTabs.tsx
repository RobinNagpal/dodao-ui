'use client';

import type { PriceHistoryResponse, PriceRangeKey } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import PriceChart, { PRICE_CHART_RANGES } from '@/components/ticker-reportsv1/PriceChart';
import { BarElement, CategoryScale, Chart as ChartJS, type ChartData, type ChartOptions, Legend, LinearScale, Tooltip } from 'chart.js';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ETF_PERFORMANCE_PERIODS, type EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ChartTabKey = 'price' | 'return' | 'cagr';

interface EtfChartTabsProps {
  priceHistory: PriceHistoryResponse | null;
  performanceMetrics: EtfPerformanceMetricsPayload | null;
  etfSymbol: string;
}

const TAB_LABELS: Record<ChartTabKey, string> = {
  price: 'Price',
  return: 'Returns',
  cagr: 'CAGR',
};

// Per-tab heading shown on the left of the header row. Price reuses the
// standalone PriceChart's familiar "Price History" label so users moving
// between standalone (stocks) and embedded (ETFs) chart UIs don't have to
// re-learn it.
const TAB_HEADINGS: Record<ChartTabKey, string> = {
  price: 'Price History',
  return: 'Returns',
  cagr: 'CAGR',
};

const ACCENT_COLOR = '#10b981';
const CATEGORY_COLOR = '#7f78ff';

function formatPct(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function EtfChartTabs({ priceHistory, performanceMetrics, etfSymbol }: EtfChartTabsProps): JSX.Element | null {
  const hasReturnsData = useMemo(() => !!performanceMetrics?.returns.values.some((v) => v.etf !== null), [performanceMetrics]);
  const hasCagrData = useMemo(() => !!performanceMetrics?.cagr.values.some((v) => v.etf !== null), [performanceMetrics]);
  const hasPriceData = !!priceHistory;

  const availableTabs: ChartTabKey[] = [];
  if (hasPriceData) availableTabs.push('price');
  if (hasReturnsData) availableTabs.push('return');
  if (hasCagrData) availableTabs.push('cagr');

  const [activeTab, setActiveTab] = useState<ChartTabKey>(availableTabs[0] ?? 'price');
  // Range state lives here (not inside PriceChart) so the range pill can sit
  // in the section header row alongside the main tabs.
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('5Y');

  if (availableTabs.length === 0) return null;

  const safeTab: ChartTabKey = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  // Meta line shown under the heading. Drop the daily/weekly hint that the
  // standalone chart shows — it adds vertical noise and the user can infer
  // the cadence from the time-axis labels.
  const metaLine: string | null =
    safeTab === 'price'
      ? priceHistory?.currency ?? null
      : performanceMetrics?.category
      ? `Category: ${performanceMetrics.category}${performanceMetrics.categoryPeerCount > 0 ? ` • ${performanceMetrics.categoryPeerCount} peers` : ''}`
      : null;

  return (
    <section id="etf-chart-tabs" className="bg-gray-900 rounded-lg shadow-sm px-2 py-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="sm:flex-shrink-0 min-w-0">
          <h3 className="text-lg font-semibold text-gray-100">{TAB_HEADINGS[safeTab]}</h3>
          {metaLine && <p className="text-xs text-gray-400 mt-1 truncate">{metaLine}</p>}
        </div>

        {/* Center: range pill (Price tab only). Sits in its own segmented-
           control container so it reads as a sub-control belonging to Price,
           distinct from the main Price/Returns/CAGR tabs on the right. */}
        {safeTab === 'price' && (
          <div className="sm:flex-1 flex sm:justify-center">
            <div className="inline-flex items-center gap-1 rounded-lg bg-gray-800/70 p-1 ring-1 ring-gray-700/70">
              {PRICE_CHART_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPriceRange(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    priceRange === r ? 'text-white' : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                  }`}
                  style={priceRange === r ? { backgroundColor: ACCENT_COLOR } : {}}
                  aria-pressed={priceRange === r}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                safeTab === tab ? 'text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
              }`}
              style={safeTab === tab ? { backgroundColor: ACCENT_COLOR } : {}}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {safeTab === 'price' && priceHistory && <PriceChart data={priceHistory} embedded range={priceRange} hideRangeButtons />}
      {safeTab === 'return' && performanceMetrics && <PerformanceBars series={performanceMetrics.returns.values} etfSymbol={etfSymbol} />}
      {safeTab === 'cagr' && performanceMetrics && <PerformanceBars series={performanceMetrics.cagr.values} etfSymbol={etfSymbol} />}
    </section>
  );
}

interface PerformanceBarsProps {
  series: EtfPerformanceMetricsPayload['returns']['values'];
  etfSymbol: string;
}

function PerformanceBars({ series, etfSymbol }: PerformanceBarsProps): JSX.Element {
  // Hide individual periods where the focal ETF has no value — a bare
  // category bar without an ETF counterpart is misleading.
  const visible = series.filter((v) => v.etf !== null);
  const hasCategoryAverage = visible.some((v) => v.categoryAverage !== null);

  if (visible.length === 0) {
    return <div className="h-64 sm:h-72 flex items-center justify-center text-sm text-gray-400">No data available for this ETF.</div>;
  }

  const labels = visible.map((v) => {
    const period = ETF_PERFORMANCE_PERIODS.find((p) => p.key === v.periodKey);
    return period ? period.label : v.periodKey;
  });

  const datasets: ChartData<'bar'>['datasets'] = [
    {
      label: etfSymbol,
      data: visible.map((v) => v.etf),
      backgroundColor: ACCENT_COLOR,
      borderColor: ACCENT_COLOR,
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
        ticks: { color: '#9ca3af', font: { size: 11 } },
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

  return (
    <div className="h-64 sm:h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
