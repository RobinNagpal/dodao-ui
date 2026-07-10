import EtfThemeProvider from '@/components/etfs/EtfThemeProvider';
import { ReactNode } from 'react';

/** Wraps the filtered ETF listing routes in the scoped light/dark theme switcher. */
export default function EtfsFilteredLayout({ children }: { children: ReactNode }): JSX.Element {
  return <EtfThemeProvider>{children}</EtfThemeProvider>;
}
