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

### 3) Verify Type Check

Confirm the project type-checks successfully before committing:

```bash
yarn compile
```

`yarn compile` runs `prisma generate && tsc` — same type-safety guarantees as
a full build, but skips the Next.js bundle/page-data step (which fails locally
without production env vars and offers no extra signal for code review).

**Important:** Do not proceed until `yarn compile` completes without errors.

### 4) Commit and Push Changes (Mandatory)

After checks pass, commit and push your changes:

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

## Worktree-Based Workflow (MANDATORY — READ THIS FIRST)

All code changes MUST happen in git worktrees. The main repo checkout is READ-ONLY.

### What Are Worktrees?

Git worktrees let you have multiple branches checked out simultaneously in separate directories, all sharing the same `.git` history. This means you can work on `fix-auth` in one folder and `add-feature` in another, without switching branches. Each worktree is an independent working directory with its own branch.

### Layout

- **Main repo (READ-ONLY, must stay on `main`):** `/home/ubuntu/.openclaw/workspace-insights-ui/dodao-ui`
- **Worktree base dir:** `/home/ubuntu/.openclaw/workspace-insights-ui/worktrees/`
- **Convention:** worktree folder name = branch name (e.g., `worktrees/fix-auth/` → branch `fix-auth`)

### CRITICAL SAFETY RULES

1. **NEVER change branches in the main repo.** It must always stay on `main`. If you are in the main repo and it's not on `main`, run `git checkout main` before doing anything else.
2. **NEVER commit code in the main repo.** All commits happen in worktrees only.
3. **BEFORE doing any coding work, verify your current directory.** Your working directory path MUST contain `/worktrees/`. If it does not, you are in the main repo — STOP and do NOT write code.
4. **Each new task = new branch = new worktree.** Do NOT reuse a worktree/branch from a different task. Only continue in an existing worktree if the task is explicitly a continuation of that branch's work.
5. **A branch can only be checked out in ONE place.** Git does not allow the same branch in two worktrees. The main repo stays on `main`, worktrees get feature branches.

### Step 1: Worktree Management (run from main repo)

Run these commands from the main repo directory (`/home/ubuntu/.openclaw/workspace-insights-ui/dodao-ui`):

```bash
# 1. Ensure main repo is on main and up to date
git checkout main && git pull origin main

# 2. Cleanup — remove worktrees whose PRs are merged
git worktree list
# For each worktree (not the main one):
#   gh pr list --head <branch> --state merged
#   If merged: git worktree remove <path> && git branch -d <branch>

# 3. Select or create worktree for current task
# If existing worktree matches this task exactly → use it
# Otherwise create new:
git worktree add /home/ubuntu/.openclaw/workspace-insights-ui/worktrees/<branch-name> -b <branch-name> main
```

**Important:** The trailing `main` in the `git worktree add` command means "create this branch starting from main's HEAD." Always include it so new branches start clean.

### Step 2: Do Work (run from worktree directory)

You must `cd` into or be spawned in the worktree directory. Verify with:
```bash
pwd  # Must contain /worktrees/
git branch --show-current  # Must NOT be main
```

Then do your work, and when finished:
```bash
# 1. Quality checks
yarn lint && yarn prettier-check && yarn compile

# 2. Commit and push
git add .
git commit -m "descriptive message"
git push -u origin <BRANCH_NAME>

# 3. Create PR if none exists
gh pr list --head <BRANCH_NAME> --state open  # check first
gh pr create --base main --head <BRANCH_NAME> --title "..." --body "..."
```

### Common Worktree Commands Reference

```bash
git worktree list                    # Show all worktrees and their branches
git worktree add <path> -b <branch> main  # Create new worktree+branch from main
git worktree add <path> <existing-branch> # Checkout existing branch in new worktree
git worktree remove <path>           # Remove a worktree (must have clean working tree)
git worktree prune                   # Clean up stale worktree references
git branch -d <branch>              # Delete branch after worktree is removed
```

### Why This Matters

Without worktrees, switching branches in a single checkout causes:
- Build cache invalidation (slow rebuilds)
- Risk of uncommitted changes being lost or mixed between tasks
- Inability to work on multiple tasks concurrently
- Commits landing on wrong branches (exactly what happened when auth fixes went onto competition-page)

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

**Before starting any coding or knowledge task, always check `docs/`.**
This is the main source for coding patterns, project requirements, and implementation plans.

