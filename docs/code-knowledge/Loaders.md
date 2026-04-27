# Overview

When building a web application, it’s essential to provide feedback to users while data is being fetched from an API or another external source. This is typically done by showing a "loading" state or a loader. Loaders improve user experience by indicating that the application is working in the background, reducing confusion, and keeping users informed that data is being retrieved.

This document outlines when and how to use loaders in the application, particularly when fetching data or handling loading states.


# Types of Loaders

We have different loaders for different purposes so use the specified loader for that particular task

### FullPageLoaders
This is used for the full page loading and you can see from the classes added on to the main div i.e. `fixed top-0 left-0 w-screen h-screen`

See: `shared/web-core/src/components/core/loaders/FullPageLoading.tsx`.

We Use it mostly in case we are navigating to a new route and it should mostly be used at the layout level.

### PageLoading

A loader sized to a single page region (not full screen). Use it inside a `PageWrapper` while the page's main data is fetching.

See `shared/web-core/src/components/core/loaders/PageLoading.tsx`.

### LoadingSpinner

A small inline spinner. Use it inside buttons, table rows, or other small UI surfaces where a full-page loader would be excessive.

See `shared/web-core/src/components/core/loaders/LoadingSpinner.tsx`.

### SpinnerWithText

A spinner paired with a status message. Use it for longer-running operations where the user needs to know what is happening (e.g. "Generating report…").

See `shared/web-core/src/components/core/loaders/SpinnerWithText.tsx`.

## Consistency rules

- Use the loader that matches the surface (full page, page region, inline) — don't introduce a new one that duplicates an existing one.
- Reuse the existing spinner icon across all loaders rather than mixing icon styles.
