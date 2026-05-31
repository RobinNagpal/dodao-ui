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
primitives already exist). Build these in `src/components/ui/` using `cva` + `cn`,
reusing web-core (`Table`, `Grid2–5Cols`, `Button`, `Input`, modals) where it fits.

| Leaf | Absorbs | Notable current call-sites |
|---|---|---|
| ⬜ `DataTable` (+ `TableHeaderCell` / `TableDataCell`) | striped/bordered table chrome, header cells, data cells | `EtfReturnsTable`, `EtfHoldings`, all `admin-v1` tables |
| ⬜ `TableSection` | table wrapper w/ border + header separator | report + admin tables |
| ⬜ `ListingCard` | dark card w/ header + item list | `CompactIndustryCard`, `EtfCategoryCard`, `SubIndustryCard` |
| ⬜ `MetadataBadge` | colored category/asset-class/provider/index pills | `EtfMetadataBadges` |
| ⬜ `ScoreDisplay` | score/rating badge w/ dynamic color | listing cards (10+) |
| ⬜ `SymbolBadge` | ticker/ETF symbol pill | listing cards |
| ⬜ `FilterButton` | active/inactive pill filter toggle | `BlogsGrid`, admin filters |
| ⬜ `LoadingSkeleton` / `SkeletonGrid` | `animate-pulse` placeholders | Suspense fallbacks, `SubIndustryCardSkeleton` |
| ⬜ `RelatedSectionsNav` | "jump to section" pill nav | `EtfRelatedSections` |
| ⬜ `ViewMoreLink` | right-aligned "View more →" link | `EtfHoldings`, `RelatedBlogs` |
| ⬜ `Divider` | horizontal separator | scattered |

### Header / container patterns (deferred — need design decisions)
These looked consolidatable but diverge in real styling, so confirm before
forcing them into one component (risk of visual drift):
- ⬜ `HeroHeader` — centered hero title+description (8 sites: `RelatedBlogs`,
  `ServiceNavigation`, `KoalaGainsPlatform`, …). Sites differ in font
  weight/size/color/margin — needs a normalization decision.
- ⬜ `SectionHeader` — bordered report-section header (3 structural sub-variants:
  plain `text-xl font-bold mb-4 pb-2 border-b`, flex-end with subtitle, flex-center
  with action link). Could be one component with a `layout` variant.
- ⬜ `PageHeader` — page title + description + right action (admin/listing pages).
- ⬜ `GridResponsive` / `PageContainer` — the `grid-cols-1 md:2 lg:3` and
  `mx-auto max-w-7xl px-6 lg:px-8` wrappers (exact-match, low-risk, but low value;
  do alongside a directory migration rather than as churn).

## 3. Migration order (high-level components → zero className)

Migrate worst-offenders / highest-reuse first; ratchet each directory to `error`
once clean.

| Target | Why | Status |
|---|---|---|
| `ticker-reportsv1/FinancialInfo`, `etf-reportsv1/EtfKeyMetrics` | proof slice | ✅ |
| `etf-reportsv1/**` report sections | high Tailwind density, shared leaves ready | ⬜ |
| `ticker-reportsv1/**` report sections | mirrors ETF | ⬜ |
| `admin-v1/missing-reports/page.tsx` | worst offender (~89 classNames) — needs `DataTable` first | ⬜ |
| `admin-v1/stock-scenarios`, `admin-v1/etf-scenarios`, `admin-v1/users` | table-heavy admin (~35–39) | ⬜ |
| stock/ETF listing cards (`CompactIndustryCard`, `EtfCategoryCard`, …) | needs `ListingCard`/`ScoreDisplay`/`SymbolBadge` | ⬜ |
| `blogs/**`, `home-page/**` | needs `HeroHeader`/`FilterButton`/`GridResponsive` | ⬜ |

## 4. Token adoption

- ⬜ Migrate existing leaves from ad-hoc `bg-gray-*` to the semantic tokens
  (`bg-block`, `text-body`, `text-primary`, …) where it does not change the
  rendered color, so theming is centralized. Do this deliberately (the tokens
  resolve to specific grays; verify no visual change before switching).
- ⬜ Audit ad-hoc theme classes already in the codebase (`text-color`,
  `bg-block-bg-color`) and fold them into the token set.

## 5. Verification discipline

The authoring environment often has no installed deps / restricted network, so
`yarn lint` / `yarn prettier-check` / `yarn compile` may not run locally. For
every UI change:
- Prefer verifying via CI (GitHub Actions / Vercel) — treat the CI run as the
  authoritative type-check, lint, and `prettier-check`.
- When migrating, diff against the previous version and map each removed class to
  the equivalent leaf prop to avoid visual drift.
- Keep migration PRs scoped to one directory so reviewers see the consolidation.
