'use client';

import { createContext, useContext } from 'react';

export type PageTheme = 'dark' | 'light';

/**
 * Current theme for a page section wrapped by `PageThemeProvider`. Client
 * components that can't read the themed CSS variables directly — e.g. chart
 * canvases that paint from JS values, or portaled overlays whose DOM sits
 * outside the provider's subtree — read this to pick their colors and re-render
 * when the user toggles. Defaults to `dark` when no provider is present.
 *
 * Mirrors the stock- and ETF-section theme contexts so the whole page-by-page
 * theming rollout behaves identically.
 */
export const PageThemeContext = createContext<PageTheme>('dark');

export const usePageTheme = (): PageTheme => useContext(PageThemeContext);
