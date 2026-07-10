'use client';

import { EtfTheme, EtfThemeContext } from '@/components/etfs/etf-theme-context';
import { lightThemeColors, themeColors } from '@/util/theme-colors';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';

const STORAGE_KEY = 'koalagains-etf-theme';

/**
 * Scoped light/dark theme switcher for the public ETF section.
 *
 * The app `<body>` is permanently `.dark` and injects the dark palette, so
 * Tailwind `dark:` variants are useless here — we theme by *token swap*
 * instead. This provider wraps the ETF page in a `<div>` that re-declares the
 * semantic CSS variables (dark or light) as inline style; every descendant that
 * uses the tokens (`bg-surface`, `text-heading`, `border-border`, …) flips with
 * it. In dark mode the values equal the body's, so the dark UI is byte-identical.
 *
 * Hardcoded/`dark:` colors (raw `bg-gray-*`, chart.js hex, translucent chips)
 * are intentionally NOT flipped for now — they render the same in both themes.
 *
 * State lives in `localStorage` (key `koalagains-etf-theme`, default dark) so the
 * choice persists across the whole ETF section and page reloads. The current
 * theme is also exposed via `EtfThemeContext` for canvas charts that can't read
 * CSS variables.
 */

/**
 * Run `apply` with all CSS transitions momentarily disabled so swapping the
 * palette doesn't animate every color at once (which reads as a "flash").
 */
function applyWithoutTransition(apply: () => void): void {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none !important}'));
  document.head.appendChild(style);

  apply();

  // Force a reflow, then drop the override on the next frame so real
  // transitions resume once the swap has painted.
  window.getComputedStyle(document.body).opacity;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      style.parentNode?.removeChild(style);
    });
  });
}

export default function EtfThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<EtfTheme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light') {
      applyWithoutTransition(() => setTheme('light'));
    }
  }, []);

  const toggleTheme = (): void => {
    applyWithoutTransition(() => {
      setTheme((prev) => {
        const next: EtfTheme = prev === 'dark' ? 'light' : 'dark';
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

  return (
    <EtfThemeContext.Provider value={theme}>
      <div style={paletteStyle} className={`text-color min-h-screen ${isDark ? '' : 'etf-theme-light'}`}>
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
    </EtfThemeContext.Provider>
  );
}
