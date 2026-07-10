import { CSSProperties } from 'react';

/**
 * Single source of truth for the KoalaGains color system. These CSS variables
 * are injected once on `<body>` (see `src/app/layout.tsx`) and surfaced as
 * Tailwind color tokens in `tailwind.config.ts`. Components should use the
 * tokens (`bg-surface`, `text-muted`, `border-border`, …) — NOT raw `bg-gray-*`.
 *
 * Structural palette is a deliberate 3-tier dark ramp:
 *   bg (page) < surface (cards) < surface-2 (inset/inline)
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
 * Light mirror of {@link themeColors}. Same CSS-variable names, light values.
 * Spread onto a wrapper element by a scoped theme provider (e.g.
 * `EtfThemeProvider`) to flip every semantic token (`bg-surface`, `text-muted`,
 * `border-border`, …) underneath it to light — no per-component `dark:`
 * variants involved. The three-tier surface ramp is preserved in reverse:
 *   bg (page, lightest) < surface (cards) < surface-2 (inset) < surface-3.
 *
 * NOTE: this only affects components that read the semantic tokens. Hardcoded
 * palette colors (`bg-gray-*`, chart.js hex, translucent chips) are intentionally
 * left untouched for now and render the same in both themes.
 */
export const lightThemeColors = {
  // Brand — keep the indigo brand identical across themes; use a darker link
  // shade so links stay legible on light surfaces.
  '--primary-color': '#7f78ff', // Indigo — primary actions
  '--primary-text-color': '#ffffff', // Text on primary elements
  '--link-color': '#4f46e5', // Links (indigo-600) — readable on light

  // Surfaces (3-tier ramp, lightest → darkest)
  '--bg-color': '#ffffff', // Page background (white)
  '--surface': '#f9fafb', // Cards / report sections (gray-50)
  '--surface-2': '#f3f4f6', // Inset / inline rows / chips track (gray-100)
  '--surface-3': '#e5e7eb', // Raised / hover state (gray-200)
  '--block-bg': '#f9fafb', // Legacy alias → surface

  // Text
  '--heading-color': '#111827', // Headings (gray-900)
  '--text-color': '#1f2937', // Body text (gray-800)
  '--text-muted': '#4b5563', // Secondary / muted text (gray-600)

  // Lines
  '--border-color': '#e5e7eb', // Borders / dividers (gray-200)

  '--swiper-theme-color': '#7f78ff',
} as CSSProperties;
