import EtfThemeProvider from '@/components/etfs/EtfThemeProvider';
import { ReactNode } from 'react';

/**
 * Wraps the public ETF listing/detail routes in the scoped light/dark theme
 * switcher. Admin ETF screens live under `/admin-v1/*` and are intentionally
 * excluded (they never mount this provider).
 */
export default function EtfsLayout({ children }: { children: ReactNode }): JSX.Element {
  return <EtfThemeProvider>{children}</EtfThemeProvider>;
}
