import StockThemeProvider from '@/components/stocks/StockThemeProvider';
import { ReactNode } from 'react';

/**
 * Wraps the country stock listing pages (`/stocks/countries/[country]` and
 * `/stocks/countries/[country]/industries/[industry]`) in the scoped light/dark
 * theme switcher, sharing the remembered theme with the rest of the stocks
 * section via `StockThemeProvider`.
 */
export default function CountryStocksLayout({ children }: { children: ReactNode }): JSX.Element {
  return <StockThemeProvider>{children}</StockThemeProvider>;
}
