import { CSSProperties } from 'react';

/**
 * Single source of truth for the KoalaGains color system. These CSS variables
 * are injected onto a wrapping element (see `src/app/layout.tsx` for the global
 * dark default, and the scoped stock-report switcher below) and surfaced as
 * Tailwind color tokens in `tailwind.config.ts`. Components should use the
 * tokens (`bg-surface`, `text-muted`, `border-border`, …) — NOT raw `bg-gray-*`.
 *
 * The dark palette (`themeColors`) is the historical default and must stay
 * pixel-identical to production. The light palette (`lightThemeColors`) mirrors
 * the same structural roles with inverted values. Because both objects use the
 * exact same variable names, swapping which one is spread onto a wrapper flips
 * every token underneath it — no per-component `dark:` variants required.
 *
 * Structural palette is a deliberate 3-tier ramp:
 *   bg (page) < surface (cards) < surface-2 (inset/inline) < surface-3 (raised)
 * with two text levels (text / text-muted), one heading, one border, one link,
 * and the brand primary. Everything outside chips/badges/buttons should resolve
 * to one of these.
 */
export const themeColors = {
  // Brand
  '--primary-color': '#7f78ff', // Indigo — primary actions
  '--primary-text-color': '#ffffff', // Text on primary elements
  '--link-color': '#a09bff', // Links

  // Surfaces (3-tier ramp)
  '--bg-color': '#111827', // Page background (gray-900)
  '--surface': '#1f2937', // Cards / report sections (gray-800)
  '--surface-2': '#374151', // Inset / inline rows / chips track (gray-700)
  '--surface-3': '#4b5563', // Raised / hover state — one step above surface-2 (gray-600)
  '--block-bg': '#1f2937', // Legacy alias → surface

  // Text
  '--heading-color': '#ffffff', // Headings
  '--text-color': '#f3f4f6', // Body text (gray-100) — brightened for readability on dark surfaces
  '--text-muted': '#cbd5e1', // Secondary / muted text (slate-300) — brightened for readability

  // Lines
  '--border-color': '#374151', // Borders / dividers (gray-700)

  '--swiper-theme-color': '#7f78ff',
} as CSSProperties;

/**
 * Light palette — same variable names as `themeColors`, inverted values. The
 * 3-tier surface ramp goes light→lighter here (white page, gray-50/100/200
 * surfaces); text roles go dark. Brand primary is kept for continuity, and the
 * link color is darkened (indigo-600) so it stays legible on light backgrounds.
 *
 * Currently applied only by the scoped stock-report switcher
 * (`src/app/stocks/[exchange]/[ticker]/StockReportThemeProvider.tsx`); other
 * pages keep the dark palette until they are migrated one by one.
 */
export const lightThemeColors = {
  // Brand — kept identical to dark so buttons/accents don't shift between modes.
  '--primary-color': '#7f78ff', // Indigo — primary actions (kept for brand continuity)
  '--primary-text-color': '#ffffff', // Text on primary elements
  '--link-color': '#4f46e5', // Links (indigo-600) — darkened for contrast on light

  // Surfaces — a soft light-grey base (NOT pure white) with white cards on top,
  // mirroring how dark uses gray-900 as the base and lighter greys for the ramp.
  '--bg-color': '#f3f4f6', // Page background (gray-100) — the "not fully white" base
  '--surface': '#ffffff', // Cards / report sections (white) — lift off the grey base
  '--surface-2': '#e5e7eb', // Inset / inline rows / chips track (gray-200)
  '--surface-3': '#d1d5db', // Raised / hover state (gray-300)
  '--block-bg': '#ffffff', // Legacy alias → surface

  // Text
  '--heading-color': '#111827', // Headings (gray-900)
  '--text-color': '#1f2937', // Body text (gray-800)
  '--text-muted': '#4b5563', // Secondary / muted text (gray-600)

  // Lines
  '--border-color': '#d1d5db', // Borders / dividers (gray-300) — visible on white cards

  '--swiper-theme-color': '#7f78ff',
} as CSSProperties;
