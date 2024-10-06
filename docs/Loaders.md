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
When to use - ????

See `shared/web-core/src/components/core/loaders/PageLoading.tsx` .

### LoadingSpinner
When to use - ????

See: `shared/web-core/src/components/core/loaders/LoadingSpinner.tsx`


### SpinnerWithText
When to use - ????

See: `shared/web-core/src/components/core/loaders/SpinnerWithText.tsx`

# Specific Loaders
We do have very specific loaders which can be renamed or updated to solve the same purpose but be a bit more generic
for better code reusability

- See: `shared/web-core/src/components/core/loaders/TidbitDetailsLoader.tsx`
- See: `shared/web-core/src/components/core/loaders/TidbitsGridLoader.tsx`


## Todos
- [ ] We need to be consistent with loaders usage like use the specified loader for the particular purpose
- [ ] Avoid creating same loaders
- [ ] Some loaders like `SectionLoader, RowLoading, Cardloader` are almost same and are not used elsewhere we need to either remove them or think of improving them
- [ ] We should be consitent with usage of icon  like right now we have spinner and icon one of them should be used only for consistency
