# Insights-UI Leaf Component System (Tailwind only in the leaf layer)

This is the source-of-truth for how styling is organized in `insights-ui`. Read
it before adding a component or touching `className`.

## The goal

> A small set (~20–30) of **leaf** (and one-level-above-leaf) **styled components**
> own **all** Tailwind CSS. Every **high-level** component — admin pages, stock
> page components, ETF page components, scenario pages — contains **zero**
> Tailwind and is built purely by composing leaves.

Why:

- **Design consistency** — spacing, color, typography, and surface chrome live
  in one place, so a change propagates everywhere instead of drifting per page.
- **Readable feature code** — high-level components read as structure
  (`<Stack><MetricGrid>…</MetricGrid></Stack>`), not a wall of utility classes.
- **Enforceable** — "no Tailwind above the leaf layer" is a lint rule, not a
  code-review hope.

## Where things live

- **Leaf layer (the ONLY place `className` / Tailwind is allowed):**
  `insights-ui/src/components/ui/**`. Organized into:
  - `ui/containers/**` — page/section **layout** primitives (`Stack`,
    `MetricGrid`, `SplitColumns`).
  - `ui/sections/**` — **surfaces & report-section chrome** (`CardSection`,
    `InlineCard`, `RelatedSectionsNav`, `ReportArticleShell`,
    `ReportSectionHeader`, `SectionHeading`, `ReportSection`, `ReportFooter`,
    `Prose`, `MarkdownContent`).
  - `ui/*` (flat) — typography (`Heading`, `Text`), data/badges/feedback
    (`MetricCell`, `StatusBadge`, …), and wrapped controls (`Breadcrumbs`, …).
  - The ESLint `src/components/ui/**` globs cover these subfolders (the `**`
    recurses), so nested leaves stay in the "Tailwind-allowed" zone with no
    config change.
- **Shared design-system primitives (reuse first):**
  `shared/web-core/src/components/core/**` (`Button`, `Input`, `StyledSelect`,
  modals, `Grid2–5Cols`, `Table`, loaders, `Breadcrumbs`, `EllipsisDropdown`,
  `PageWrapper`, error/warning panels). **Do not edit web-core for insights-ui
  styling work** — wrap it from the insights-ui leaf layer instead. Note: the
  centered page gutter already lives in web-core `PageWrapper` /
  `MainContainer` (`mx-auto max-w-7xl …`) — **do not recreate a `PageContainer`**
  that duplicates it.
- **High-level components (must be style-free):** everything else under
  `src/app/**` and `src/components/**`.

## Color system (tiny, tokenized)

All color is externalized into a small semantic token set backed by CSS
variables in `src/util/theme-colors.ts` and surfaced as Tailwind tokens in
`tailwind.config.ts`. **Outside chips/badges and buttons, only the structural
tokens below may appear — never raw `bg-gray-*` / `text-gray-*` / hex.**

**Structural tokens (the only colors in 99% of the UI)**

| Token (utility) | Role | Var |
|---|---|---|
| `bg-bg` | page background (darkest) | `--bg-color` |
| `bg-surface` | cards / report sections | `--surface` |
| `bg-surface-2` | inset / inline boxes / hovers | `--surface-2` |
| `text-heading` | headings (white) | `--heading-color` |
| `text-body` | body text | `--text-color` |
| `text-muted` | secondary / muted text | `--text-muted` |
| `border-border` | borders / dividers | `--border-color` |
| `text-primary` / `bg-primary` / `text-primary-text` | brand / primary actions | `--primary-color` |
| `text-link` | links | `--link-color` |

The surfaces form a deliberate 3-tier dark ramp: `bg` < `surface` < `surface-2`.
Legacy aliases (`bg-block`, `bg-background`, `border-block-border`) and bridged
shadcn names (`text-muted-foreground`→muted, `bg-card`→surface, `text-foreground`,
`border-input`, `ring`) all resolve to the same vars so older call-sites stay
consistent during migration.

**Chips / badges — the ONE place color variety lives**

