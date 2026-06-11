import { CSSProperties } from 'react';

/**
 * Single source of truth for the dodao.io (DoDAO Home) color system. The
 * palette is intentionally identical to insights-ui (KoalaGains) — see
 * `insights-ui/src/util/theme-colors.ts` — so both sites share one look:
 * a 3-tier dark surface ramp (bg < surface < surface-2), white headings,
 * brightened body text, and the indigo brand primary.
 *
 * Every color is written exactly once, as an RGB triplet. The triplets are
 * consumed in two ways:
 *   1. The Tailwind semantic tokens in `tailwind.config.js`
 *      (`bg-bg`, `bg-surface`, `text-heading`, `text-muted`, `bg-primary/20`, …)
 *      which support opacity modifiers via `rgb(var(--x-rgb) / <alpha-value>)`.
 *   2. The legacy hex-style vars (`--primary-color`, `--bg-color`, …) used by
 *      shared web-core components, `theme-styles.scss` utility classes, and
 *      markdown styles — derived below via `rgb(var(--x-rgb))`.
 *
 * These variables are injected on `<body>` in `src/app/layout.tsx` whenever
 * the DODAO_HOME space is served, so every page on dodao.io — home, robotics,
 * products, services, education, research — picks them up. Components on
 * those pages must use the semantic tokens, never raw palette classes like
 * `bg-gray-900` or hex values.
 */
export const dodaoHomeThemeStyles = {
  // Brand
  '--primary-rgb': '127 120 255', // #7f78ff — indigo, primary actions
  '--primary-text-rgb': '255 255 255', // #ffffff — text on primary elements
  '--link-rgb': '160 155 255', // #a09bff — links

  // Surfaces (3-tier dark ramp): bg (page) < surface (cards) < surface-2 (inset)
  '--bg-rgb': '17 24 39', // #111827 — page background (gray-900)
  '--surface-rgb': '31 41 55', // #1f2937 — cards / sections (gray-800)
  '--surface-2-rgb': '55 65 81', // #374151 — inset / inline rows (gray-700)
  '--surface-3-rgb': '75 85 99', // #4b5563 — raised / hover state (gray-600)

  // Text
  '--heading-rgb': '255 255 255', // #ffffff — headings
  '--text-rgb': '243 244 246', // #f3f4f6 — body text (gray-100)
  '--text-muted-rgb': '203 213 225', // #cbd5e1 — secondary / muted text (slate-300)

  // Lines
  '--border-rgb': '55 65 81', // #374151 — borders / dividers (gray-700)

  // Status tones — chips, badges, and indicators only (mirrors the
  // insights-ui badge tone vocabulary: success/warning/danger/info)
  '--success-rgb': '52 211 153', // emerald-400
  '--warning-rgb': '251 191 36', // amber-400
  '--danger-rgb': '248 113 113', // red-400
  '--info-rgb': '56 189 248', // sky-400

  // Legacy vars consumed by shared web-core components and the global
  // utility classes (`theme-styles.scss`, markdown styles, swiper). Derived
  // from the triplets above so each color value stays defined in one place.
  '--primary-color': 'rgb(var(--primary-rgb))',
  '--primary-text-color': 'rgb(var(--primary-text-rgb))',
  '--bg-color': 'rgb(var(--bg-rgb))',
  '--text-color': 'rgb(var(--text-rgb))',
  '--text-muted': 'rgb(var(--text-muted-rgb))',
  '--link-color': 'rgb(var(--link-rgb))',
  '--heading-color': 'rgb(var(--heading-rgb))',
  '--border-color': 'rgb(var(--border-rgb))',
  '--block-bg': 'rgb(var(--surface-rgb))',
  '--swiper-theme-color': 'rgb(var(--primary-rgb))',
} as CSSProperties;
