'use client';

import ChartFrame from '@/components/ui/containers/ChartFrame';
import { usePageTheme } from '@/components/theme/page-theme-context';
import type { TariffImportsByYear } from '@/types/tariff-chapter-prototype';
import { chartAxisTheme } from '@/util/chart-theme';
import { BarElement, CategoryScale, Chart as ChartJS, type ChartData, type ChartOptions, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Imports by year, stacked by the two named partners / rest of world.
//
// Three series in the tariff-report palette: teal for the largest partner,
// the brand purple for the second, and a neutral gray for everyone else — the
// same teal / purple the share bars in the country and product tables use
// (ShareBar `teal` / `primary`). The page pairs this chart with a table of the
// same numbers.
const SERIES_COLORS = {
  dark: { partnerA: '#14b8a6', partnerB: '#7f78ff', rest: '#4b5563', surface: '#1f2937' },
  light: { partnerA: '#0d9488', partnerB: '#7f78ff', rest: '#9ca3af', surface: '#ffffff' },
} as const;

function formatBillions(value: number): string {
  return `$${(value / 1e9).toFixed(2)}B`;
}

interface ImportsByYearChartProps {
  byYear: TariffImportsByYear[];
  partners: string[];
  chapterTitle: string;
  /** Which trade flow the bars show — only changes the accessible label. */
  flow?: 'imports' | 'exports';
}

export default function ImportsByYearChart({ byYear, partners, chapterTitle, flow = 'imports' }: ImportsByYearChartProps): JSX.Element {
  const theme = usePageTheme();
  const axis = chartAxisTheme(theme);
  const colors = SERIES_COLORS[theme === 'dark' ? 'dark' : 'light'];

  // A 2px surface-colored border is the gap between stacked segments.
  const segment = (label: string, values: number[], color: string) => ({
    label,
    data: values,
    backgroundColor: color,
    borderColor: colors.surface,
    borderWidth: 2,
    borderSkipped: false as const,
    borderRadius: 4,
    barPercentage: 0.85,
    categoryPercentage: 0.8,
    maxBarThickness: 120,
  });

  const data: ChartData<'bar'> = {
    labels: byYear.map((y) => String(y.year)),
    datasets: [
      segment(
        partners[0],
        byYear.map((y) => y.partnerAUsd),
        colors.partnerA
      ),
      segment(
        partners[1],
        byYear.map((y) => y.partnerBUsd),
        colors.partnerB
      ),
      segment(
        'Rest of world',
        byYear.map((y) => y.restUsd),
        colors.rest
      ),
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'start', labels: { color: axis.label, boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'rectRounded' } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatBillions(Number(ctx.raw))}`,
          footer: (items) => `Total: ${formatBillions(items.reduce((sum, i) => sum + Number(i.raw), 0))}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: axis.tick } },
      y: {
        stacked: true,
        grid: { color: axis.grid },
        border: { display: false },
        ticks: { color: axis.tick, callback: (v) => `$${(Number(v) / 1e9).toFixed(1)}B` },
      },
    },
  };

  return (
    <ChartFrame height="md" label={`U.S. ${chapterTitle.toLowerCase()} ${flow} by year, stacked by ${partners[0]}, ${partners[1]} and rest of world`}>
      <Bar data={data} options={options} />
    </ChartFrame>
  );
}
