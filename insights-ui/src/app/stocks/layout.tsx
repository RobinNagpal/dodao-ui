import StockThemeProvider from '@/components/stocks/StockThemeProvider';
import { ReactNode } from 'react';

/**
 * Single theme-switcher layout for the whole `/stocks` section — listing pages,
 * report pages and their sub-pages. One provider (instead of per-route layouts)
 * means one floating toggle and one shared, remembered theme across the section.
 * The admin `create` route is passed through untouched inside the provider.
 *
 * This is the shape the switcher will eventually take app-wide: a single layout
 * near the root owning the toggle, rather than sprinkled per section.
 */
export default function StocksLayout({ children }: { children: ReactNode }): JSX.Element {
  return <StockThemeProvider>{children}</StockThemeProvider>;
}
