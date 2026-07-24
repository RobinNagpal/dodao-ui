'use client';

import { PageThemeContext, type PageTheme } from '@/components/theme/page-theme-context';
import { lightThemeColors, themeColors } from '@/util/theme-colors';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * `localStorage` key the app-wide theme choice is remembered under. A single key
 * (not per-section) because the switcher is now global — one toggle themes the
 * whole app and the choice persists across every route.
 */
const STORAGE_KEY = 'koalagains-theme';

/**
 * Apply a theme change with CSS transitions momentarily disabled, so the palette
 * swap is atomic — every color flips in the same frame. Without this, elements
 * carrying `transition-colors` animate their background over ~150ms while text
 * color snaps instantly, briefly leaving dark text on a still-dark background (a
 * "black blink"). Mirrors next-themes' `disableTransitionOnChange`; transitions
 * are restored after the next paint so hover animations keep working.
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
 * App-wide light/dark theme switcher, mounted once in the root layout so it wraps
 * the navbar, page content and portaled overlays (e.g. the login modal, which
 * still reads the theme through React context even though its DOM is portaled).
 *
 * Theming happens at two levels:
 *
 * 1. **Wrapper token swap** — this wraps everything in a `<div>` that re-declares
 *    the semantic CSS variables (dark or light) as inline style. Every descendant
 *    reading the tokens (`bg-surface`, `text-heading`, `border-border`, …) flips
 *    with it. In dark mode the values equal the body's, so dark stays
 *    byte-identical.
 * 2. **`<body>` sync** — Headless UI overlays with `portal` (the mobile-nav
 *    `Dialog`, web-core `FullPageModal`/`EllipsisDropdown`/`StyledSelect`
 *    popovers, toasts) mount their DOM into `document.body`, OUTSIDE this
 *    wrapper, so they resolve the CSS variables from `<body>` — which the server
 *    renders with the dark palette. An effect below keeps body's palette
 *    variables and its `dark` / `page-theme-light` classes in sync with the
 *    selected theme, so portaled overlays (and any `dark:` Tailwind variants)
 *    follow the toggle too.
 *
 * Defaults to `dark`, so the app renders exactly as before until a user opts into
 * light mode; the choice is remembered in `localStorage`.
 *
 * Components that can't read the swapped CSS variables — chart.js canvases (which
 * paint from JS values) and the navbar (which toggles its own `.dark` class) —
 * read the current theme via `usePageTheme()` instead.
 */
export default function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<PageTheme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Default state is already `dark`; only a stored `light` is a real change,
    // and we apply it without a transition so there's no flash on initial load.
    if (stored === 'light') {
      applyThemeWithoutTransition(() => setTheme('light'));
    }
  }, []);

  // Keep <body> in sync with the theme (see docblock, point 2). The server
  // renders body with the dark palette + `.dark`; this re-applies the current
  // palette after hydration and on every toggle. It runs inside the same
  // `applyThemeWithoutTransition` window as the wrapper swap (React commits
  // effects before the restore rAFs fire), so the flip stays atomic.
  useEffect(() => {
    const body = document.body;
    const palette = (theme === 'dark' ? themeColors : lightThemeColors) as Record<string, string>;
    Object.entries(palette).forEach(([name, value]) => body.style.setProperty(name, value));
    body.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('page-theme-light', theme === 'light');
  }, [theme]);

  const toggleTheme = (): void => {
    const next: PageTheme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(STORAGE_KEY, next);
    applyThemeWithoutTransition(() => setTheme(next));
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
  // `page-theme-light` (only in light mode) is a hook for components whose
  // hardcoded dark-only colors can't be retargeted via tokens without changing
  // the dark look (see `styles/page-theme-light.scss` + `styles/theme-styles.scss`).
  // `dark:` variants can't be used here because <body> always carries `.dark`.
  return (
    <PageThemeContext.Provider value={theme}>
      <div style={paletteStyle} className={`text-color min-h-screen ${isDark ? '' : 'page-theme-light'}`}>
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
    </PageThemeContext.Provider>
  );
}
