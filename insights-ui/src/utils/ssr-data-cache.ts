import { unstable_cache } from 'next/cache';

/**
 * Helpers for Server Components that read data DIRECTLY (shared prisma/util functions) instead of
 * `fetch()`ing this app's own `/api` routes over HTTP.
 *
 * Why: on AWS the app is a single Lightsail container. A self-fetch goes out through the public
 * host + the Lightsail load balancer and back into the SAME Node process, so every page render
 * held extra sockets/LB slots while the process was already busy rendering. Under a crawler burst
 * that turned into 504s on the self-fetches, a failed health check and a container replacement.
 * Calling the data function in-process removes that hop entirely.
 *
 * The two helpers map 1:1 onto the `fetch()` cache semantics the pages used (all of these routes
 * are `dynamic = 'force-dynamic'`):
 *
 *  - `fetch(url, { next: { tags } })` (no `revalidate`) or `fetch(url, { cache: 'no-store' })`:
 *    under `force-dynamic` Next does NOT store these in the Data Cache (revalidate resolves to 0);
 *    they were only memoized per request. → {@link ssrRequestData} (fresh per request, no Data
 *    Cache entry). Wrap the page-level loader in React `cache()` to keep the per-request dedupe
 *    between `generateMetadata` and the page body.
 *
 *  - `fetch(url, { next: { tags, revalidate: N } })`: stored in the Data Cache with those tags and
 *    that TTL. → {@link ssrCachedData} (`unstable_cache` with the SAME tags + revalidate, so every
 *    existing `revalidateTag(...)` helper keeps invalidating it).
 *
 * Both return the value cloned through JSON, so the page sees exactly the shape `await res.json()`
 * used to give it (Dates → ISO strings, `undefined` keys dropped) — on cache hits and misses alike.
 */

/** Clone a value through JSON, matching what an API route's `NextResponse.json()` → `res.json()` produced. */
export function toJsonShape<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

/** In-process replacement for an uncached self-fetch (`next: { tags }` only, or `cache: 'no-store'`). */
export async function ssrRequestData<T>(load: () => Promise<T>): Promise<T> {
  return toJsonShape(await load());
}

export interface SsrCacheOptions {
  /** Same tags the replaced `fetch()` passed in `next.tags`. */
  tags: string[];
  /** Same TTL (seconds) the replaced `fetch()` passed in `next.revalidate`. */
  revalidate: number;
}

/**
 * In-process replacement for a Data-Cached self-fetch (`next: { tags, revalidate }`).
 * `keyParts` must uniquely identify the call's arguments (like the URL did for `fetch`).
 * Errors are thrown, not cached — same as `fetch`, which only stores OK responses.
 */
export function ssrCachedData<T>(keyParts: string[], options: SsrCacheOptions, load: () => Promise<T>): Promise<T> {
  return unstable_cache(async () => toJsonShape(await load()), ['ssr-data', ...keyParts], {
    tags: options.tags,
    revalidate: options.revalidate,
  })();
}
