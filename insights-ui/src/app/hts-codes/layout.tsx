import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

// Covers the HTS code browser: `/hts-codes` and `/hts-codes/us/[section]/[chapter]`.
export default function HtsCodesLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-tariff-theme">{children}</PageThemeProvider>;
}
