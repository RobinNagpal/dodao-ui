import PageThemeProvider from '@/components/theme/PageThemeProvider';
import type { ReactNode } from 'react';

export default function BlogsLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PageThemeProvider storageKey="koalagains-blog-theme">{children}</PageThemeProvider>;
}
