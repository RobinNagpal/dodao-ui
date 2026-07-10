'use client';

import { createContext, useContext } from 'react';

export type StockTheme = 'dark' | 'light';

/**
 * Current stocks-section theme, provided by `StockThemeProvider`. Client
 * components that can't read the themed CSS variables — chart.js canvases (which
 * paint from JS values) and the portaled comparison modal (whose DOM sits
 * outside the provider's subtree) — read this to pick their colors and re-render
 * when the user toggles. Defaults to `dark` when no provider is present.
 */
export const StockThemeContext = createContext<StockTheme>('dark');

export const useStockTheme = (): StockTheme => useContext(StockThemeContext);
