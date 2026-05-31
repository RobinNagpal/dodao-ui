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
  '--text-color': '#e5e7eb', // Body text (gray-200)
  '--text-muted': '#9ca3af', // Secondary / muted text (gray-400)

  // Lines
  '--border-color': '#374151', // Borders / dividers (gray-700)

  '--swiper-theme-color': '#7f78ff',
} as CSSProperties;
