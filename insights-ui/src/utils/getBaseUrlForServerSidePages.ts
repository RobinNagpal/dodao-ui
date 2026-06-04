import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

/**
 * Canonical, user-facing site origin — ALWAYS the public domain, on every platform
 * (local, Vercel, AWS), before and after the Vercel→AWS cut-over.
 *
 * Use this for sitemap hostnames, canonical tags, OpenGraph URLs, and any absolute URL that
 * gets emitted into rendered output. Do NOT use it as a server-side fetch target: on AWS that
 * would route SSR self-requests through CloudFront's long-TTL cache and serve stale data.
 */
export function getCanonicalUrl(): string {
  return 'https://koalagains.com';
}

/**
 * Base URL a Server Component / route handler uses to fetch THIS app's OWN `/api` routes during
 * server render. Resolves to the RUNNING host so each deployment fetches itself directly:
 *   - local:    `http://localhost:3000`
 *   - AWS prod: `https://prod.koalagains.com`  (direct CNAME to the container — NOT behind
 *               CloudFront, so reads are always fresh)
 *   - Vercel:   `getBaseUrl()` is '' server-side → falls back to the canonical origin
 *
 * `getBaseUrl()` already returns the correct running host on every platform (it reads
 * NEXT_PUBLIC_VERCEL_URL/ENV, which AWS bakes as prod.koalagains.com and Vercel leaves unset).
 * This is byte-for-byte identical to the previous behavior on Vercel ('' → koalagains.com) and
 * local (localhost:3000); only AWS changes — previously it hardcoded koalagains.com and hit
 * CloudFront's stale cache, now it fetches its own fresh origin.
 *
 * NOTE: the name is kept for its many existing self-fetch call sites. For sitemap/canonical
 * URLs use {@link getCanonicalUrl} instead.
 */
export function getBaseUrlForServerSidePages(): string {
  return getBaseUrl() || getCanonicalUrl();
}
