# AI Knowledge Base

This directory contains comprehensive development guidelines, coding patterns, project documentation, and planning resources for AI-assisted development across all projects in the DoDAO UI repository.

## Directory Structure

### [code-knowledge/](code-knowledge/)
Common coding patterns, conventions, and best practices used across the monorepo. Acts as an index pointing to the pattern files in this directory. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md).

### [projects/](projects/)
Project-specific documentation including features, requirements, and todos. See [projects/AIKnowledge.md](projects/AIKnowledge.md).
- **[projects/insights-ui/](projects/insights-ui/)** - KoalaGains financial insights platform. See [projects/insights-ui/AIKnowledge.md](projects/insights-ui/AIKnowledge.md).
- **[projects/simulations/](projects/simulations/)** - Business case study simulation platform. See [projects/simulations/AIKnowledge.md](projects/simulations/AIKnowledge.md).

---

## File Descriptions

All coding pattern files live in the [code-knowledge/](code-knowledge/) folder. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md) for the full index. Key areas:

- **Backend** - [BackendInstructions.md](code-knowledge/BackendInstructions.md), [AddingAPIRoutes.md](code-knowledge/AddingAPIRoutes.md), [ErrorHandling.md](code-knowledge/ErrorHandling.md), [TypeDefinitions.md](code-knowledge/TypeDefinitions.md), [PrismaTypesAndMigrations.md](code-knowledge/PrismaTypesAndMigrations.md), [Caching.md](code-knowledge/Caching.md)
- **UI** - [UIIInstructions.md](code-knowledge/UIIInstructions.md), [Loaders.md](code-knowledge/Loaders.md), [ServerSideComponents.md](code-knowledge/ServerSideComponents.md), [SpacingRecommendations.md](code-knowledge/SpacingRecommendations.md)
- **UI Components** - [ui/](code-knowledge/ui/) (buttons, forms, page structure, theme colors)
- **Styling** - [HowThemeAndCssWorks.md](code-knowledge/HowThemeAndCssWorks.md), [HowImageUploadWorks.md](code-knowledge/HowImageUploadWorks.md)
- **Architecture** - [monorepo-structure.md](code-knowledge/monorepo-structure.md), [build-process.md](code-knowledge/build-process.md)

### insights-ui/tariffs-functionality.md
Comprehensive documentation of the tariffs analysis system in the insights-ui project. Covers the AI-powered tariff report generation pipeline supporting 40+ industries, multi-step workflow from industry analysis to final conclusions, data structures for tariff impact assessment, UI components for report display and management, API endpoints for report generation, S3 storage integration, and development guidelines for extending the system. Includes detailed examples of report generation, company impact analysis, and admin interface usage.
