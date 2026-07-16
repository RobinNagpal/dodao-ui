'use client';

import { createContext, useContext } from 'react';

export type EtfTheme = 'dark' | 'light';

/**
 * Current ETF-section theme, provided by `EtfThemeProvider`. Client components
 * that can't read the themed CSS variables — e.g. chart.js canvases (which paint
 * from JS values, not CSS) — read this to pick their colors and re-render when
 * the user toggles. Defaults to `dark` when no provider is present.
 */
export const EtfThemeContext = createContext<EtfTheme>('dark');

export const useEtfTheme = (): EtfTheme => useContext(EtfThemeContext);
