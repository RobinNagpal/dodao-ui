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

### 4) Commit and Push Changes (Mandatory)

After checks and build pass, commit and push your changes:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin your-branch-name
```

### 5) End-of-Task Rule  (Mandatory)

**At the end of every completed task, Claude Code must commit and push the code if the current branch is *not* `main` or `master`.**
(Do not commit directly to `main`/`master` unless explicitly instructed.)

AT ALL TIMES ALL THE CODE SHOULD BE CHECKEDIN AND PUSHED (Mandatory)

### 6) Monitor CI / Deployment Status

After pushing:

1. Check **GitHub Actions** for build/CI status
2. Confirm all checks pass
3. If deployed via **Vercel**, verify deployment/build logs there as well

### 7) If Build Fails

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

## Worktree-Based Workflow (MANDATORY)

All changes MUST happen in git worktrees, never on the main repo checkout directly.

- **Main repo (read-only):** `/home/ubuntu/.openclaw/workspace-insights-ui/dodao-ui`
- **Worktree base dir:** `/home/ubuntu/.openclaw/workspace-insights-ui/worktrees/`
- **Convention:** worktree directory name = branch name (e.g., `worktrees/fix-chart-layout/` → branch `fix-chart-layout`)

Every task must follow this sequence:

### Step 1: Worktree Cleanup & Selection

Before starting work, manage worktrees from the **main repo**:

1. **CLEANUP** — List all worktrees (`git worktree list`). For each worktree (not the main one):
   - Check if its branch has a merged PR (`gh pr list --head <branch> --state merged`).
   - If PR is merged and no uncommitted changes exist, remove it (`git worktree remove <path>` then `git branch -d <branch>`).
   - Report what was cleaned.

2. **ENSURE MAIN IS UP TO DATE** — Before creating any worktree:
   ```bash
   git checkout main && git pull origin main
   ```

3. **SELECT OR CREATE** — For the task at hand:
   - If an existing worktree matches this task, use its path and branch name.
   - Otherwise, pick a descriptive branch name and create the worktree **always from main**:
     ```bash
     git worktree add /home/ubuntu/.openclaw/workspace-insights-ui/worktrees/<branch-name> -b <branch-name> main
     ```
     (The trailing `main` ensures the new branch starts from the main branch, ALWAYS.)
   - Report the chosen worktree path and branch name.

4. **REPORT** — Write result to `/tmp/claude-code-worktree-insights.md`:
   - Cleaned worktrees (if any)
   - Selected worktree path
   - Branch name
   - Whether it is new or existing
   - Full list of all currently open worktrees (output of `git worktree list`)

5. **NOTIFY** — Run:
   ```bash
   openclaw system event --text "Worktree ready: <branch-name>" --mode now
   ```

### Step 2: Do Work in the Worktree

After reading `/tmp/claude-code-worktree-insights.md`, perform work in the **selected worktree** directory.

When completely finished:

1. Commit all changes to the worktree branch.
2. Push: `git push -u origin <BRANCH_NAME>`
3. If no PR exists for this branch, create one: `gh pr create --base main --head <BRANCH_NAME> --title "..." --body "..."`
4. Run `git worktree list` (from the main repo at `/home/ubuntu/.openclaw/workspace-insights-ui/dodao-ui`).
5. Write summary to `/tmp/claude-code-result-insights.md` including:
   - Files changed
   - Branch and commit hash
   - PR URL (or existing PR if already created)
   - Full output of `git worktree list` (all open worktrees)
   - Any errors
6. Run: `openclaw system event --text "Done: [brief summary]" --mode now`

### Rules

- **ALWAYS** use the two-step worktree flow: Step 1 (manage worktrees) → Step 2 (do work in worktree).
- Never work directly on the main repo checkout.
- Always commit and push from the worktree branch, never from `main`/`master`.

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
