'use client';

import { lightThemeColors, themeColors } from '@/util/theme-colors';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type StockReportTheme = 'dark' | 'light';

const STORAGE_KEY = 'koalagains-stock-report-theme';

/**
 * Scoped light/dark switcher for the stock report pages
 * (`/stocks/[exchange]/[ticker]/**`, excluding the admin-only `create` route).
 *
 * It flips ONLY the semantic color tokens defined in `src/util/theme-colors.ts`
 * (`--bg-color`, `--surface`, `--text-color`, `--border-color`, …) by spreading
 * the light or dark palette onto a wrapping element — the tokens cascade to
 * every descendant that reads `var(--…)` via the Tailwind color tokens. Any
 * hardcoded / `dark:` colors on these pages are intentionally left untouched for
 * now; those are handled in a later pass.
 *
 * The theme is scoped to this subtree (not the whole app) so the rollout can
 * proceed page by page. It defaults to `dark`, so the pages render exactly as
 * before until a user opts into light mode, and the choice is remembered in
 * `localStorage`.
 */
export default function StockReportThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname() ?? '';
  const isAdminCreate = pathname.endsWith('/create');

  const [theme, setTheme] = useState<StockReportTheme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = (): void => {
    setTheme((prev) => {
      const next: StockReportTheme = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  // Admin create page keeps its existing appearance — no palette override, no toggle.
  if (isAdminCreate) {
    return <>{children}</>;
  }

  const isDark = theme === 'dark';
  const paletteStyle: CSSProperties = {
    ...(isDark ? themeColors : lightThemeColors),
    backgroundColor: 'var(--bg-color)',
  };

  return (
    <div style={paletteStyle} className="min-h-screen">
      {children}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-heading shadow-lg transition-colors hover:bg-surface-2"
      >
        {isDark ? <SunIcon aria-hidden="true" className="size-6" /> : <MoonIcon aria-hidden="true" className="size-6" />}
      </button>
    </div>
  );
}
