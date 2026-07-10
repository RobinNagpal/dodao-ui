'use client';

import type { PageTheme } from '@/components/theme/page-theme-context';
import { useEffect, useState } from 'react';

/**
 * Bridges the *scoped* page-section theme (owned by `PageThemeProvider`, which
 * wraps only a route segment's content) out to *global* chrome that is rendered
 * in the root layout ABOVE every provider — namely the top navbar and the login
 * modal. Those elements can't read the provider's swapped CSS variables (they
 * sit outside its subtree), so instead they look up which section they're
 * currently over and mirror that section's remembered light/dark choice.
 *
 * Only route segments whose ENTIRE content is wrapped in a light/dark provider
 * are mapped here; anything else falls back to `dark` (the app default), so
 * unthemed pages keep the historical dark chrome unchanged.
 */

/** Custom event `PageThemeProvider` fires on toggle / restore so chrome updates live in the same tab. */
export const PAGE_THEME_CHANGE_EVENT = 'koalagains-page-theme-change';

export interface PageThemeChangeDetail {
  storageKey: string;
  theme: PageTheme;
}

/** Fire the live-update event. No-op guard for non-browser (SSR) contexts. */
export function notifyThemeChange(storageKey: string, theme: PageTheme): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<PageThemeChangeDetail>(PAGE_THEME_CHANGE_EVENT, { detail: { storageKey, theme } }));
}

const HOME_THEME_KEY = 'koalagains-home-theme';

// Route prefix -> the `storageKey` of the `PageThemeProvider` wrapping that segment.
// Keep in sync with each segment's `layout.tsx` / page wrapper.
const SECTION_THEME_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['/tariff-reports', 'koalagains-tariff-theme'],
  ['/tariff-calculator', 'koalagains-tariff-theme'],
  ['/industry-tariff-report', 'koalagains-tariff-theme'],
  ['/hts-codes', 'koalagains-tariff-theme'],
  ['/blogs', 'koalagains-blog-theme'],
  ['/daily-top-movers', 'koalagains-daily-top-movers-theme'],
  ['/portfolio-managers', 'koalagains-portfolio-managers-theme'],
  ['/login', 'koalagains-login-theme'],
];

function storageKeyForPath(pathname: string): string | null {
  if (pathname === '/') return HOME_THEME_KEY;
  const match = SECTION_THEME_KEYS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? match[1] : null;
}

/**
 * Resolve the light/dark theme of the section at `pathname`, staying in sync
 * with the provider's `localStorage` value and its live toggle event. Returns
 * `dark` for unmapped routes. Defaults to `dark` until mounted so SSR and the
 * first client render agree (no hydration mismatch).
 */
export function useSectionTheme(pathname: string): PageTheme {
  const [theme, setTheme] = useState<PageTheme>('dark');

  useEffect(() => {
    const key = storageKeyForPath(pathname);

    const read = (): void => {
      if (!key) {
        setTheme('dark');
        return;
      }
      setTheme(window.localStorage.getItem(key) === 'light' ? 'light' : 'dark');
    };

    read();

    const onCustom = (e: Event): void => {
      const detail = (e as CustomEvent<PageThemeChangeDetail>).detail;
      if (key && detail?.storageKey === key) read();
    };
    // Other tabs write `localStorage` directly (the custom event is same-tab only).
    const onStorage = (e: StorageEvent): void => {
      if (key && e.key === key) read();
    };

    window.addEventListener(PAGE_THEME_CHANGE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PAGE_THEME_CHANGE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, [pathname]);

  return theme;
}
