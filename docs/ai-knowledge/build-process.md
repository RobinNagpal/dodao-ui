# DoDAO UI Build Process

This document explains how the build system works across the DoDAO UI monorepo, including local development, CI/CD pipelines, and deployment strategies.

## 🏗️ Build Architecture Overview

### Build Dependencies
The build process follows a dependency hierarchy:
1. **Shared Web-Core** → Built first (TypeScript compilation)
2. **Individual Projects** → Built after web-core (Next.js build)
3. **Deployment** → Project-specific deployment to various platforms

### Build Tools
- **Package Manager**: pnpm with workspace support
- **TypeScript**: Compilation and type checking across all projects
- **Next.js**: Application bundling and optimization
- **Prisma**: Database schema generation
- **ESLint/Prettier**: Code quality and formatting

## 🔧 Local Development Build

### Initial Setup
```bash
# Install all dependencies across the monorepo
pnpm install

# Build shared components first
pnpm build:web-core

# Start individual project development
cd project-name && pnpm dev
```

### Root Build Scripts
The root `package.json` provides build scripts for all projects:

```json
{
  "scripts": {
    "build:web-core": "cd shared/web-core && pnpm build",
    "build:academy": "cd academy-ui && pnpm build",
    "build:base": "cd base-ui && pnpm build", 
    "build:defi-alerts": "cd defi-alerts && pnpm build",
    "build:x-news": "cd x-news-ui && pnpm build",
    "build:insights": "cd insights-ui && pnpm build",
    "build:clickable-demos": "cd clickable-demos && pnpm build",
    "build:news-reader": "cd news-reader && pnpm build",
    "build:simulations": "cd simulations && pnpm build",
    "build:all": "pnpm build:web-core && pnpm build:academy && ..."
  }
}
```

### Individual Project Build Process
Each project follows a consistent build pattern:

1. **Dependency Installation**: `pnpm install --filter project-name`
2. **Prisma Generation**: `prisma generate` (if applicable)
3. **TypeScript Compilation**: `tsc` or `pnpm compile`
4. **Next.js Build**: `next build`
5. **Static Export**: `next export` (for static sites)

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
The CI/CD pipeline uses path-based filtering to optimize build times:

```yaml
# Determine which projects changed
determine-changed-paths:
  outputs:
    shared_web_core_changed: ${{ steps.filter.outputs.shared_web_core }}
    academy_ui_changed: ${{ steps.filter.outputs.academy_ui }}
    # ... other projects
```

### Build Job Pattern
Each project has a dedicated CI job that runs when:
- The project's files change
- The shared web-core changes (affects all projects)

```yaml
academy_ui_job:
  needs: determine-changed-paths
  if: ${{ needs.determine-changed-paths.outputs.academy_ui_changed == 'true' || 
          needs.determine-changed-paths.outputs.shared_web_core_changed == 'true' }}
```

### CI Build Steps
1. **Environment Setup**
   - Node.js 23.11.0
   - pnpm 8
   - Checkout repository

2. **Shared Web-Core Build**
   - Install dependencies: `pnpm install --filter @dodao/web-core`
   - Type checking: `pnpm tsc`
   - Code formatting: `pnpm prettier-check`

3. **Project-Specific Build**
   - Install dependencies: `pnpm install --filter project-name`
   - Linting: `pnpm lint`
   - Code formatting: `pnpm prettier-check`
   - TypeScript compilation: `pnpm compile`
   - Next.js build: `pnpm build`

## 📦 Shared Web-Core Build

### Build Configuration
The shared package uses TypeScript for type checking without emitting files:

```json
{
  "scripts": {
    "build": "tsc --noEmit",
    "tsc": "tsc --noEmit"
  }
}
```

### Why No Bundling?
- **Direct Source Imports**: Projects import directly from TypeScript source files
- **Tree Shaking**: Next.js handles bundling and optimization
- **Development Speed**: No build step required for shared components during development
- **Type Safety**: TypeScript compilation ensures type correctness

## 🔄 Project-Specific Builds

### Next.js Applications
Most projects are Next.js applications with similar build processes:

```json
{
  "scripts": {
    "compile": "prisma generate && tsc",
    "dev": "prisma generate && next dev --turbopack", 
    "build": "prisma generate && next build",
    "start": "prisma generate && next start"
  }
}
```

### Build Optimizations
- **Turbopack**: Used in development for faster builds
- **Prisma Generation**: Database client generated before compilation
- **TypeScript Compilation**: Strict type checking across all files
- **Next.js Optimization**: Automatic code splitting, image optimization, etc.

## 🚀 Deployment Strategies

### Platform-Specific Deployments
- **Vercel**: Primary deployment platform for most Next.js apps
- **AWS**: Lambda functions and S3 for backend services
- **Static Sites**: Some projects deploy as static sites

### Environment Configuration
Each project manages its own environment variables:
- **Database URLs**: Project-specific database connections
- **API Keys**: Service-specific authentication
- **Feature Flags**: Environment-specific configurations

### Build Artifacts
- **Next.js Build**: `.next` directory with optimized bundles
- **Static Export**: `out` directory for static deployments
- **Type Definitions**: Generated TypeScript definitions
- **Prisma Client**: Generated database client

## 🔍 Build Monitoring

### Build Performance
- **Path Filtering**: Only build changed projects
- **Parallel Jobs**: Multiple projects can build simultaneously
- **Caching**: Node modules and build artifacts cached
- **Incremental Builds**: TypeScript incremental compilation

### Quality Gates
- **Type Checking**: All TypeScript must compile without errors
- **Linting**: ESLint rules enforced across all projects
- **Formatting**: Prettier ensures consistent code style
- **Build Success**: Next.js build must complete successfully

## 🛠️ Development Best Practices

### Local Development
1. Always build web-core first when starting fresh
2. Use `pnpm dev` with Turbopack for fast development
3. Run type checking regularly: `pnpm compile`
4. Test builds locally before pushing: `pnpm build`

### Shared Component Changes
1. Test changes in web-core: `cd shared/web-core && pnpm tsc`
2. Test affected projects: Build projects that use changed components
3. Update type definitions if interfaces change
4. Document breaking changes in component APIs

This build system ensures consistent, reliable builds across all projects while maintaining development speed and code quality standards.
