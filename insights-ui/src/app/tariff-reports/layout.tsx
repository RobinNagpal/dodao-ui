import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

// Tariff routes share one storage key so the light/dark choice carries across
// tariff-reports, tariff-calculator, hts-codes and industry-tariff-report.
export default function TariffReportsLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-tariff-theme">{children}</PageThemeProvider>;
}
