import EtfThemeProvider from '@/components/etfs/EtfThemeProvider';
import { ReactNode } from 'react';

/** Wraps the ETF investors routes in the scoped light/dark theme switcher. */
export default function EtfInvestorsLayout({ children }: { children: ReactNode }): JSX.Element {
  return <EtfThemeProvider>{children}</EtfThemeProvider>;
}
