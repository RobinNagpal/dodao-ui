# Next UI Cleanups (insights-ui leaf-component rollout)

Backlog for continuing the "Tailwind only in the leaf layer" migration. See
[ui-leaf-component-system.md](ui-leaf-component-system.md) for the architecture,
authoring pattern, and the leaf inventory this builds on.

Status legend: ⬜ not started · 🟡 in progress · ✅ done

## 1. Enforcement infrastructure

- ⬜ **Consolidate ESLint config.** The repo has both `insights-ui/.eslintrc.json`
  (`extends: next/core-web-vitals`) and `insights-ui/eslint.config.mjs` (flat
  config). The `className` guardrail currently lives in **both** (the legacy
  `.eslintrc.json` is the one `next lint` consumes under ESLint 8; the flat
  config is inert until ESLint/Next default to flat). Consolidate to the flat
  config as the single source of truth and delete `.eslintrc.json` — **preserve
  the `no-restricted-syntax` rule when doing so** — to remove dual-config drift.
- ⬜ **Bump `eslint-config-next`.** It is pinned at `13.3.4` while Next is
  `15.5.7`; bump to match so the shared rules and flat-config support are correct.
  Do this together with the consolidation.
- ⬜ **Per-directory ratchet to `error`.** The `no-restricted-syntax` className
  rule is currently `warn`. As each directory is fully migrated, move its glob
  into an `error`-level block in `eslint.config.mjs` (ordered AFTER the broad
  `warn` block so it wins). Track progress in the table in §3.
- ⬜ **CI signal for the ratchet.** `next build` does not fail on warnings; add a
  dedicated `eslint --max-warnings=0` step scoped to already-`error` directories
  (or a steadily-decreasing `--max-warnings N`) so regressions are caught.
- ⬜ **(Optional) restrict the leaf layer to semantic tokens.** Once leaves use
  the registered tokens, add a lint guard (e.g. `no-restricted-syntax` on raw
  hex / `bg-gray-*` inside `components/ui/**`) to push color decisions through
  the token vocabulary.

## 2. Leaf components still to build

From the leaf-taxonomy audit (~28 total; badges, empty state, layout/typography
primitives already exist). Build these in `src/components/ui/{containers,sections}/`
using `cva` + `cn`, reusing web-core (`Table`, `Grid2–5Cols`, `Button`, `Input`,
modals) where it fits.

**Report-chrome containers/sections — DONE** (built + proven via the
`TickerCategoryReport` / `EtfCategoryReport` migration): `ReportArticleShell`,
`ReportSectionHeader`, `SectionHeading`, `ReportSection`, `ReportFooter`, `Prose`,
`MarkdownContent` (`ui/sections/`), and `SplitColumns` (`ui/containers/`). `Stack`
gained an `as` prop; `InlineCard` gained a `factor` padding + `as`; `Heading`/`Text`
gained `inherit`/`theme` tones.

**Still to build:**

| Leaf | Absorbs | Notable current call-sites |
|---|---|---|
| ⬜ `Icon` | heroicon sizing (`h-6 w-6 … flex-shrink-0`) | factor rows in the CategoryReports (the only `className` left there) |
| ⬜ `DataTable` (+ `TableHeaderCell` / `TableDataCell`) | striped/bordered table chrome, header cells, data cells | `EtfReturnsTable`, `EtfHoldings`, all `admin-v1` tables |
| ⬜ `TableSection` | table wrapper w/ border + header separator | report + admin tables |
| ⬜ `ListingCard` | dark card w/ header + item list | `CompactIndustryCard`, `EtfCategoryCard`, `SubIndustryCard` |
| ⬜ `MetadataBadge` | colored category/asset-class/provider/index pills | `EtfMetadataBadges` |
| ⬜ `ScoreDisplay` | score/rating badge w/ dynamic color | listing cards (10+) |
| ⬜ `SymbolBadge` | ticker/ETF symbol pill | listing cards |
| ⬜ `FilterButton` | active/inactive pill filter toggle | `BlogsGrid`, admin filters |
| ⬜ `LoadingSkeleton` / `SkeletonGrid` | `animate-pulse` placeholders | Suspense fallbacks, `SubIndustryCardSkeleton` |
| ✅ `RelatedSectionsNav` | "jump to section" pill nav | `EtfRelatedSections` (done); stock-side `TickerRelatedSections` (todo) |
| ⬜ `ViewMoreLink` | right-aligned "View more →" link | `EtfHoldings`, `RelatedBlogs` |
| ⬜ `Divider` | horizontal separator | scattered |

