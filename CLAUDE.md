# CLAUDE Development Guidelines

## Overview

Development workflow guidelines for the DoDAO UI monorepo. For full architecture and project context, see [AIKnowledge.md](AIKnowledge.md).

## Required Workflow (Before and After Coding)

### 1) Run Code Quality Checks

Before committing changes, run checks for the project you worked on:

```bash
yarn lint
yarn prettier-check
```

### 2) Fix Issues (If Needed)

If checks fail, use the auto-fix commands:

```bash
yarn lint-fix
yarn prettier-fix
```

### 3) Verify Build

Confirm the project builds successfully before committing:

```bash
yarn build
```

**Important:** Do not proceed until the build completes without errors.

### 4) Run Prettier Fix (Mandatory)

Before committing, **always** run `yarn prettier-fix` from the relevant project directory to auto-format all changed files:

```bash
yarn prettier-fix
```

This must be done even if `yarn prettier-check` passes, to guarantee consistent formatting.

### 5) Commit and Push Changes (Mandatory)

After checks and build pass, commit and push your changes:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin your-branch-name
```

### 6) End-of-Task Rule  (Mandatory)

**At the end of every completed task, Claude Code must commit and push the code if the current branch is *not* `main` or `master`.**
(Do not commit directly to `main`/`master` unless explicitly instructed.)

AT ALL TIMES ALL THE CODE SHOULD BE CHECKEDIN AND PUSHED (Mandatory)

### 7) Monitor CI / Deployment Status

After pushing:

1. Check **GitHub Actions** for build/CI status
2. Confirm all checks pass
3. If deployed via **Vercel**, verify deployment/build logs there as well

### 8) If Build Fails

Check logs and fix issues:

* **GitHub Actions logs** (failed workflow/job steps)
* **Vercel build/runtime logs** (if applicable)

Common failure areas:

* Linting
* TypeScript types
* Build/compile errors
* Tests
* Missing/incorrect environment variables

---

# DoDAO UI Monorepo (Projects Overview)

This repository contains multiple UI apps and services in the DoDAO ecosystem.

### Simulations

Business case simulation platform for Marketing, Finance, HR, Operations, and Economics, with role-based access (Students, Instructors, Admins).

### Insights-UI (KoalaGains)

AI-powered financial insights and stock analysis platform (value investing, industry reports, tariff analysis, global markets).

### Academy-UI

Blockchain and DeFi learning platform.

### News-Reader

News aggregation and reading platform.

### 🖱️ Clickable-Demos

Interactive demos for workflows and features.

### DeFi-Alerts

Alerting system for DeFi protocols and crypto markets.

### Base-UI

Shared UI components and design system.

### AI-Agents

AI agents and automation tools.

### X-News-UI

Social/news content management interface.

### Shared

Common utilities, components, and libraries used across projects.

---

## AI Knowledge Base (MUST READ)

**Before starting any coding or knowledge task, always check `docs/ai-knowledge/`.**
This is the main source for coding patterns, project requirements, and implementation plans.

### Code Knowledge

Use **`docs/ai-knowledge/code-knowledge/`** for shared coding conventions:

* Backend instructions (Next.js API patterns)
* UI instructions (React/Next.js patterns)
* Component guidelines (buttons, forms, layout, theming)
* Architecture (monorepo structure, shared packages, build process)

### Project Knowledge

Use **`docs/ai-knowledge/projects/`** for project-specific docs. Each project may include:

* `features/`
* `requirements.md`
* `requirements/`
* `todos.md`
* `todos/`
* `AIKnowledge.md`

Currently documented:

* `docs/ai-knowledge/projects/insights-ui/`
* `docs/ai-knowledge/projects/simulations/`

### How to Use the Knowledge Base

1. **Before coding:** Read relevant `code-knowledge` docs
2. **Before implementing a feature:** Review the project’s `features/`, `requirements.md`, and `todos.md`
3. **When planning work:** Add detailed plans to `todos/` and update `todos.md`
4. **When defining requirements:** Add specs to `requirements/` and update `requirements.md`
5. **After completing features:** Document them in `features/`

Each project may also have a top-level `AIKnowledge.md` (e.g., `simulations/AIKnowledge.md`, `insights-ui/AIKnowledge.md`).


## Additional Resources

* `docs/ai-knowledge/AIKnowledge.md` (full index)
* `docs/ai-knowledge/code-knowledge/AIKnowledge.md` (coding patterns index)
* `docs/ai-knowledge/projects/AIKnowledge.md` (project docs index)
* `docs/ai-knowledge/code-knowledge/build-process.md`
* `docs/ai-knowledge/code-knowledge/monorepo-structure.md`

---

## Best Practices

1. Test locally before pushing
2. Use descriptive commit messages
3. Keep commits focused (one feature/fix per commit when possible)
4. Review your changes before PR
5. Monitor build status after pushing
6. Fix failures quickly to avoid blocking others
7. Always commit and push your changes. Always. Always (Mandatory)

---

# Claude Commands

Refer to `docs/ClaudeCliReference.md` for Claude Code command usage.
