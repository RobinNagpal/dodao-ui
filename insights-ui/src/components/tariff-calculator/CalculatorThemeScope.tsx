'use client';

import { usePageTheme } from '@/components/theme/page-theme-context';
import type { ReactNode } from 'react';

/**
 * Sets `color-scheme` / `accent-color` on the calculator subtree from the active
 * page theme. These are inline style properties (native form-control styling)
 * that CSS-variable token swaps can't reach, so they must follow the theme in
 * JS. In dark mode the values match the original hard-coded ones, so dark is
 * unchanged; in light mode native date/select popups and checkboxes render light
 * with a readable amber accent.
 */
export default function CalculatorThemeScope({ children }: { children: ReactNode }): JSX.Element {
  const isDark = usePageTheme() === 'dark';
  return (
    <div className="text-color" style={{ colorScheme: isDark ? 'dark' : 'light', accentColor: isDark ? '#fbbf24' : '#b45309' }}>
      {children}
    </div>
  );
}
