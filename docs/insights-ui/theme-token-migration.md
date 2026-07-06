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

Work is done **one commit per slice** so each is easy to review. **Every**
migrated color maps to the token whose current (dark) value is *identical*, so
the live dark UI is **byte-for-byte unchanged**. Greys are NOT collapsed onto a
single `text-muted` — each Tailwind grey keeps a distinct exact-hex token so the
visual hierarchy (and any future light theme) is preserved.

## Token mapping (dark values preserved — exact hex)

| Old Tailwind | Hex (dark) | Token utility |
| --- | --- | --- |
| `gray-900` | `#111827` | `bg-bg` |
| `gray-800` | `#1f2937` | `bg-surface` |
| `gray-700` | `#374151` | `bg-surface-2` / `border-border` |
| `gray-600` (bg/border) | `#4b5563` | `bg-surface-3` / `border-surface-3` |
| `white` | `#ffffff` | `text-heading` |
| `gray-100` | `#f3f4f6` | `text-body` |
| `gray-300` (text) | `#d1d5db` | `text-muted-1` |
| `gray-400` (text) | `#9ca3af` | `text-muted-2` |
| `gray-500` (text) | `#6b7280` | `text-muted-3` |
| `gray-600` (text) | `#4b5563` | `text-muted-4` |
| `gray-200` (border/divide) | `#e5e7eb` | `border-hairline` / `divide-hairline` |
| `gray-300` (border) | `#d1d5db` | `border-muted-1` |
| `blue-400` / `blue-300` (link) | `#60a5fa` / `#93c5fd` | `text-link-blue` / `text-link-blue-hover` |
| `indigo-*` accents | — | `text-primary` (single dark shade `indigo-400`; approved) |

> `text-muted` (`#cbd5e1`, slate-300) is a **separate, pre-existing** token
> (~120 call-sites) — it is left untouched. The `text-muted-1..4` ramp above is
> the *exact-Tailwind* grey ramp used where dark fidelity matters. For a
> dark→light theme swap later, only these CSS-variable values change.

### Dark-value tie-breaking

Where a class had a `dark:` variant, the **dark** value is what's preserved
(e.g. `text-gray-500 dark:text-gray-400` → `text-muted-2`;
`text-gray-400 dark:text-gray-500` → `text-muted-3`;
`border-gray-200 dark:border-gray-700` → `border-border`). Light-authored
hairlines with **no** `dark:` variant kept their light value
(`border-gray-200` → `border-hairline`). Translucent nav hovers
(`dark:hover:bg-white/5`) are restored to `hover:bg-white/5`, not solid
`surface-2`.

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
| 7 | ETFs | `app/etfs/[exchange]/[etf]/{EtfActions, AddEditEtfFavouriteModal}.tsx` |
| 8 | Stock-scenarios / stocks-filtered | `app/stock-scenarios/[slug]/detailed-analysis/page.tsx` |
| 9 | ETF sub-surfaces | `app/etf-scenarios/[slug]/detailed-analysis/page.tsx` (etfs-filtered / etf-favourites / etf-investors had no hardcoded colors) |
| 10 | **Dark-fidelity fix** (all slices 1–9) | Split the earlier `text-muted` grey-collapse into the exact `text-muted-1..4` ramp; restored light `border-hairline`/`border-muted-1` hairlines, the `text-link-blue`/`text-link-blue-hover` blue link, and `hover:bg-white/5` nav hovers — so dark is byte-for-byte identical. Tokens added in `util/theme-colors.ts` + `tailwind.config.ts`. |

Within `app/stocks/**`, the ticker report pages (`page.tsx`,
`management-team/page.tsx`) needed **no** changes — their remaining colors are
all semantic score badges. The favourite/notes action buttons
(`FavouriteButton`, `NotesButton`, `StockSubPageActions`,
`MobileStockActionsMenu`) are **buttons** → exempt. `StockActionsAdminPanel`,
`EditStockDetailsModal`, and `create/TickerCreationPage` are **admin** → de-scoped.

Within `app/etfs/**`, the report/listing pages were already token-based (their
only remaining `dark:` variants are semantic category badges), and the ETF
favourite-toggle buttons (`EtfFavouriteButton`, `EtfSubPageActions`,
`MobileEtfActionsMenu`) are **buttons** → exempt. `app/stocks-filtered/**` had no
hardcoded colors.

> Note: covered files may still appear in a raw `grep dark:` — that's the
> intentionally-exempt status colors / overlays above, not un-migrated
> structural greys.

## Remaining

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
