'use client';

import ChartFrame from '@/components/ui/containers/ChartFrame';
import { usePageTheme } from '@/components/theme/page-theme-context';
import type { TariffImportsByYear } from '@/types/tariff-chapter-prototype';
import { chartAxisTheme } from '@/util/chart-theme';
import { BarElement, CategoryScale, Chart as ChartJS, type ChartData, type ChartOptions, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Imports by year, stacked by Canada / Mexico / rest of world.
//
// Three categorical series → the first three slots of the validated reference
// palette (blue, orange, aqua), which pass the CVD and normal-vision checks
// against the card surface in both themes. Dark and light steps are separate
// selections, not a flip. Light-mode aqua sits under 3:1 contrast, so the page
// pairs this chart with a table of the same numbers.
const SERIES_COLORS = {
  dark: { canada: '#3987e5', mexico: '#d95926', rest: '#199e70', surface: '#1f2937' },
  light: { canada: '#2a78d6', mexico: '#eb6834', rest: '#1baf7a', surface: '#ffffff' },
} as const;

function formatBillions(value: number): string {
  return `$${(value / 1e9).toFixed(2)}B`;
}

export default function ImportsByYearChart({ byYear }: { byYear: TariffImportsByYear[] }): JSX.Element {
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
        'Canada',
        byYear.map((y) => y.canadaUsd),
        colors.canada
      ),
      segment(
        'Mexico',
        byYear.map((y) => y.mexicoUsd),
        colors.mexico
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
    <ChartFrame height="md" label="U.S. live-animal imports by year, stacked by Canada, Mexico and rest of world">
      <Bar data={data} options={options} />
    </ChartFrame>
  );
}
