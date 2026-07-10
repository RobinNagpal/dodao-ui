import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

// Wraps both `[industryId]` reports and `chapters/[chapterSlug]` pages. The
// nested `[industryId]/layout.tsx` (which fetches the report) renders inside
// this, so the whole industry-tariff-report tree gets the light/dark toggle.
export default function IndustryTariffReportRootLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-tariff-theme">{children}</PageThemeProvider>;
}
