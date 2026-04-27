# Code Knowledge

This folder contains the common coding patterns, conventions, and best practices used across all projects in the DoDAO UI monorepo.

## Folders & Files

### Backend Patterns
- **[BackendInstructions.md](BackendInstructions.md)** - Next.js API development patterns including route handlers, error handling with `withErrorHandlingV2`, strict TypeScript typing, and Prisma database operations.
- **[AddingAPIRoutes.md](AddingAPIRoutes.md)** - REST API route naming conventions, CRUD patterns, nested routes, and custom query/action route patterns.
- **[ErrorHandling.md](ErrorHandling.md)** - Error handling with `withErrorHandlingV2` middleware on the API side, and notification system (`showNotification`) for displaying success/error messages on the UI.
- **[TypeDefinitions.md](TypeDefinitions.md)** - Type definition rules including no `any` types, enum usage, request/response type patterns, Dto objects, and `withErrorHandlingV2` usage.
- **[PrismaTypesAndMigrations.md](PrismaTypesAndMigrations.md)** - Prisma JSON field typing with `prisma-json-types-generator`, migration workflows (create, apply, revert, delete).
- **[Caching.md](Caching.md)** - Next.js caching patterns with `revalidateTag` and `revalidatePath`, tag-based cache invalidation, and server actions for cache revalidation.

### UI Patterns
- **[UIIInstructions.md](UIIInstructions.md)** - React/Next.js UI development guidelines covering component patterns, data fetching hooks (`useFetchData`, `usePostData`, `usePutData`), server-side rendering, breadcrumbs, modals, loading states, and authentication with `useAuthGuard`.
- **[Loaders.md](Loaders.md)** - Loading component patterns including FullPageLoader, PageLoading, LoadingSpinner, and SpinnerWithText usage guidelines.
- **[ServerSideComponents.md](ServerSideComponents.md)** - When to use server vs. client components in the App Router, and how that interacts with our standard page structure.
- **[SpacingRecommendations.md](SpacingRecommendations.md)** - UI spacing guidelines using a 16px base unit, Tailwind spacing classes, and responsive design considerations.

### UI Components
- **[ui/button.md](ui/button.md)** - Button and IconButton component documentation with props and usage patterns.
- **[ui/form-elements.md](ui/form-elements.md)** - Form components including Input, StyledSelect, TextareaAutosize, PrivateWrapper, and validation patterns.
- **[ui/page-structure.md](ui/page-structure.md)** - Page structure guidelines including PageWrapper, Breadcrumbs, generateMetadata, server components, EllipsisDropdown, and ConfirmationModal.
- **[ui/theme-colors.md](ui/theme-colors.md)** - Theme and color system with CSS variables, theme classes, and SCSS definitions.

### Styling
- **[HowThemeAndCssWorks.md](HowThemeAndCssWorks.md)** - CSS/SCSS conventions, CSS Modules (no StyledComponents), CSS variables for theming, and the rule to never hardcode colors.
- **[HowImageUploadWorks.md](HowImageUploadWorks.md)** - S3 presigned URL image upload pattern (two-step: get presigned URL, then upload).

### Architecture
- **[monorepo-structure.md](monorepo-structure.md)** - Monorepo organization using pnpm workspaces, shared web-core package, dependency management, and cross-project code sharing.
- **[build-process.md](build-process.md)** - Build system documentation including local builds, CI/CD pipeline, GitHub Actions, and deployment strategies.