### Header / container patterns (deferred — need design decisions)
These looked consolidatable but diverge in real styling, so confirm before
forcing them into one component (risk of visual drift):
- ⬜ `HeroHeader` — centered hero title+description (8 sites: `RelatedBlogs`,
  `ServiceNavigation`, `KoalaGainsPlatform`, …). Sites differ in font
  weight/size/color/margin — needs a normalization decision.
- ✅ `SectionHeading` (the in-article `text-xl font-semibold text-color mb-3` H2,
  with a `bordered`/`weight`/`size` variant set) — built. The page-level bordered
  "Summary Analysis" header on the main detail pages can reuse it (`bordered`).
- ⬜ `PageHeader` — page title + description + right action (admin/listing pages).
- ⬜ `GridResponsive` — the `grid-cols-1 md:2 lg:3` wrapper. (No `PageContainer`:
  the gutter already lives in web-core `PageWrapper`/`MainContainer` — do not
  duplicate it. `Competition.tsx` re-rolls its own gutter and should be normalized
  onto `PageWrapper` when it migrates.)

## 3. Migration order (high-level components → zero className)

Migrate worst-offenders / highest-reuse first; ratchet each directory to `error`
once clean.

| Target | Why | Status |
|---|---|---|
| `ticker-reportsv1/FinancialInfo`, `etf-reportsv1/EtfKeyMetrics` | proof slice | ✅ |
| `TickerCategoryReport` + `EtfCategoryReport` | shared report chrome (article/header/section/footer) — kills the ~95% duplication | ✅ (zero className except heroicons → pending `Icon` leaf) |
| `Competition` + `EtfCompetitionFullView` | re-roll the same shell; normalize gutter (`PageWrapper`) + padding when migrating | 🟡 `Competition` ✅ (composes `ReportArticleShell`/`ReportSectionHeader`/`ReportSection`/`SplitColumns`/`Prose`/`MarkdownContent`/`ReportFooter`, dropped its redundant gutter); `EtfCompetitionFullView` ⬜ |
| `management-team/page.tsx`, `daily-stock-movers/StockMoverDetails.tsx` | hand-roll the same shell a 3rd/4th time | 🟡 `management-team` ✅ (`ReportArticleShell` + `ReportSection` + `SectionHeading` + `ReportFooter`); `StockMoverDetails` ⬜ |
| `etf-reportsv1/**` report sections | high Tailwind density, shared leaves ready | 🟡 `EtfFinancialInfo`, `EtfRelatedSections`, `EtfHoldings` (→`CardSection`) done; `EtfMorInfo`/tables need `DataTable`/`ListingCard` |
| `ticker-reportsv1/**` report sections | mirrors ETF | 🟡 `CompetitionChartSection`, `SimilarTickers` → `CardSection`/`SectionHeading`/`SplitColumns`; rest ⬜ |
| Main detail pages + sub-pages (`stocks/[…]/page.tsx`, `etfs/[…]/page.tsx`, `holdings`, `financial-data`) | composed their own surfaces/footers/headings | ✅ skeletons + summary cards → `CardSection`; footers → `ReportFooter`; splits → `SplitColumns`; headings → `SectionHeading`; section rhythm → `ReportSection` |
| `admin-v1/missing-reports/page.tsx` | worst offender (~89 classNames) — needs `DataTable` first | ⬜ |
| `admin-v1/stock-scenarios`, `admin-v1/etf-scenarios`, `admin-v1/users` | table-heavy admin (~35–39) | ⬜ |
| stock/ETF listing cards (`CompactIndustryCard`, `EtfCategoryCard`, …) | needs `ListingCard`/`ScoreDisplay`/`SymbolBadge` | ⬜ |
| `blogs/**`, `home-page/**` | needs `HeroHeader`/`FilterButton`/`GridResponsive` | ⬜ |

## 4. Token adoption / color externalization (PR #1564)

The color system is now tokenized (see the "Color system" section in
`ui-leaf-component-system.md`). Rollout status:

- ✅ Token foundation: retuned 3-tier palette in `theme-colors.ts` +
  `tailwind.config.ts` tokens + shadcn-name bridge.
- ✅ Leaf layer tokenized (surfaces/text/border → tokens) and chips consolidated
  into the 6-tone `badgeTone` vocabulary (PassFailBadge, StatusBadge,
  ReportFooter, header exchange pill; EmptyStateCard CTA → `bg-primary`).
