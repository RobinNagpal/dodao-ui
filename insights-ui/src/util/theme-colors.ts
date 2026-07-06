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
  '--well-bg': '#030712', // Sunken well / input field — one step below bg (gray-950)
  '--bg-color': '#111827', // Page background (gray-900)
  '--surface': '#1f2937', // Cards / report sections (gray-800)
  '--surface-2': '#374151', // Inset / inline rows / chips track (gray-700)
  '--surface-3': '#4b5563', // Raised / hover state — one step above surface-2 (gray-600)
  '--block-bg': '#1f2937', // Legacy alias → surface

  // Text
  '--heading-color': '#ffffff', // Headings
  '--text-color': '#f3f4f6', // Body text (gray-100) — brightened for readability on dark surfaces
  '--text-muted': '#cbd5e1', // Secondary / muted text (slate-300) — brightened for readability

  // Exact-gray muted ramp — kept DISTINCT from `--text-muted` so the current
  // dark UI stays byte-for-byte identical. Each equals its Tailwind gray, so
  // dimmer tiers (captions, placeholders, empty states) are not brightened.
  '--text-muted-1': '#d1d5db', // gray-300 — brightest muted (near-body secondary)
  '--text-muted-2': '#9ca3af', // gray-400 — standard secondary / icon muted
  '--text-muted-3': '#6b7280', // gray-500 — faint tertiary (hints, empty states)
  '--text-muted-4': '#4b5563', // gray-600 — dimmest muted (rare, low-contrast labels)

  // Lines
  '--border-color': '#374151', // Borders / dividers (gray-700)
  '--hairline': '#e5e7eb', // gray-200 — light hairline on legacy light-authored surfaces

  // Secondary link (blue) — distinct from the violet `--link-color` so blue
  // links keep their exact blue in dark. Two link colors coexist by design.
  '--link-blue-color': '#60a5fa', // blue-400
  '--link-blue-hover-color': '#93c5fd', // blue-300

  '--swiper-theme-color': '#7f78ff',
} as CSSProperties;
