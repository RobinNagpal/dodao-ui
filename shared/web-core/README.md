# @dodao/web-core

Shared component library and utilities for DoDAO UI projects in a pnpm workspace.

## Overview

`@dodao/web-core` provides:
- 🧩 **Reusable React components** (auth, modals, layouts, forms)
- 🛠️ **Utility functions** (Apollo client, analytics, auth helpers)
- 📝 **Common TypeScript types** and interfaces
- 🔗 **Shared contexts** (Web3, LoginModal, etc.)

## Architecture: pnpm Workspace Package

This is a **local workspace package** that:
- ✅ **Not published to npm** - stays within the monorepo
- ✅ **Auto-linked by pnpm** - no manual transpilation needed
- ✅ **Instant changes** - modifications reflect immediately in consumer projects

### Consumer Setup

Add to your project's `package.json`:
```json
{
  "dependencies": {
    "@dodao/web-core": "1.0.0"
  }
}
```

Add to your `next.config.js` (only for styled-components support):
```js
const nextConfig = {
  compiler: {
    styledComponents: true,  // Required for web-core components
  },
};
```

## Dependency Management

### Shared Dependencies Rule

When `web-core` uses a library that requires a **single instance** (React contexts, providers), **both projects must declare the same version**:

```json
// web-core/package.json & consumer/package.json
{
  "dependencies": {
    "react": "18.3.1",
    "styled-components": "6.1.11",
    "@apollo/client": "^3.7.12"
  }
}
```

### Internal-Only Dependencies

Pure utilities can stay only in `web-core`:
- `lodash`, `dayjs`, `uuid`, `clsx`

## Consumer Projects

| Project | Usage |
|---------|-------|
| academy-ui | Heavy (200+ imports) |
| insights-ui | Heavy (170+ imports) |
| base-ui | Light (16+ imports) |
| defi-alerts | Moderate |
| news-reader | Moderate |
| simulations | Moderate |

## Directory Structure

```
web-core/src/
├── components/
│   ├── app/           # App-level (ErrorPage, etc.)
│   ├── auth/          # Authentication components
│   ├── core/          # UI primitives (buttons, inputs)
│   └── layout/        # Layout components
├── types/             # TypeScript definitions
├── ui/contexts/       # React contexts
└── utils/
    ├── analytics/     # Google Analytics
    ├── api/           # API utilities
    └── auth/          # Auth helpers
```

## Development

```bash
# Install dependencies (from web-core directory)
pnpm install-deps

# Type check
pnpm tsc

# Lint & format
pnpm lint
pnpm prettier-check
```
