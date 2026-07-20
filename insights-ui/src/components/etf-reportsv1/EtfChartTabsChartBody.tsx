'use client';

/**
 * Heavy inner module for EtfChartTabs — all chart.js / react-chartjs-2 /
 * PriceChart imports live here so the parent shell (tab UI + range pill +
 * heading) can ship without dragging chart.js into the main client bundle.
 *
 * Dynamically imported from EtfChartTabs via `next/dynamic({ ssr: false })`
 * gated behind a `useInView` observer, mirroring the stock-side PriceChartLazy
 * / QuarterlyMetricsChartLazy two-layer pattern.
 */

import type { PriceHistoryResponse, PriceRangeKey } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import PriceChart from '@/components/ticker-reportsv1/PriceChart';
import { usePageTheme } from '@/components/theme/page-theme-context';
import { chartAxisTheme } from '@/util/chart-theme';
import { BarElement, CategoryScale, Chart as ChartJS, type ChartData, type ChartOptions, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ETF_PERFORMANCE_PERIODS, type EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ACCENT_COLOR = '#10b981';
const CATEGORY_COLOR = '#7f78ff';

function formatPct(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export type EtfChartTabKey = 'price' | 'return' | 'cagr';

export interface EtfChartTabsChartBodyProps {
  activeTab: EtfChartTabKey;
  priceHistory: PriceHistoryResponse | null;
  performanceMetrics: EtfPerformanceMetricsPayload | null;
  etfSymbol: string;
  priceRange: PriceRangeKey;
}

export default function EtfChartTabsChartBody({
  activeTab,
  priceHistory,
  performanceMetrics,
  etfSymbol,
  priceRange,
}: EtfChartTabsChartBodyProps): JSX.Element | null {
  if (activeTab === 'price' && priceHistory) {
    return <PriceChart data={priceHistory} embedded range={priceRange} hideRangeButtons />;
  }
  if (activeTab === 'return' && performanceMetrics) {
    return <PerformanceBars series={performanceMetrics.returns.values} etfSymbol={etfSymbol} />;
  }
  if (activeTab === 'cagr' && performanceMetrics) {
    return <PerformanceBars series={performanceMetrics.cagr.values} etfSymbol={etfSymbol} />;
  }
  return null;
}

interface PerformanceBarsProps {
  series: EtfPerformanceMetricsPayload['returns']['values'];
  etfSymbol: string;
}

function PerformanceBars({ series, etfSymbol }: PerformanceBarsProps): JSX.Element {
  const axis = chartAxisTheme(usePageTheme());

  // Hide individual periods where the focal ETF has no value — a bare
  // category bar without an ETF counterpart is misleading.
  const visible = series.filter((v) => v.etf !== null);
  const hasCategoryAverage = visible.some((v) => v.categoryAverage !== null);

  if (visible.length === 0) {
    return <div className="h-64 sm:h-72 flex items-center justify-center text-sm text-muted">No data available for this ETF.</div>;
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
          color: axis.label,
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
        ticks: { color: axis.tick, font: { size: 11 } },
      },
      y: {
        grid: { color: axis.grid },
        ticks: {
          color: axis.tick,
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
