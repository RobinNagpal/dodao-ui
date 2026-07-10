import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

// Covers the whole daily-top-movers tree: top-gainers / top-losers, both their
// country/[country] listings and details/[id] pages.
export default function DailyTopMoversLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-daily-top-movers-theme">{children}</PageThemeProvider>;
}
