import type { StockTheme } from '@/components/stocks/stock-theme-context';

/**
 * Axis/grid colors for the chart.js charts on the stock pages. Canvas can't read
 * the themed CSS variables, so charts read the current `StockTheme` (via
 * `useStockTheme`) and pass these in.
 *
 * The `dark` values are exactly what the charts hardcoded before, so the dark
 * theme is unchanged. The `light` values are lighter equivalents so the grid
 * stays a faint backdrop (keeping focus on the data line) instead of the dark
 * gray-700 grid reading as heavy lines on a light background.
 */
export interface ChartAxisTheme {
  /** Primary grid line color (price/quarterly line charts). */
  grid: string;
  /** Fainter grid line color (quadrant scatter). */
  gridFaint: string;
  /** Axis border color (quadrant scatter). */
  axisBorder: string;
  /** Tick label color. */
  tick: string;
  /** In-canvas point/label text color (e.g. quadrant ticker labels). */
  label: string;
}

export function chartAxisTheme(theme: StockTheme): ChartAxisTheme {
  const isDark = theme === 'dark';
  return {
    grid: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(17, 24, 39, 0.08)',
    gridFaint: isDark ? 'rgba(55, 65, 81, 0.2)' : 'rgba(17, 24, 39, 0.06)',
    axisBorder: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(17, 24, 39, 0.12)',
    tick: isDark ? '#9ca3af' : '#6b7280',
    label: isDark ? '#d1d5db' : '#4b5563',
  };
}
