# AI Knowledge Base

This directory contains comprehensive development guidelines, coding patterns, project documentation, and planning resources for AI-assisted development across all projects in the DoDAO UI repository.

## Directory Structure

### [code-knowledge/](code-knowledge/)
Common coding patterns, conventions, and best practices used across the monorepo. Acts as an index pointing to the pattern files in this directory. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md).

### [insights-ui/](insights-ui/)
KoalaGains (Insights-UI) topical knowledge — ETF + stock pipelines, prompts, tariffs subsystem, and the active task lists that drive ongoing work. See [insights-ui/AIKnowledge.md](insights-ui/AIKnowledge.md).

### [projects/](projects/)
Per-project documentation and task lists for the other apps in the monorepo: `simulations/`, `defi-alerts/`, `x-news/`. See [projects/AIKnowledge.md](projects/AIKnowledge.md).

---

## File Descriptions

All coding pattern files live in the [code-knowledge/](code-knowledge/) folder. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md) for the full index. Key areas:

- **Backend** - [BackendInstructions.md](code-knowledge/BackendInstructions.md), [AddingAPIRoutes.md](code-knowledge/AddingAPIRoutes.md), [ErrorHandling.md](code-knowledge/ErrorHandling.md), [TypeDefinitions.md](code-knowledge/TypeDefinitions.md), [PrismaTypesAndMigrations.md](code-knowledge/PrismaTypesAndMigrations.md), [Caching.md](code-knowledge/Caching.md)
- **UI** - [UIIInstructions.md](code-knowledge/UIIInstructions.md), [Loaders.md](code-knowledge/Loaders.md), [ServerSideComponents.md](code-knowledge/ServerSideComponents.md), [SpacingRecommendations.md](code-knowledge/SpacingRecommendations.md)
- **UI Components** - [ui/](code-knowledge/ui/) (buttons, forms, page structure, theme colors)
- **Styling** - [HowThemeAndCssWorks.md](code-knowledge/HowThemeAndCssWorks.md), [HowImageUploadWorks.md](code-knowledge/HowImageUploadWorks.md)
- **Architecture** - [monorepo-structure.md](code-knowledge/monorepo-structure.md), [build-process.md](code-knowledge/build-process.md)

### Insights-UI topical knowledge

See [insights-ui/AIKnowledge.md](insights-ui/AIKnowledge.md) for the full index. Highlights:

- **ETF analysis pipeline + scenarios** — [insights-ui/etf-analysis/AIKnowledge.md](insights-ui/etf-analysis/AIKnowledge.md). Covers `etfs:trigger` (50-ETF cap, 10s per-ETF delay) and the ETF Scenarios system (`EtfScenario` + `EtfScenarioEtfLink` Prisma models, the 5-winner / 5-loser / 5-most-exposed convention, admin UI + automation upsert paths).
- **Scenario authoring** — [insights-ui/scenario-authoring.md](insights-ui/scenario-authoring.md) — drafting workflow for new stock / ETF market scenarios: scratch files under `/tmp/scenarios/{stocks,etfs}/<slug>.md`, required content template, and per-stock bullet syntax the importer parses.
- **Stock analysis** — [insights-ui/stock-analysis/AIKnowledge.md](insights-ui/stock-analysis/AIKnowledge.md) — `yarn stocks:add`, `yarn stocks:trigger`, and the `StockScenario` admin surface.
- **ETF prompts** — [insights-ui/etf-prompts/AIKnowledge.md](insights-ui/etf-prompts/AIKnowledge.md) — source-of-truth prompt text per category plus the prompt-finalization approach.
- **ETF prompt improvement** — [insights-ui/etf-prompt-improvement/AIKnowledge.md](insights-ui/etf-prompt-improvement/AIKnowledge.md) — iterative review notes from the prompt-tuning loop.
- **Tariffs** — [insights-ui/tariffs/AIKnowledge.md](insights-ui/tariffs/AIKnowledge.md) — pipeline + use-case catalog. Backlog of next-up tariff features lives in [insights-ui/tasks/optional_tariff_features.md](insights-ui/tasks/optional_tariff_features.md).
- **Active task lists** — [insights-ui/tasks/AIKnowledge.md](insights-ui/tasks/AIKnowledge.md) — open + closed work for ETFs, stocks, tariffs, scenarios, and the prompt-tuning loop.
