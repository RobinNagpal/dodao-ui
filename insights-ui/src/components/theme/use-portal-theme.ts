'use client';

import { usePageTheme } from '@/components/theme/page-theme-context';
import { lightThemeColors } from '@/util/theme-colors';

/** Class that re-declares the light palette tokens; its rule is injected once by `ThemeProvider`. */
const PORTAL_THEME_LIGHT_CLASS = 'portal-theme-light';

/**
 * CSS for {@link PORTAL_THEME_LIGHT_CLASS}, generated from `lightThemeColors` so the palette keeps a
 * single source. `color` is re-declared so text that doesn't set its own color picks up the light
 * `--text-color` instead of the near-white value inherited from `<body>`.
 */
export const portalThemeLightCss = `.${PORTAL_THEME_LIGHT_CLASS}{${Object.entries(lightThemeColors as Record<string, string>)
  .map(([name, value]) => `${name}:${value};`)
  .join('')}color:var(--text-color);}`;

/**
 * Class name for UI portaled to `<body>` — modals and anchored dropdown menus. Portaled DOM sits
 * outside the `ThemeProvider` wrapper, so it never sees the swapped palette and stays on the dark
 * tokens `<body>` carries. Add the returned class to the portaled root to apply the same swap there.
 *
 * Dark mode returns an empty string: `<body>` already declares the dark palette, so dark output
 * stays exactly as before. Light mode also adds `page-theme-light`, the hook for
 * `styles/page-theme-light.scss`.
 */
export function usePortalTheme(): string {
  return usePageTheme() === 'dark' ? '' : `page-theme-light ${PORTAL_THEME_LIGHT_CLASS}`;
}
