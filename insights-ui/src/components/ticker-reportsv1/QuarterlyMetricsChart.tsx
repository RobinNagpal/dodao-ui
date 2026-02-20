'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { ChartMetricType, QuarterlyChartDataResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/quarterly-chart-data/route';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface QuarterlyMetricsChartProps {
  data: QuarterlyChartDataResponse;
}

const METRIC_LABELS: Record<ChartMetricType, string> = {
  revenue: 'Revenue',
  grossMargin: 'Gross Margin',
  ebit: 'EBIT',
  freeCashFlow: 'Free Cash Flow',
  eps: 'EPS',
  sharesOutstanding: 'Shares Outstanding',
};

const METRIC_COLORS: Record<ChartMetricType, { border: string; background: string }> = {
  revenue: { border: '#7f78ff', background: 'rgba(127, 120, 255, 0.1)' },
  grossMargin: { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
  ebit: { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
  freeCashFlow: { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' },
  eps: { border: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' },
  sharesOutstanding: { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' },
};

function formatValue(value: number | null, metric: ChartMetricType): string {
  if (value === null) return 'N/A';
  if (metric === 'grossMargin') {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}%`;
    }
    return String(value);
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export default function QuarterlyMetricsChart({ data }: QuarterlyMetricsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetricType>(data.availableMetrics[0]);

  const metricData = data.data[selectedMetric];
  const labels = metricData.map((d) => d.quarter);
  const values = metricData.map((d) => d.value);

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: METRIC_LABELS[selectedMetric],
        data: values,
        borderColor: METRIC_COLORS[selectedMetric].border,
        backgroundColor: METRIC_COLORS[selectedMetric].background,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: METRIC_COLORS[selectedMetric].border,
        pointBorderColor: '#1f2937',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
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
          label: (item) => {
            const value = item.raw as number | null;
            return `${METRIC_LABELS[selectedMetric]}: ${formatValue(value, selectedMetric)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value) => {
            if (typeof value !== 'number') return value;
            if (selectedMetric === 'grossMargin') return `${value}%`;
            if (Math.abs(value) >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toLocaleString();
          },
        },
      },
    },
  };

  const metaInfo = [];
  if (data.meta.currency) metaInfo.push(data.meta.currency);
  if (data.meta.unit && selectedMetric !== 'grossMargin' && selectedMetric !== 'eps') {
    metaInfo.push(`in ${data.meta.unit}`);
  }

  return (
    <section id="quarterly-metrics-chart" className="bg-gray-900 rounded-lg shadow-sm px-3 py-4 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {data.dataFrequency === 'annual' ? 'Annual Financial Metrics' : 'Quarterly Financial Metrics'}
          </h3>
          {metaInfo.length > 0 && <p className="text-xs text-gray-400 mt-1">{metaInfo.join(' • ')}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.availableMetrics.map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === metric ? 'text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
              }`}
              style={selectedMetric === metric ? { backgroundColor: METRIC_COLORS[metric].border } : {}}
            >
              {METRIC_LABELS[metric]}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}
