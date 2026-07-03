# Theme Token Migration (light/dark foundation)

Status tracker for migrating insights-ui off hardcoded light/dark color pairs
onto the semantic color tokens, so a light/dark theme **toggle** can be added
cleanly afterwards.

## Why

The app hardcodes light/dark color pairs (`bg-white dark:bg-gray-900`,
`text-gray-900 dark:text-white`, …) across the UI, which is why theming is
currently force-locked to dark. Consolidating every component onto the semantic
tokens defined in `tailwind.config.ts` + `src/util/theme-colors.ts` is the
prerequisite: once components read the tokens, flipping the CSS variables themes
the whole app with **no** per-component `dark:` variants.

Work is done **one commit per slice** so each is easy to review. Structural
colors map to the token whose current (dark) value is identical, so the live
dark UI is unchanged; dim greys/accents normalize to the token ramp.

## Token mapping (dark values preserved — exact hex)

| Old Tailwind | Hex (dark) | Token utility |
| --- | --- | --- |
| `gray-900` | `#111827` | `bg-bg` |
| `gray-800` | `#1f2937` | `bg-surface` |
| `gray-700` | `#374151` | `bg-surface-2` / `border-border` |
| `gray-600` | `#4b5563` | `bg-surface-3` / `border-surface-3` |
| `white` | `#ffffff` | `text-heading` |
| `gray-100` | `#f3f4f6` | `text-body` |
| `gray-300` / `gray-400` / `gray-500` | — | `text-muted` (normalized) |
| `indigo-*` accents | — | `text-primary` |
| `blue-*` links | — | `text-link` |

## Always left as-is (not part of the token system)

- **Semantic status colors** — gain/loss green/red, and blue / teal / amber /
  yellow / emerald / red / purple **badges & chips** (data colors, exempt like
  chips/badges per the leaf-component guidelines).
- **`text-white` on colored buttons/badges** — stays white (it belongs to the
  accent chip, not the structural palette).
- **Brand accents** — orange `#F59E0B` / `#F97316`.
- **Translucent overlays** with no token — `white/5`, `white/10` (ring / divide),
  `*/15`, `*/40` tinted borders/fills; popover `shadow` / `outline` `dark:`
  niceties.

## Covered so far

| Slice | Area | Files |
| --- | --- | --- |
| 1 | Global nav | `components/core/TopNav/{TopNav,MobileTopNav}.tsx` |
| 2 | Daily top-movers | `components/daily-stock-movers/*` (DateSelector, RelatedDailyMovers, StockMoverDetails, StockMoversTable, datepicker-custom.css) |
| 3 | Industry-tariff report | `components/industry-tariff/{chapter/chapter-section-page, cover/IndustryCoverBody, renderers/ExecutiveSummaryRenderer, renderers/ReportCoverRenderer}.tsx` |
| 4 | Stocks — not-found page | `app/stocks/[exchange]/[ticker]/not-found.tsx` |
| 5 | Stocks — action modals | `app/stocks/[exchange]/[ticker]/{AddEditFavouriteModal, AddEditNotesModal, ComparisonModal}.tsx` (chrome only) |
| 6 | Stocks — comparison page | `app/stocks/comparison/ComparisonPageClient.tsx` |

Within `app/stocks/**`, the ticker report pages (`page.tsx`,
`management-team/page.tsx`) needed **no** changes — their remaining colors are
all semantic score badges. The favourite/notes action buttons
(`FavouriteButton`, `NotesButton`, `StockSubPageActions`,
`MobileStockActionsMenu`) are **buttons** → exempt. `StockActionsAdminPanel`,
`EditStockDetailsModal`, and `create/TickerCreationPage` are **admin** → de-scoped.

> Note: covered files may still appear in a raw `grep dark:` — that's the
> intentionally-exempt status colors / overlays above, not un-migrated
> structural greys.

## Remaining

- `src/app/etfs/[exchange]/[etf]/*` report pages.
- `src/app/generate-ppt/*`, `src/app/invocations/page.tsx`,
  `src/app/prompts/[promptId]/invocations/page.tsx`, `src/app/ticker-reports/page.tsx`.
- `src/app/public-equitiesv1/*` forms (AddTickersForm, EditTickersForm, TickerFields).
- `src/components/ui/{input,tabs}.tsx` — shadcn leaves whose `dark:` variants are
  legitimate dual-theme handling; review **last**.

## Explicitly de-scoped (per product decision)

- `src/app/admin-v1/**` — admin-only screens.
- `src/components/presentations/**` — presentation builder.

## After the sweep

Reintroduce the light palette (`:root` values) + a `next-themes` toggle. Because
components read tokens, this is a small, central change.
