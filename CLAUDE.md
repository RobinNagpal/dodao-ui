# CLAUDE Development Guidelines

## Overview
This document provides development workflow guidelines for the DoDAO UI monorepo. Please refer to [AIKnowledge.md](AIKnowledge.md) for comprehensive project documentation and architecture details.

## Pre-Commit Development Workflow

Before committing any code changes, follow these essential steps to ensure code quality and successful deployment:

### 1. Code Quality Checks
Before committing your changes, ensure the build passes for the specific project you're working on:

```bash
# Run linting check
yarn lint

# Run prettier formatting check  
yarn prettier-check
```

### 2. Fix Code Quality Issues
If the above checks fail, fix the issues using the automated tools:

```bash
# Fix linting issues automatically
yarn lint-fix

# Fix formatting issues automatically
yarn prettier-fix
```

### 3. Verify Build Success
After fixing any code quality issues, verify that the project builds successfully:

```bash
# Run the build process
yarn build
```

**Important**: Ensure the build completes without errors before proceeding to the next step.

### 4. Push Your Code
Once all checks pass and the build is successful, push your code to the repository:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin your-branch-name
```

### 5. Monitor GitHub Build Status
After pushing your code:

1. **Check GitHub Actions**: Navigate to the repository's Actions tab on GitHub
2. **Monitor Build Progress**: Watch for your commit's build status
3. **Verify Success**: Ensure all CI/CD checks pass successfully

### 6. Handle Build Failures
If your Pull Request (PR) fails the build process:

#### Pull GitHub Logs
1. Go to the GitHub Actions tab in your repository
2. Click on the failed workflow run
3. Expand the failed job steps to view detailed error logs
4. Download logs if needed for detailed analysis

#### Pull Vercel Logs (if applicable)
1. Access your Vercel dashboard
2. Navigate to the specific project deployment
3. Check the "Functions" or "Build" logs for detailed error information
4. Look for runtime errors or deployment issues

#### Common Issues to Check
- **Linting Errors**: Code style violations
- **TypeScript Errors**: Type checking failures  
- **Build Errors**: Compilation or bundling issues
- **Test Failures**: Unit or integration test failures
- **Environment Variables**: Missing or incorrect configuration

# DoDAO UI - Multi-Project Repository

This repository contains multiple UI applications and services that form the DoDAO ecosystem. Each project serves a specific purpose in the educational and financial technology space.

## Projects Overview

### 🎓 Simulations
An educational business case study simulation platform that provides interactive learning experiences across various business disciplines including Marketing, Finance, HR, Operations, and Economics. Features role-based access for Students, Instructors, and Administrators.

### 📊 Insights-UI (KoalaGains)
A comprehensive financial insights and AI-powered stock analysis platform that democratizes investment research. Provides deep value investing insights, industry reports, tariff analysis, and covers global stock exchanges worldwide.

### 🎓 Academy-UI
Educational platform for blockchain and DeFi learning with courses, guides, and interactive content.

### 📰 News-Reader
News aggregation and reading platform for staying updated with the latest developments.

### 🖱️ Clickable-Demos
Interactive demonstration platform for showcasing various features and workflows.

### 🚨 DeFi-Alerts
Alert system for DeFi protocols and cryptocurrency market movements.

### 📱 Base-UI
Core UI components and shared design system used across other applications.

### 🤖 AI-Agents
AI-powered agents and automation tools for various tasks and workflows.

### 📊 X-News-UI
Social media news and content management interface.

### 🔧 Shared
Common utilities, components, and libraries shared across all projects.

## 📚 AI Knowledge Base (MUST READ)

**Before starting any coding or knowledge task, always consult the AI Knowledge Base at [docs/ai-knowledge/](docs/ai-knowledge/).** This is the single source of truth for coding patterns, project features, requirements, and implementation plans.

### Code Knowledge
Refer to **[docs/ai-knowledge/code-knowledge/](docs/ai-knowledge/code-knowledge/)** for all common coding patterns and conventions used across the monorepo:
- **Backend Instructions** - Next.js API development patterns and best practices
- **UI Instructions** - React/Next.js UI development patterns and component guidelines
- **Component Guidelines** - Specific documentation for buttons, forms, page structure, and theming
- **Architecture** - Monorepo structure, build process, and shared package patterns

### Project Knowledge
Refer to **[docs/ai-knowledge/projects/](docs/ai-knowledge/projects/)** for project-specific documentation. Each project folder contains:
- **features/** - Descriptions of each feature in the project
- **requirements.md** - Index of all planned requirements
- **requirements/** - Detailed requirement specifications
- **todos.md** - Items next in the list to be worked on
- **todos/** - Detailed implementation plans for todo items
- **AIKnowledge.md** - Index of the project's folders and files

Currently documented projects:
- **[docs/ai-knowledge/projects/insights-ui/](docs/ai-knowledge/projects/insights-ui/)** - KoalaGains financial insights platform
- **[docs/ai-knowledge/projects/simulations/](docs/ai-knowledge/projects/simulations/)** - Business case study simulation platform

### How to Use This Knowledge Base
1. **Before writing code** - Read the relevant code-knowledge docs to follow established patterns.
2. **Before implementing a feature** - Check the project's `features/`, `requirements.md`, and `todos.md` for context and plans.
3. **When planning work** - Write detailed plans in the project's `todos/` folder and update `todos.md`.
4. **When defining requirements** - Add requirement specs to the project's `requirements/` folder and update `requirements.md`.
5. **After completing features** - Document the feature in the project's `features/` folder.

Each project also has its own top-level AIKnowledge.md file (e.g., `insights-ui/AIKnowledge.md`, `simulations/AIKnowledge.md`) with full project overviews.

## Project-Specific Notes

### For Simulations Project
- Ensure Prisma schema is up to date: `prisma generate`
- Check authentication flows work correctly
- Verify role-based access controls

### For Insights-UI Project  
- Validate financial data processing
- Check API integrations with external services
- Ensure data visualization components render correctly

### For Shared Web-Core
- Run type checking: `pnpm tsc`
- Test changes across dependent projects
- Update documentation for API changes

## Additional Resources

- **AI Knowledge Base Overview**: See [docs/ai-knowledge/AIKnowledge.md](docs/ai-knowledge/AIKnowledge.md) for a complete index of all development guidelines and patterns
- **Code Knowledge**: See [docs/ai-knowledge/code-knowledge/AIKnowledge.md](docs/ai-knowledge/code-knowledge/AIKnowledge.md) for coding patterns index
- **Projects Knowledge**: See [docs/ai-knowledge/projects/AIKnowledge.md](docs/ai-knowledge/projects/AIKnowledge.md) for project documentation index
- **Build Process**: See [docs/ai-knowledge/code-knowledge/build-process.md](docs/ai-knowledge/code-knowledge/build-process.md) for detailed build information
- **Monorepo Structure**: See [docs/ai-knowledge/code-knowledge/monorepo-structure.md](docs/ai-knowledge/code-knowledge/monorepo-structure.md) for repository organization

## Best Practices

1. **Always test locally** before pushing to remote
2. **Write descriptive commit messages** that explain the changes
3. **Keep commits focused** on a single feature or fix
4. **Review your own code** before creating a PR
5. **Monitor build status** after pushing changes
6. **Address failures promptly** to avoid blocking other developers

Following this workflow ensures consistent code quality, successful deployments, and a smooth development experience for all team members.

# Claude Commands
refer to `docs/ClaudeCliReference.md` file on how to use claude code
