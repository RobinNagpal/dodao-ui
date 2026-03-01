# DoDAO UI Monorepo Structure

This document explains the monorepo structure and organization of the DoDAO UI repository, which contains multiple Next.js applications and shared components.

## 📁 Repository Organization

### Workspace Configuration
The repository uses **pnpm workspaces** for monorepo management, configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'academy-ui'
  - 'base-ui' 
  - 'defi-alerts'
  - 'x-news-ui'
  - 'insights-ui'
  - 'clickable-demos'
  - 'news-reader'
  - 'simulations'
  - 'shared/web-core'
```

### Project Structure

#### 🎓 **Educational Platforms**
- **academy-ui**: Blockchain and DeFi learning platform with courses and guides
- **simulations**: Business case study simulation platform for interactive learning

#### 📊 **Financial & Analytics**
- **insights-ui**: KoalaGains financial intelligence platform with AI-powered stock analysis
- **defi-alerts**: Alert system for DeFi protocols and cryptocurrency movements

#### 📰 **Content & News**
- **news-reader**: News aggregation and reading platform
- **x-news-ui**: Social media news and content management interface

#### 🔧 **Core & Utilities**
- **base-ui**: Core UI components and shared design system
- **clickable-demos**: Interactive demonstration platform
- **shared/web-core**: Shared components, utilities, and libraries used across all projects

#### 🤖 **AI & Automation**
- **ai-agents**: AI-powered agents and automation tools (not in workspace)
- **lambdas**: AWS Lambda functions (not in workspace)

## 🔗 Dependency Management

### Shared Components
All projects depend on the shared web-core package using pnpm's workspace protocol:

```json
{
  "dependencies": {
    "@dodao/web-core": "workspace:*"
  }
}
```

### Version Consistency
The root `package.json` enforces consistent versions across all packages using resolutions:

```json
{
  "resolutions": {
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1", 
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@apollo/client": "^3.7.12"
  }
}
```

## 📦 Shared Web-Core Package

### Purpose
The `@dodao/web-core` package contains:
- **Reusable UI Components**: Buttons, forms, modals, navigation
- **Custom Hooks**: Data fetching, authentication, state management
- **Utilities**: API helpers, theme management, validation
- **Types**: Shared TypeScript definitions
- **Middleware**: Error handling, authentication guards

### Structure
```
shared/web-core/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript definitions
│   └── api/           # API helpers and middleware
├── dist/              # Built output
└── package.json       # Package configuration
```

### Build Process
- **TypeScript Compilation**: `tsc --noEmit` for type checking
- **No Bundling**: Components are imported directly from source
- **Development Dependencies**: Contains all shared dependencies

## 🏗️ Project Architecture

### Technology Stack Consistency
All projects share a common technology foundation:
- **Framework**: Next.js 15.5.7 with App Router
- **Language**: TypeScript 5.0.4
- **Styling**: Tailwind CSS with custom theme system
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js
- **Package Manager**: pnpm with workspaces

### Code Sharing Patterns
1. **Component Reuse**: Import UI components from `@dodao/web-core`
2. **Hook Sharing**: Use shared hooks for common functionality
3. **Type Definitions**: Share TypeScript types across projects
4. **Utility Functions**: Common helpers and API utilities
5. **Theme System**: Consistent styling using CSS variables

## 🔄 Development Workflow

### Local Development
1. Install dependencies at root: `pnpm install`
2. Build shared components: `pnpm build:web-core`
3. Start individual project: `cd project-name && pnpm dev`

### Cross-Project Dependencies
- Changes to `shared/web-core` affect all projects
- Projects can import from each other using workspace protocol
- Consistent tooling (ESLint, Prettier, TypeScript) across all projects

This monorepo structure enables efficient code sharing, consistent development practices, and streamlined deployment while maintaining project independence and scalability.