- 🟡 **Remaining chips:** `EtfMetadataBadges` ✅ (Asset Class→`info`, Group→`neutral`,
  Category/Index→`accent`, Provider→`success`). Still TODO: `ScenarioOutlookBadge`
  (8 ad-hoc tones) and `AppliedFilterChip` (amber gradient → `warning`).
- 🟡 **Component migrations (report pages → tokens + leaves):** report chrome on
  the two main `page.tsx`, the ETF `holdings`/`financial-data` sub-pages,
  `Competition`, `management-team`, `CompetitionChartSection`, `SimilarTickers`,
  and `EtfHoldings` now compose the shared containers/sections
  (`CardSection`/`ReportArticleShell`/`ReportSectionHeader`/`ReportSection`/
  `SplitColumns`/`SectionHeading`/`ReportFooter`) — hand-rolled `bg-surface`
  surfaces, duplicate footers (incl. raw blue/purple pills), and ad-hoc headings
  are gone there. Still TODO: `EtfCompetitionFullView`, `StockMoverDetails`,
  `EtfMorInfo`, charts (inline hex → token map), and the remaining hand-written
  headings.
- ⬜ **Listing / index pages (`app/etfs/**`, `app/stocks/**` excluding detail):**
  a 5-agent audit found the index pages are thin wrappers but their shared
  layout/grid/card components hand-roll structure: `EtfPageLayout` /
  `IndustryWithStocksPageLayout` (raw `text-white` H1 + inline-hex `text-[#E5E7EB]`
  body), the amber-gradient "Show all" pill (`from-[#F59E0B] to-[#FBBF24]`,
  duplicated 5×), an ad-hoc `grid-cols-1 sm:2 md:3 lg:4` listing grid (3×) and a
  `1-2-3` grid (3×), and the `bg-block-bg-color`/`border-color`/`divide-color`/
  `heading-color` legacy aliases across `EtfCategoryCard`/`SubIndustryCard`/
  `CompactEtfGroupingCard`/`CompactSubIndustryCard`/`AllStocksGridForCountry`.
  Needs new leaves first: a shared accent/"show all" pill, a card-grid leaf (extend
  `MetricGrid` `columns` or add one), and a listing-card surface — then sweep the
  aliases to `bg-surface`/`border-border`/`text-heading`.
- ⬜ **New leaves needed by those migrations:** `SummaryCard`, `ScoreChip`
  (primary `x/total` pill), `CardSection` `chart` padding variant, `DeferredBlock`
  (`content-visibility`), a ticker-side `CompetitionQuadrantWithLegend`, a
  sentiment text/badge leaf (verdict + price-change), and `ReportSectionHeader`/
  `ReportFooter` slot extensions (sentiment meta, `verb`/`timeItemProp`).
- ⬜ **Legacy vocabulary sweep:** migrate remaining `text-color`/`border-color`/
  `block-bg-color` SCSS classes → `text-body`/`border-border`/`bg-surface`.

### Typography consistency (same PR)
Headings/body text are inconsistent (6 h1 variants, h2 `font-bold`+`border-gray-700`
vs `font-semibold`+`border-border`, h3 `text-gray-100 mb-4` vs `text-body mb-3`, 3
muted tokens). Canonicalize via the leaves:
- h1 report title → `text-2xl md:text-3xl font-bold text-body mb-2` (a title leaf/variant).
- h2 section → `SectionHeading` (default), bordered → `SectionHeading bordered`.
- h3 sub → `SectionHeading size="sm"` / `Heading as="h3" size="lg"`.
- body/muted → `Text` tones (`body`/`muted`); markdown → `MarkdownContent`.

### Out of scope (separate follow-ups, flagged by the audit)
- `markdown.scss` hardcodes a *light* GitHub theme; report bodies render on dark.
- `@tailwindcss/typography` is not installed, so `prose prose-invert` is inert.

## 5. Verification discipline

The authoring environment often has no installed deps / restricted network, so
`yarn lint` / `yarn prettier-check` / `yarn compile` may not run locally. For
every UI change:
- Prefer verifying via CI (GitHub Actions / Vercel) — treat the CI run as the
  authoritative type-check, lint, and `prettier-check`.
- When migrating, diff against the previous version and map each removed class to
  the equivalent leaf prop to avoid visual drift.
- Keep migration PRs scoped to one directory so reviewers see the consolidation.
