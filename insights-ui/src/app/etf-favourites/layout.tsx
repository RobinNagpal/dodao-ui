import EtfThemeProvider from '@/components/etfs/EtfThemeProvider';
import { ReactNode } from 'react';

/** Wraps the ETF favourites routes in the scoped light/dark theme switcher. */
export default function EtfFavouritesLayout({ children }: { children: ReactNode }): JSX.Element {
  return <EtfThemeProvider>{children}</EtfThemeProvider>;
}
