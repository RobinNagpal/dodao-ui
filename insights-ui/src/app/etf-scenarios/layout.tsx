import EtfThemeProvider from '@/components/etfs/EtfThemeProvider';
import { ReactNode } from 'react';

/** Wraps the ETF scenarios routes in the scoped light/dark theme switcher. */
export default function EtfScenariosLayout({ children }: { children: ReactNode }): JSX.Element {
  return <EtfThemeProvider>{children}</EtfThemeProvider>;
}
