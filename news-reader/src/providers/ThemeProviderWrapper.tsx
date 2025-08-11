'use client';

import { ThemeProvider } from './ThemeProvider';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
