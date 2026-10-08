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
// Three categorical series → the first three slots of the validated reference
// palette (blue, orange, aqua), which pass the CVD and normal-vision checks
// against the card surface in both themes. Dark and light steps are separate
// selections, not a flip. Light-mode aqua sits under 3:1 contrast, so the page
// pairs this chart with a table of the same numbers.
const SERIES_COLORS = {
  dark: { partnerA: '#3987e5', partnerB: '#d95926', rest: '#199e70', surface: '#1f2937' },
  light: { partnerA: '#2a78d6', partnerB: '#eb6834', rest: '#1baf7a', surface: '#ffffff' },
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
    maxBarThickness: 56,
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
