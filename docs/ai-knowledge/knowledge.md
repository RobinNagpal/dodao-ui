# AI Knowledge Base

This directory contains comprehensive development guidelines and coding patterns for AI-assisted development across all projects in the DoDAO UI repository.

## 📋 File Descriptions

### BackendInstructions.md
Contains Next.js API development guidelines including route patterns, error handling with withErrorHandlingV2 middleware, strict TypeScript typing requirements, and examples of GET/PUT/DELETE operations. Includes patterns for handling async params in Next.js 15+ and Prisma database operations.

### UIIInstructions.md
Comprehensive React/Next.js UI development guidelines covering component patterns, data fetching with useFetchData/usePostData/usePutData hooks, server-side rendering patterns, breadcrumb implementation, modal components, loading states, and authentication management with useAuthGuard hook. Includes strict TypeScript typing requirements and theme integration patterns.

### ui/button.md
Documentation for button components including the main Button component with props like primary, variant, loading, disabled, and size options. Also covers IconButton component for small interactive elements with predefined icon types and tooltip support.

### ui/form-elements.md
Guidelines for form components including Input, StyledSelect, and TextareaAutosize components with their respective props and usage patterns. Also covers PrivateWrapper component for protecting admin actions and form validation patterns.

### ui/page-structure.md
Comprehensive page structure guidelines including PageWrapper, Breadcrumbs, generateMetadata for SEO, server component patterns with async/await params, PrivateWrapper for admin content, EllipsisDropdown for action menus, and ConfirmationModal for user confirmations. Includes complete examples of page component architecture.

### ui/theme-colors.md
Theme and color system documentation including CSS variable definitions, theme classes for consistent styling, layout integration patterns, and SCSS class definitions. Covers primary colors, text colors, background colors, border colors, and hover states using CSS custom properties for dynamic theming.
