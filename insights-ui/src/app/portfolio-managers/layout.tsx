import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

// Covers the whole portfolio-managers tree: professional-managers,
// college-ambassadors (incl. industry-analysis), and profile-details/[id]
// (analysis + portfolios) pages.
export default function PortfolioManagersLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-portfolio-managers-theme">{children}</PageThemeProvider>;
}
