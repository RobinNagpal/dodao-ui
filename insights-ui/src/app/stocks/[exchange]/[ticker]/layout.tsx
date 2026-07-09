import StockThemeProvider from '@/components/stocks/StockThemeProvider';
import { ReactNode } from 'react';

/**
 * Wraps every stock report page under `/stocks/[exchange]/[ticker]/**` in the
 * scoped light/dark theme switcher. Shares the switcher (and the remembered
 * theme choice) with the stocks listing pages via `StockThemeProvider`.
 */
export default function TickerReportLayout({ children }: { children: ReactNode }): JSX.Element {
  return <StockThemeProvider>{children}</StockThemeProvider>;
}