Every badge routes color through the single 6-tone vocabulary in
`src/components/ui/badges/badgeTone.ts` (`success`/`danger`/`warning`/`info`/
`accent`/`neutral`, one translucent `…/15 + border …/40` recipe each). Map the
domain meaning onto a tone — do **not** invent new color pairs per component.
`PassFailBadge`, `StatusBadge`, `ReportFooter` tags, and the header exchange pill
already use it. Buttons route through `var(--primary-color)` (web-core `Button`
or `bg-primary`).

When adding a leaf: use the structural tokens for surfaces/text/border, and
`badgeTone` for any chip. Adding a raw gray or a new hue is a review red flag.

## Authoring a leaf component

Use [`class-variance-authority`](https://cva.style) (`cva`) for variants plus the
existing `cn()` helper (`src/lib/utils.ts` → `twMerge(clsx(...))`). Do **not** add
`tailwind-variants` — `cva` is already the standard here.

Canonical shape:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badge = cva('text-xs', {
  variants: {
    variant: { success: 'bg-green-900 text-green-200', neutral: 'bg-gray-700 text-gray-300' },
    size: { xs: 'px-2 py-1 rounded-full', sm: 'px-2 py-0.5 rounded' },
  },
  defaultVariants: { variant: 'neutral', size: 'xs' },
});

type Props = VariantProps<typeof badge> & { label: React.ReactNode; className?: string };

export default function StatusBadge({ variant, size, label, className }: Props) {
  return <span className={cn(badge({ variant, size }), className)}>{label}</span>;
}
```

Rules for leaves:

1. **Full literal class strings only.** Build variant maps from complete class
   strings (`'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'`), never interpolate
   (`` `grid-cols-${n}` ``) — Tailwind's content scanner can't see interpolated
   classes and will purge them.
2. **Expose a constrained, semantic vocabulary**, not raw Tailwind. Spacing is a
   scale (`gap="sm" | "md" | …`), color is a `tone`/`sentiment`/`variant`, etc.
   Extend the variant maps here rather than letting callers pass arbitrary
   Tailwind.
3. **Accept `className?`** and merge it last with `cn()` so a sibling leaf can
   compose. (Feature code still must not pass Tailwind into it — see enforcement.)
4. **Prefer semantic color tokens** (`bg-block`, `text-body`, `text-primary`, …)
   over ad-hoc `bg-gray-*`. Tokens are wired in `tailwind.config.ts` and backed
   by the CSS variables in `src/util/theme-colors.ts`.

## Current leaf inventory

**Containers (`ui/containers/`) — layout**

| Component | Responsibility |
|---|---|
| `Stack` | Flex container; owns `gap` + optional block margins (`mt`/`mb`); `as` for `ul`/`section`/etc. |
| `MetricGrid` | Responsive grid for metric cells; `columns` presets + `gap`. |
| `SplitColumns` | Two-column responsive split (`lg:w-1/2` halves) with a `gap` variant. |

**Sections (`ui/sections/`) — surfaces & report chrome**

| Component | Responsibility |
|---|---|
| `CardSection` | Dark report-section surface (`bg-gray-900 rounded-lg shadow-sm`) with padding presets. |
| `InlineCard` | Lightweight filled box (`bg-gray-800 rounded-md`); `padding` presets incl. `factor`; `as` for `li`. |
| `RelatedSectionsNav` | Top-bordered "more analyses" nav: heading + responsive grid of pill links. |
| `ReportArticleShell` | Outer `<article>` card chrome + schema.org microdata + optional `datePublished`; `padding` variant. |
| `ReportSectionHeader` | Bordered report header: title (+ `symbol`), exchange/score/date meta row, metadata slot, action link. |
| `SectionHeading` | In-article H2/H3 (`text-xl font-semibold text-color`); `size`/`weight`/`bordered`. |
| `ReportSection` | `<section>` with standardized vertical rhythm (`spacing`) + optional `itemProp`. |
| `ReportFooter` | "Last updated by KoalaGains" + category tag pills (`tone` vocabulary). |
| `Prose` | `prose prose-invert max-w-none` long-form body wrapper. |
| `MarkdownContent` | Renders sanitized markdown HTML with `summary`/`body`/`plain` style variants. |

**Typography (flat `ui/`)**

| Component | Responsibility |
|---|---|
| `Heading` | Semantic heading; `as` (h1–h6) decoupled from visual `size`/`weight`/`tone` (incl. `inherit`). |
| `Text` | Body/inline text; `size`/`weight`/`tone`/`leading` (+ `itemProp`). |

**Data / badges / feedback**

| Component | Responsibility |
|---|---|
| `MetricCell` | Label + value box; `sentiment` colors the value; `size`/`loading`. |
| `StatusBadge` | Status pill (`success`/`warning`/`neutral`/`archived`). |
| `PassFailBadge` | Green/red pass-fail pill. |
| `ScenarioOutlookBadge` | Probability / Direction / Timeframe scenario pills. |
| `AppliedFilterChip` | Removable filter chip. |
| `EmptyStateCard` | "No data" placeholder (`card` / `inline`). |

Plus the shadcn-style `Card`, `Input`, `Label`, `Tabs` already in
`components/ui/`. **Always grep the leaf layer + web-core before creating a new
leaf** (see "Reuse Before Creating" in the root `CLAUDE.md`).

## Enforcement

A `no-restricted-syntax` rule bans the `className` JSX attribute outside the
leaf layer:

- `warn` for `src/app/**` + `src/components/**`
- `off` for `src/components/ui/**` (later block wins)

It is configured in **both** ESLint configs on purpose: `.eslintrc.json` (the
config `next lint` actually consumes under the pinned ESLint 8, where flat config
is opt-in) and `eslint.config.mjs` (the flat config, ready for when ESLint/Next
default to flat). Keep them in sync until the configs are consolidated.

It is currently set to **`warn`** so the build stays green while the codebase is
migrated (CI does not run `--max-warnings`, and `next build` does not fail on
warnings). The rollout is a **per-directory ratchet to `error`**: as a directory
is fully migrated to leaves, move its glob into an `error`-level block.

Planned follow-ups (see [next-ui-cleanups.md](next-ui-cleanups.md)): consolidate
to a single ESLint config, bump `eslint-config-next` to match Next 15, and
optionally restrict the leaf layer to semantic tokens only.

## Process for future updates

**Adding a new styled pattern**
1. Grep `components/ui/**` and `shared/web-core/src/components/core/**` for an
   existing leaf. Reuse or extend (add a variant) before creating.
2. If genuinely new, add a leaf in `components/ui/` using the `cva` + `cn`
   pattern above, with literal class strings and a semantic prop API.
3. Update the inventory table in this doc.

**Migrating a high-level component to zero-Tailwind**
1. Read the component; list each `className` and which leaf concern it maps to
   (layout → `Stack`/`MetricGrid`; surface → `CardSection`/`InlineCard`;
   text → `Heading`/`Text`; badge → the badge leaves; etc.).
2. Replace inline Tailwind with leaf composition. Preserve exact spacing/colors
   (match the scale value to the original class — e.g. `mt-3` → `gap="md"`).
3. If a needed leaf or variant is missing, add it to the leaf layer first.
4. Confirm the file has **no `className`** left and `next lint` shows no
   `no-restricted-syntax` warnings for it.
5. Once a whole directory is clean, ratchet its glob to `error` in
   `eslint.config.mjs`.

**Verification (important in CI-only environments)**
Run `yarn lint`, `yarn prettier-check`, and `yarn compile` before pushing. If
dependencies can't be installed locally, rely on CI (GitHub Actions / Vercel)
for the authoritative type-check and lint, and review diffs manually.

## History / reference

This system grew out of the UI-consolidation work that first extracted the
badge / `EmptyStateCard` leaves (PR #1560) and then the layout/typography leaves
+ the enforcement rule. The supporting audits identified ~28 candidate leaves
spanning layout, typography, surfaces, tables, badges, controls, and feedback.
