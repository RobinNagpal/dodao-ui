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

All coding pattern files have been moved into the [code-knowledge/](code-knowledge/) folder. See [code-knowledge/AIKnowledge.md](code-knowledge/AIKnowledge.md) for the full index. Key files:

- **[code-knowledge/BackendInstructions.md](code-knowledge/BackendInstructions.md)** - Next.js API development patterns, error handling, Prisma operations.
- **[code-knowledge/UIIInstructions.md](code-knowledge/UIIInstructions.md)** - React/Next.js UI patterns, data fetching hooks, modals, loading states.
- **[code-knowledge/ui/](code-knowledge/ui/)** - UI component guidelines (buttons, forms, page structure, theme colors).
- **[code-knowledge/monorepo-structure.md](code-knowledge/monorepo-structure.md)** - Monorepo organization and dependency management.
- **[code-knowledge/build-process.md](code-knowledge/build-process.md)** - Build system, CI/CD pipeline, and deployment strategies.

### insights-ui/tariffs-functionality.md
Comprehensive documentation of the tariffs analysis system in the insights-ui project. Covers the AI-powered tariff report generation pipeline supporting 40+ industries, multi-step workflow from industry analysis to final conclusions, data structures for tariff impact assessment, UI components for report display and management, API endpoints for report generation, S3 storage integration, and development guidelines for extending the system. Includes detailed examples of report generation, company impact analysis, and admin interface usage.
