# @dodao/web-core

Shared component library and utilities used across all DoDAO UI projects.

## Overview

`web-core` is a **local shared package** that provides:
- Reusable React components (auth modals, notifications, layouts)
- Utility functions (Apollo client, analytics, auth helpers)
- Common types and interfaces
- Shared contexts (Web3, Login Modal, etc.)

## Architecture: Transpiled Package (Not Published)

This package is **not published to npm**. Instead, consumer projects:
1. Reference it via `"@dodao/web-core": "file:../shared/web-core"` in `package.json`
2. Transpile it at build time using Next.js `transpilePackages`

```js
// next.config.js in consumer project
const nextConfig = {
  transpilePackages: ['@dodao/web-core'],
};
```

### Why Transpilation Instead of Pre-building?

| Approach | Pros | Cons |
|----------|------|------|
| **Transpiled (current)** | No build step for web-core, instant changes, simpler setup | Must manage dependencies carefully |
| **Pre-built/Published** | Clean dependency isolation | Requires build + publish step for every change |

## Dependency Management Rules

### Critical: Singleton Libraries Must Be Declared in Consumer Projects

When `web-core` uses a library that requires a **single instance** (React contexts, providers), the **consumer project must also declare it** with the **same version**.

### Libraries That Don't Need Duplication

Pure utilities that don't share state can stay only in `web-core`:
- `lodash`, `dayjs`, `uuid`
- `axios` (if only used internally)
- `clsx`, `tailwind-merge`

## Common Issues & Solutions

### Issue: "Property X is missing in type" (TypeScript Error)

**Cause**: Version mismatch between `web-core` and consumer project.

**Solution**: Add the library to consumer's `package.json` with matching version.

```bash
# In consumer project
yarn add @apollo/client@^3.7.12
```

### Issue: "Multiple instances of X detected"

**Cause**: Library exists in both `web-core/node_modules` and `consumer/node_modules` with different versions.

**Solution**: 
1. Ensure same version in both `package.json` files
2. Delete `node_modules` and `yarn.lock` in both, reinstall
3. Add webpack alias if needed:

```js
// next.config.js
config.resolve.alias = {
  'problem-package': path.resolve(__dirname, 'node_modules/problem-package'),
};
```

### Issue: "Module not found" for web-core dependency

**Cause**: Consumer doesn't have the dependency, and it's not resolving from `web-core`.

**Solution**: Add the dependency to consumer's `package.json`.

## Adding New Dependencies to web-core

When adding a new dependency to `web-core`, ask yourself:

1. **Does it export React context/providers?** → Consumer must also add it
2. **Does it have TypeScript types used in exported functions?** → Consumer should add it
3. **Is it a pure utility used only internally?** → Only add to web-core

### Checklist for New Dependencies

```markdown
- [ ] Added to web-core/package.json
- [ ] If context-based: Added same version to all consumer projects
- [ ] If types are exported: Added same version to consumer projects  
- [ ] Tested build in all affected projects
```

## Consumer Projects

Projects that use `@dodao/web-core`:

| Project | Path |
|---------|------|
| academy-ui | `../academy-ui` |
| base-ui | `../base-ui` |
| insights-ui | `../insights-ui` |
| defi-alerts | `../defi-alerts` |
| news-reader | `../news-reader` |
| simulations | `../simulations` |
| x-news-ui | `../x-news-ui` |

## Performance Note

**Transpilation does NOT slow down the website at runtime.**

- Transpilation happens at **build time** only
- Final bundles are optimized the same as any other code
- Build times may be slightly longer (typically a few seconds)
- No runtime performance impact

## Directory Structure

```
web-core/
├── src/
│   ├── components/     # Reusable React components
│   │   ├── app/        # App-level components (ErrorPage, etc.)
│   │   ├── auth/       # Authentication components
│   │   ├── core/       # Core UI components (buttons, inputs, etc.)
│   │   └── layout/     # Layout components
│   ├── types/          # TypeScript type definitions
│   ├── ui/             # UI contexts and providers
│   │   └── contexts/   # React contexts (Web3, LoginModal, etc.)
│   └── utils/          # Utility functions
│       ├── analytics/  # Google Analytics helpers
│       ├── api/        # API utilities
│       ├── apolloClient.ts
│       └── auth/       # Auth utilities
├── package.json
└── tsconfig.json
```
