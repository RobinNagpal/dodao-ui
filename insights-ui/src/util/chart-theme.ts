import type { PageTheme } from '@/components/theme/page-theme-context';

/**
 * Axis/grid colors for the chart.js charts on the themed pages (stocks + ETFs).
 * Canvas can't read the themed CSS variables, so charts read the current
 * `PageTheme` (via `usePageTheme`) and pass these in.
 *
 * The `dark` values are exactly what the charts hardcoded before, so the dark
 * theme is unchanged. The `light` values are lighter equivalents so the grid
 * stays a faint backdrop (keeping focus on the data) instead of the dark
 * gray-700 grid reading as heavy lines on a light background.
 */
export interface ChartAxisTheme {
  /** Primary grid line color (price/return line & bar charts). */
  grid: string;
  /** Fainter grid line color (quadrant scatter). */
  gridFaint: string;
  /** Axis border color (quadrant scatter). */
  axisBorder: string;
  /** Tick label color. */
  tick: string;
  /** In-canvas point/label text color (e.g. quadrant symbol labels, legend). */
  label: string;
}

export function chartAxisTheme(theme: PageTheme): ChartAxisTheme {
  const isDark = theme === 'dark';
  return {
    grid: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(17, 24, 39, 0.08)',
    gridFaint: isDark ? 'rgba(55, 65, 81, 0.2)' : 'rgba(17, 24, 39, 0.06)',
    axisBorder: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(17, 24, 39, 0.12)',
    tick: isDark ? '#9ca3af' : '#6b7280',
    label: isDark ? '#d1d5db' : '#4b5563',
  };
}
