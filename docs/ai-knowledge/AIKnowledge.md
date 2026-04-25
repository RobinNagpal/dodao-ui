# AI Knowledge Base

This directory contains comprehensive development guidelines, coding patterns, project documentation, and planning resources for AI-assisted development across all projects in the DoDAO UI repository.

## Directory Structure

### [code-knowledge/](code-knowledge/)
Common coding patterns, conventions, and best practices used across the monorepo. Acts as an index pointing to the pattern files in this directory. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md).

### [projects/](projects/)
Project-specific documentation including features, requirements, and todos. See [projects/AIKnowledge.md](projects/AIKnowledge.md).
- **[projects/insights-ui/](projects/insights-ui/)** - KoalaGains financial insights platform. See [projects/insights-ui/AIKnowledge.md](projects/insights-ui/AIKnowledge.md).
- **[projects/simulations/](projects/simulations/)** - Business case study simulation platform. See [projects/simulations/AIKnowledge.md](projects/simulations/AIKnowledge.md).

### [insights-ui/](insights-ui/)
Topical reference docs for the Insights-UI (KoalaGains) app — patterns, prompts, runbooks, and analysis methodology that aren't tied to a single feature spec. See [insights-ui/AIKnowledge.md](insights-ui/AIKnowledge.md). Subareas: ETF analysis pipeline / report generation, ETF prompts (per-category source-of-truth text), ETF prompt-improvement review notes, equity downside-analysis framework and case studies, plus tariffs functionality and use cases.

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

- **ETF analysis pipeline** — [insights-ui/etf-analysis/AIKnowledge.md](insights-ui/etf-analysis/AIKnowledge.md) covers [generate-etf-reports.md](insights-ui/etf-analysis/generate-etf-reports.md) (how to enqueue ETF reports via the `etfs:trigger` script, with the 50-ETF cap and 10s per-ETF delay). ETF market scenarios live in the `EtfScenario` Prisma model and are managed through `/admin-v1/etf-scenarios`.
- **Scenario authoring** — [insights-ui/scenario-authoring.md](insights-ui/scenario-authoring.md) — drafting workflow for new stock / ETF market scenarios: scratch files under `/tmp/scenarios/{stocks,etfs}/<slug>.md`, required content template (dates, magnitude, per-industry impact numbers), and per-stock bullet syntax the importer parses.
- **ETF prompts** — [insights-ui/etf-prompts/AIKnowledge.md](insights-ui/etf-prompts/AIKnowledge.md) — source-of-truth prompt text for each ETF analysis category plus the prompt-finalization approach.
- **ETF prompt improvement** — [insights-ui/etf-prompt-improvement/AIKnowledge.md](insights-ui/etf-prompt-improvement/AIKnowledge.md) — iterative review notes from the prompt-tuning loop.
- **Downside analysis** — [insights-ui/downside-analysis/AIKnowledge.md](insights-ui/downside-analysis/AIKnowledge.md) — equity downside / drawdown framework with the 31-stock case study.
- **Tariffs functionality** — [insights-ui/tariffs-functionality.md](insights-ui/tariffs-functionality.md), [tariff-usecases.md](insights-ui/tariff-usecases.md), [new-tariff-features.md](insights-ui/new-tariff-features.md).
