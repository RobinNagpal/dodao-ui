import StockReportThemeProvider from '@/app/stocks/[exchange]/[ticker]/StockReportThemeProvider';
import { ReactNode } from 'react';

/**
 * Wraps every stock report page under `/stocks/[exchange]/[ticker]/**` in the
 * scoped light/dark theme switcher. This is the first surface of the page-by-page
 * theming rollout; other sections keep the dark palette until they are migrated.
 */
export default function TickerReportLayout({ children }: { children: ReactNode }): JSX.Element {
  return <StockReportThemeProvider>{children}</StockReportThemeProvider>;
}
