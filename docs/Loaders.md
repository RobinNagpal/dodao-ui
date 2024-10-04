# Loaders Documentation

## Overview

When building a web application, it’s essential to provide feedback to users while data is being fetched from an API or another external source. This is typically done by showing a "loading" state or a loader. Loaders improve user experience by indicating that the application is working in the background, reducing confusion, and keeping users informed that data is being retrieved.

This document outlines when and how to use loaders in the application, particularly when fetching data or handling loading states.

## Purpose of Loaders

Loaders serve the following primary purposes:
1. **User Feedback:** Let users know that the system is working to fetch or process data. Without a loader, users might think the app is broken or unresponsive.
2. **Prevent Interaction During Loading:** While the data is being fetched, loaders can disable user interaction to avoid any unintended behavior until the loading is complete.
3. **Enhance User Experience:** Provide a smooth and seamless experience by visually indicating that a task is in progress.

## When to Use Loaders

Loaders should be used whenever:
1. **Fetching Data from an API:** Whenever the application makes an API call to retrieve data, such as fetching user data, loading lists, or retrieving search results, a loader should be displayed to indicate that the data is being fetched.
2. **Submitting Data:** If there is a delay in submitting data to a server (e.g., form submission), a loader can provide feedback to the user that the system is processing the submission.
3. **Data Processing:** For any heavy processing on the frontend or when waiting for some asynchronous task to complete, loaders provide visual feedback.
4. **Page Navigation:** In scenarios where routing or navigation causes a delay, loaders can inform the user that a new page or data is being loaded.

## Types of Loaders

We have different loaders for different purposes so use the specified loader for that particular task

### FullPageLoaders

The FullPageLoader is most commonly used in our website present at `shared/web-core/src/components/core/loaders/FullPageLoading.tsx` We Use it mostly in case we are navigating to a new route where data might be fetched from the API and show this loader until data is loaded

### Edit Page Loaders

The EditPageLoaders are mostly used when data is fetched for editing of a particular thing the  here we mostly use `shared/web-core/src/components/core/loaders/PageLoading.tsx` .

### LoadingIcons

We also use the loadingIcons which include `shared/web-core/src/components/core/loaders/LoadingIcon.tsx` and `shared/web-core/src/components/core/loaders/LoadingSpinner.tsx` these are mostly used in the case only icon is required to show loading like inside a modal.


## Todos
- [ ] We need to be consistent with loaders usage like use the specified loader for the particular purpose
- [ ] Avoid creating same loaders
- [ ] Some loaders like `SectionLoader ,RowLoading ,Cardloader` are almost same and are not used elsewhere we need to either remove them or think of improving them
- [ ] We should be consitent with usage of icon  like right now we have spinner and icon one of them should be used only for consistency