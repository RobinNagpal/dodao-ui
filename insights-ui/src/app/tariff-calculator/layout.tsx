import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

export default function TariffCalculatorLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-tariff-theme">{children}</PageThemeProvider>;
}
