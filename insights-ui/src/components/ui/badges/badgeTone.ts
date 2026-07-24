import { cva } from 'class-variance-authority';

/**
 * The single chip/badge color vocabulary for the report pages.
 *
 * Chips/badges (and buttons) are the ONLY elements allowed to carry color
 * beyond the structural tokens (`surface`, `text`, `border`, `primary`). Every
 * badge routes its color through one of these 6 semantic tones — one
 * translucent `…/15 + border …/40` recipe each — so the whole app reads as a
 * single badge family instead of ~30 ad-hoc color combinations.
 *
 * Map domain meanings onto tones:
 *   success → pass / positive / "good" / gainer
 *   danger  → fail / negative / "bad" / loser
 *   warning → caution / in-progress / medium
 *   info    → identity / exchange / asset-class / upside
 *   accent  → special / index / future / competitive
 *   neutral → archived / past / unknown
 */
// The `badge-tone-*` hook classes carry no styles of their own — they exist so
// light mode can darken the `-300` text (tuned for dark surfaces, unreadable on
// white) via `.page-theme-light` overrides in `styles/page-theme-light.scss`.
// Tailwind `dark:` variants can't be used because <body> always carries `.dark`.
export const badgeTone = cva('', {
  variants: {
    tone: {
      success: 'badge-tone-success bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
      danger: 'badge-tone-danger bg-red-500/15 text-red-300 border border-red-500/40',
      warning: 'badge-tone-warning bg-amber-500/15 text-amber-300 border border-amber-500/40',
      info: 'badge-tone-info bg-sky-500/15 text-sky-300 border border-sky-500/40',
      accent: 'badge-tone-accent bg-indigo-500/15 text-indigo-300 border border-indigo-500/40',
      neutral: 'badge-tone-neutral bg-gray-500/15 text-gray-300 border border-gray-500/40',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'accent' | 'neutral';
