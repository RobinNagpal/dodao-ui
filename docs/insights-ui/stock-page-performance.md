# Why the stock pages are slow (and what we're fixing)

Google (GSC + PageSpeed) flags our `/stocks/*` pages as slow on mobile — LCP ~15s,
Performance score 37. The server itself is fast (30ms). All the slowness is in the
browser: too many bytes, sent uncompressed, and too much JavaScript to run.

Here are the reasons, simplest first.

## 1. Static files were not compressed and not on a CDN ✅ FIXED
Our CSS and JS files were downloaded straight from an S3 bucket in the US, with no
compression and no CDN. One stylesheet was **211 KB** and blocked the page for ~2.5s.
**Fix (done, PR #1668):** send `/_next/static/*` through CloudFront with compression on.
Same files, ~5x smaller over the wire, and cached close to the user. This is the big one.

## 2. Too much JavaScript loads up front ⬜ TO DO
About **1.3 MB** of JavaScript is downloaded and run that the page doesn't actually need
(two chunks are ~1 MB and ~0.6 MB). This is the main reason the page freezes for over a
second while it "wakes up".
**Next step:** run `pnpm analyze` to see what's inside those chunks, then load the heavy
parts only when needed.

## 3. Tracking scripts are loaded too early ⬜ TO DO
We run **5** analytics tools (Google Analytics, Google Tag Manager, umami, Clarity,
LogRocket). Two of them (Clarity, LogRocket) are bundled into the main app code even
though they aren't needed for the first paint.
**Next step:** load these only after the page is ready, and drop any tool we don't really use.

## 4. We ship code for very old browsers ⬜ TO DO
We have no "browser targets" set, so the build adds extra fallback code (polyfills, ~43 KB)
for browsers almost nobody uses.
**Next step:** add a modern `browserslist` to `package.json` so that code is dropped.

## 5. One big CSS file, mostly unused per page ⬜ MOSTLY FIXED BY #1
A single stylesheet covers the whole site, so any one page only uses a small part of it.
Compression (#1) already turns this ~211 KB into ~30 KB over the wire, so it's no longer a
real cost. Splitting it further is optional and low priority.

---

## What the bundle analyzer showed (Jul 2026)

We ran `pnpm analyze`. Note: the **server** report (`nodejs.html`) does **not** matter for page
speed — those big boxes (API routes, admin `create` pages) run on the server and are never sent to
the browser. Only the **browser** report (`client.html`) counts. Its heavy pieces:

- **Two big shared JS chunks** ("index.js + 580 modules" and "index.js + 320 modules", ~1 MB and
  ~0.6 MB) — the bundled vendor code. This is issue #2. Needs a closer look at what's inside.
- **chart.js** — shows up, but it's already loaded lazily (only when you scroll to a chart), so it's
  **not** in the first load. Leave it.
- **katex** (`katex.mjs`, a math-rendering library) — bundled into the browser even though KaTeX is
  **intentionally turned off** in insights-ui. It gets pulled in for free through the markdown helper
  (`parseMarkdown` → `getMarkedRenderer` → the katex extension → `import katex`), and some `'use
  client'` components import `parseMarkdown`, so it lands in the browser. This is dead weight — a few
  hundred KB we download and never use.
  **Next step:** stop importing katex when the extension isn't registered (a small change in
  `shared/web-core`'s `getMarkedRenderer` / `katexMarketExtension`, e.g. lazy/`import type`), or keep
  the markdown rendering server-side so it never ships to the browser.

So the two concrete JavaScript wins are: **(a)** drop the unused **katex** from the client bundle, and
**(b)** open the two big shared chunks to see which other libraries can be lazy-loaded.

---

**In short:** #1 (the biggest problem) is fixed. #2 and #3 are the next wins — both are about
sending and running less JavaScript (the analyzer points at unused **katex** and two big shared
chunks). #4 is a quick, cheap improvement. #5 is basically handled.
