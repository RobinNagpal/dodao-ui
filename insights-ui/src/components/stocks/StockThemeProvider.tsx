'use client';

import { StockThemeContext } from '@/components/stocks/stock-theme-context';
import { lightThemeColors, themeColors } from '@/util/theme-colors';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type StockTheme = 'dark' | 'light';

const STORAGE_KEY = 'koalagains-stock-report-theme';

/**
 * Apply a theme change with CSS transitions momentarily disabled, so the palette
 * swap is atomic — every color flips in the same frame. Without this, elements
 * carrying `transition-colors` (e.g. the sub-industry card headers) animate their
 * background over ~150ms while text color snaps instantly, briefly leaving dark
 * text on a still-dark background (a "black blink"). Mirrors next-themes'
 * `disableTransitionOnChange`; transitions are restored after the next paint so
 * hover animations keep working.
 */
function applyThemeWithoutTransition(apply: () => void): void {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none !important}'));
  document.head.appendChild(style);

  apply();

  // Restore transitions once the new palette has painted (two frames to be safe).
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      style.parentNode?.removeChild(style);
    });
  });
}

/**
 * Scoped light/dark switcher for the stocks section — the report pages
 * (`/stocks/[exchange]/[ticker]/**`) and the listing pages (`/stocks`,
 * `/stocks/industries/[industry]`, `/stocks/countries/**`).
 *
 * It flips ONLY the semantic color tokens defined in `src/util/theme-colors.ts`
 * (`--bg-color`, `--surface`, `--text-color`, `--border-color`, …) by spreading
 * the light or dark palette onto a wrapping element — the tokens cascade to
 * every descendant that reads `var(--…)` via the Tailwind color tokens. Any
 * hardcoded / `dark:` colors on these pages are intentionally left untouched for
 * now; those are handled page by page.
 *
 * The theme is scoped to whatever subtree this wraps (not the whole app) so the
 * rollout can proceed page by page. It defaults to `dark`, so the pages render
 * exactly as before until a user opts into light mode, and the choice is shared
 * across the stocks section via `localStorage`.
 */
export default function StockThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<StockTheme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Default state is already `dark`; only a stored `light` is a real change,
    // and we apply it without a transition so there's no flash on initial load.
    if (stored === 'light') {
      applyThemeWithoutTransition(() => setTheme('light'));
    }
  }, []);

  const toggleTheme = (): void => {
    applyThemeWithoutTransition(() => {
      setTheme((prev) => {
        const next: StockTheme = prev === 'dark' ? 'light' : 'dark';
        window.localStorage.setItem(STORAGE_KEY, next);
        return next;
      });
    });
  };

  const isDark = theme === 'dark';
  const paletteStyle: CSSProperties = {
    ...(isDark ? themeColors : lightThemeColors),
    backgroundColor: 'var(--bg-color)',
  };

  // `text-color` re-establishes the base text color from THIS wrapper's
  // (overridden) `--text-color`, so elements that don't set their own color —
  // page/section headings and summaries — inherit the themed value instead of
  // the near-white color already computed on <body>.
  //
  // `stock-theme-light` (only in light mode) is a hook for the handful of
  // components whose hardcoded dark-only colors can't be retargeted via tokens
  // without changing the dark look (e.g. the "Also view" country bar). Scoped
  // CSS under this class themes them in light while leaving dark untouched —
  // `dark:` variants can't be used here because <body> always carries `.dark`.
  return (
    <StockThemeContext.Provider value={theme}>
      <div style={paletteStyle} className={`text-color min-h-screen ${isDark ? '' : 'stock-theme-light'}`}>
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
    </StockThemeContext.Provider>
  );
}
