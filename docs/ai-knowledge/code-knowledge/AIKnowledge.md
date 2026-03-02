# Code Knowledge

This folder contains the common coding patterns, conventions, and best practices used across all projects in the DoDAO UI monorepo.

## Folders & Files

### Backend Patterns
- **[../BackendInstructions.md](../BackendInstructions.md)** - Next.js API development patterns including route handlers, error handling with `withErrorHandlingV2`, strict TypeScript typing, and Prisma database operations.

### UI Patterns
- **[../UIIInstructions.md](../UIIInstructions.md)** - React/Next.js UI development guidelines covering component patterns, data fetching hooks (`useFetchData`, `usePostData`, `usePutData`), server-side rendering, breadcrumbs, modals, loading states, and authentication with `useAuthGuard`.

### UI Components
- **[../ui/button.md](../ui/button.md)** - Button and IconButton component documentation with props and usage patterns.
- **[../ui/form-elements.md](../ui/form-elements.md)** - Form components including Input, StyledSelect, TextareaAutosize, PrivateWrapper, and validation patterns.
- **[../ui/page-structure.md](../ui/page-structure.md)** - Page structure guidelines including PageWrapper, Breadcrumbs, generateMetadata, server components, EllipsisDropdown, and ConfirmationModal.
- **[../ui/theme-colors.md](../ui/theme-colors.md)** - Theme and color system with CSS variables, theme classes, and SCSS definitions.

### Architecture
- **[../monorepo-structure.md](../monorepo-structure.md)** - Monorepo organization using pnpm workspaces, shared web-core package, dependency management, and cross-project code sharing.
- **[../build-process.md](../build-process.md)** - Build system documentation including local builds, CI/CD pipeline, GitHub Actions, and deployment strategies.
