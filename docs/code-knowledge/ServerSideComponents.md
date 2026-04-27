## Server-Side Rendering in Next.js

Next.js renders React components on the server by default in the App Router. Server components fetch data and render HTML on the server, which is then streamed to the client. This avoids shipping component code + data-fetching logic to the browser, which makes the initial render faster.

### When to use a server vs. client component

- **Default to server components.** Pages and most layout-level components should be server components.
- Use a client component (`'use client'`) only when you need interactivity (`onClick`, `onChange`, hooks like `useState` / `useEffect`, browser APIs).
- Keep client components small and push them down the tree — wrap an interactive widget in a client component, but keep the surrounding page server-rendered.

See [ui/page-structure.md](ui/page-structure.md) for our standard server-component page shape (`PageWrapper`, `Breadcrumbs`, `generateMetadata`, async params).