### Code Knowledge

Use **`docs/code-knowledge/`** for shared coding conventions:

* Backend instructions (Next.js API patterns)
* UI instructions (React/Next.js patterns)
* Component guidelines (buttons, forms, layout, theming)
* Architecture (monorepo structure, shared packages, build process)

### Project Knowledge

Use **`docs/projects/`** for project-specific docs. Each project may include:

* `features/`
* `requirements.md`
* `requirements/`
* `todos.md`
* `todos/`
* `AIKnowledge.md`

Currently documented:

* `docs/insights-ui/` — KoalaGains topical knowledge + active task lists (`tasks/`).
* `docs/projects/simulations/`

### Topical Knowledge

Use **`docs/insights-ui/`** for topical reference docs about Insights-UI subsystems that aren't tied to a single feature spec — pipelines, prompts, runbooks, and analysis methodology. See [`docs/insights-ui/AIKnowledge.md`](docs/insights-ui/AIKnowledge.md) for the index. Each subfolder also has its own `AIKnowledge.md`. Subareas:

* `etf-analysis/` — ETF analysis pipeline + ETF Scenarios system (`generate-etf-reports.md`, `etf-scenarios.md`)
* `stock-analysis/` — `yarn stocks:add` / `yarn stocks:trigger` runbooks
* `etf-prompts/` — Source-of-truth prompt text for each ETF analysis category
* `etf-prompt-improvement/` — Iterative prompt-tuning review notes
* `tariffs/` — Tariffs subsystem reference (`tariffs-functionality.md`, `tariff-usecases.md`)
* `tasks/` — Active KoalaGains task lists (open + closed): ETFs, stocks, tariffs, scenarios, prompt tuning

### How to Use the Knowledge Base

1. **Before coding:** Read relevant `code-knowledge` docs
2. **Before implementing a feature:** Review the project’s `features/`, `requirements.md`, and `todos.md`
3. **When planning work:** Add detailed plans to `todos/` and update `todos.md`
4. **When defining requirements:** Add specs to `requirements/` and update `requirements.md`
5. **After completing features:** Document them in `features/`

Each project may also have a top-level `AIKnowledge.md` (e.g., `simulations/AIKnowledge.md`, `insights-ui/AIKnowledge.md`).


## Additional Resources

* `docs/AIKnowledge.md` (full index)
* `docs/code-knowledge/AIKnowledge.md` (coding patterns index)
* `docs/projects/AIKnowledge.md` (project docs index)
* `docs/insights-ui/AIKnowledge.md` (Insights-UI topical knowledge index — ETF pipeline, prompts, tariffs)
* `docs/code-knowledge/build-process.md`
* `docs/code-knowledge/monorepo-structure.md`

---

## Reuse Before Creating (Mandatory)

**Before creating any new file or component, search the codebase for an existing one that does the same or similar job.** Duplicating an existing helper, hook, or component fragments the codebase and forces every future change to be applied in multiple places.

### Process

1. Pick 2–3 keywords describing the behavior you need (e.g. an admin-only timestamp → search for `AdminTimestamp`, `Updated`, `dateModified`, `PrivateWrapper`).
2. Use Grep / file search across `src/` for those keywords. Look at component names, prop names, and the rendered text. Don't stop at the first miss — try synonyms.
3. If a match exists:
   - **Reuse it as-is** if its API fits your need.
   - **Extend it** (add an optional prop) if a small tweak makes it fit instead of duplicating.
   - **Restructure / move it** (e.g. into a shared `components/auth/` folder) if it lives in a project-specific spot but is genuinely reusable. Update all existing import paths in the same change.
4. Only create a new file when there is no existing equivalent and the behavior is genuinely different.

If you create a new file by mistake, delete it as soon as you discover the duplicate, switch all callers to the canonical one, and keep the change in a single commit so reviewers see the consolidation.

---

## Best Practices

1. Test locally before pushing
2. Use descriptive commit messages
3. Keep commits focused (one feature/fix per commit when possible)
4. Review your changes before PR
5. Monitor build status after pushing
6. Fix failures quickly to avoid blocking others
7. Always commit and push your changes. Always. Always (Mandatory)
8. Always cross-check for an existing file/component before creating a new one (see the **Reuse Before Creating** section above)

---

# Claude Commands

Refer to `docs/ClaudeCliReference.md` for Claude Code command usage.
