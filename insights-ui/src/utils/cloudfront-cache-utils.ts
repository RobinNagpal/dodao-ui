import 'server-only';

import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { waitUntil } from '@vercel/functions';

/**
 * CloudFront cache-invalidation helper.
 *
 * Use alongside Next.js `revalidateTag(...)` calls so that the CloudFront edge
 * cache for the affected URL is purged at the same moment the upstream
 * (Vercel ISR / Data Cache) tags are invalidated. Without this, CloudFront
 * keeps the old HTML at the edge for up to its TTL (currently 6 days), so
 * users can see stale pages even after a successful save.
 *
 * Only the following paths are cached at CloudFront today (see
 * `deployments/insights-ui/cloudfront.tf`):
 *   - Pages: `/`, `/stocks/*`, `/etfs/*`, `/industry-tariff-report/*`, `/tariff-reports*`
 *   - Stocks API: the public GET endpoints under
 *     `/api/koala_gains/tickers-v1/exchange/{e}/{t}/` that a /stocks/* render fetches —
 *     `{business-and-moat,financial-statement-analysis,past-performance,future-performance,
 *     fair-value}-data`, `financial-info`, `quarterly-chart-data`, `price-history`,
 *     `competition-tickers` — plus `/api/koala_gains/tickers-v1/country/{c}/tickers/industries[/...]`.
 *     (The base `/exchange/{e}/{t}` fast route is intentionally NOT cached.)
 *   - ETF API: `/api/koala_gains/etfs-v1/exchange/{e}/{t}/{full-render,chart-data,mor-info,
 *     portfolio-holdings,competition,performance-returns-data,cost-efficiency-team-data,
 *     risk-analysis-data,future-performance-outlook-data}` (the per-ETF GET endpoints that back
 *     the /etfs/[exchange]/[etf] page tree)
 *
 * Calls for any other path are filtered out before reaching the AWS API — they
 * would not have a cache entry to purge and would just consume the monthly
 * invalidation quota.
 *
 * Configuration:
 * - `CLOUDFRONT_DISTRIBUTION_ID` env var must be set on Vercel.
 * - IAM credentials with `cloudfront:CreateInvalidation` permission must be
 *   provided to the Vercel runtime (set up separately).
 * - If the env var is not set, this module is a no-op (safe for preview / dev).
 */

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

/**
 * Literal mirror of the cached prefixes in `deployments/insights-ui/cloudfront.tf`.
 * An invalidation path is forwarded to AWS only if it starts with one of these.
 * Add a new entry here whenever a new `ordered_cache_behavior` is added there.
 */
const CACHED_PATH_PREFIXES = [
  '/stocks/',
  '/etfs/',
  '/industry-tariff-report/',
  '/tariff-reports', // matches the bare `/tariff-reports` listing and `/tariff-reports/...`
  '/api/koala_gains/tickers-v1/exchange/',
  '/api/koala_gains/tickers-v1/country/',
  '/api/koala_gains/etfs-v1/exchange/',
] as const;

let client: CloudFrontClient | null = null;

function getClient(): CloudFrontClient | null {
  if (!DISTRIBUTION_ID) return null;
  if (!client) {
    // CloudFront's control plane is global but its SDK endpoint lives in us-east-1.
    client = new CloudFrontClient({ region: 'us-east-1' });
  }
  return client;
}

function isCloudFrontCachedPath(path: string): boolean {
  return CACHED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Bucket a list of paths into the subset that CloudFront caches (and would
 * therefore actually invalidate) vs paths outside any cached prefix (a no-op
 * at AWS — sending them would still consume the monthly free invalidation
 * quota). Used by the admin "Invalidate cache" page so the operator can see
 * which entries were forwarded to CloudFront and which were ignored.
 */
export function classifyCloudFrontPaths(paths: ReadonlyArray<string>): { cached: string[]; uncached: string[] } {
  const cached: string[] = [];
  const uncached: string[] = [];
  for (const p of paths) {
    if (isCloudFrontCachedPath(p)) cached.push(p);
    else uncached.push(p);
  }
  return { cached, uncached };
}

/**
 * Discriminated result of a CloudFront invalidation attempt. Used by the
 * awaited variant so callers (admin "Invalidate cache" actions) can show a
 * specific success/error/no-op message to the user instead of pretending the
 * call succeeded.
 *
 * - `sent`: AWS accepted the invalidation request; `id` is the
 *   CloudFront invalidation ID.
 * - `skipped-no-distribution`: `CLOUDFRONT_DISTRIBUTION_ID` is unset on this
 *   runtime — the helper is a deliberate no-op (preview / local dev). When
 *   this surfaces in production it means the env var is missing on Vercel.
 * - `skipped-no-cached-paths`: every provided path was outside the
 *   CloudFront-cached prefixes, so AWS would have nothing to purge.
 * - `failed`: AWS rejected the call (most commonly IAM `AccessDenied` if the
 *   `insights-ui-project-policy` is not attached to the runtime's IAM user).
 */
export type CloudFrontInvalidationResult =
  | { status: 'sent'; id: string; paths: string[] }
  | { status: 'skipped-no-distribution'; paths: string[] }
  | { status: 'skipped-no-cached-paths'; paths: string[] }
  | { status: 'failed'; error: string; paths: string[] };

/**
 * Result of an admin-triggered cache-flush action. Shared shape used by the
 * stocks and ETF flush server actions in `cache-actions.ts` so the UI can
 * render a single notification regardless of which surface was flushed.
 *
 * `success` reflects the CloudFront outcome (env-missing / IAM-failure /
 * no-matching-path all surface as `false`); `cloudfront` carries the
 * structured detail for diagnostics.
 */
export interface CacheFlushResult {
  success: boolean;
  message: string;
  cloudfront: CloudFrontInvalidationResult;
}

export function formatCloudFrontResult(label: string, result: CloudFrontInvalidationResult): CacheFlushResult {
  switch (result.status) {
    case 'sent':
      return { success: true, message: `Cache invalidated for ${label} (CloudFront invalidation ${result.id})`, cloudfront: result };
    case 'skipped-no-distribution':
      return {
        success: false,
        message: `Vercel-side tags were cleared for ${label}, but CloudFront was NOT purged — CLOUDFRONT_DISTRIBUTION_ID env var is not set on this runtime.`,
        cloudfront: result,
      };
    case 'skipped-no-cached-paths':
      return {
        success: false,
        message: `Vercel-side tags were cleared for ${label}, but no provided paths matched a CloudFront-cached prefix. Check the path list in cloudfront-cache-utils.ts.`,
        cloudfront: result,
      };
    case 'failed':
      return {
        success: false,
        message: `Vercel-side tags were cleared for ${label}, but CloudFront invalidation failed: ${result.error}`,
        cloudfront: result,
      };
  }
}

function buildInvalidationCommand(dist: string, cachedPaths: string[]): CreateInvalidationCommand {
  return new CreateInvalidationCommand({
    DistributionId: dist,
    InvalidationBatch: {
      Paths: { Quantity: cachedPaths.length, Items: [...cachedPaths] },
      CallerReference: `revalidate-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    },
  });
}

/**
 * Schedule a CloudFront cache invalidation for the given paths. Fire-and-
 * forget: the response is not awaited inline. `waitUntil` keeps the Vercel
 * function alive until the AWS call completes so the invalidation survives
 * the function returning to the user.
 *
 * Paths can be exact (`/stocks/NYSE/RTX`) or wildcard (`/stocks/NYSE/RTX*`).
 * A wildcard counts as one billable path in CloudFront's monthly quota.
 *
 * Silently no-ops when:
 * - `CLOUDFRONT_DISTRIBUTION_ID` is not set
 * - All provided paths are outside the CloudFront-cached prefixes
 *
 * Errors are logged but never thrown — failed invalidations should not break
 * the upstream save flow.
 */
export function invalidateCloudFrontPaths(paths: ReadonlyArray<string>): void {
  const dist = DISTRIBUTION_ID;
  const c = getClient();
  if (!dist || !c) return;

  const cachedPaths = paths.filter(isCloudFrontCachedPath);
  if (cachedPaths.length === 0) return;

  const command = buildInvalidationCommand(dist, cachedPaths);

  const promise = c.send(command).then(
    (res) => console.log(`[cloudfront] Invalidated ${cachedPaths.join(', ')} (id=${res.Invalidation?.Id ?? '?'})`),
    (err) => console.error(`[cloudfront] Failed to invalidate ${cachedPaths.join(', ')}:`, err)
  );

  // waitUntil tells Vercel to keep the function alive until the promise
  // settles. Outside of a Vercel function context (e.g. local scripts) the
  // call throws — fall back to a plain orphaned promise.
  try {
    waitUntil(promise);
  } catch {
    void promise;
  }
}

/**
 * Awaited variant of `invalidateCloudFrontPaths`. Use from admin-triggered
 * flush actions that want to report real success/failure back to the user.
 * The save-flow callers should keep using `invalidateCloudFrontPaths` so user
 * saves don't block on the AWS round-trip.
 */
export async function invalidateCloudFrontPathsAwaited(paths: ReadonlyArray<string>): Promise<CloudFrontInvalidationResult> {
  const dist = DISTRIBUTION_ID;
  const c = getClient();
  if (!dist || !c) {
    return { status: 'skipped-no-distribution', paths: [...paths] };
  }

  const cachedPaths = paths.filter(isCloudFrontCachedPath);
  if (cachedPaths.length === 0) {
    return { status: 'skipped-no-cached-paths', paths: [...paths] };
  }

  try {
    const res = await c.send(buildInvalidationCommand(dist, cachedPaths));
    const id = res.Invalidation?.Id ?? '?';
    console.log(`[cloudfront] Invalidated ${cachedPaths.join(', ')} (id=${id})`);
    return { status: 'sent', id, paths: cachedPaths };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[cloudfront] Failed to invalidate ${cachedPaths.join(', ')}:`, err);
    return { status: 'failed', error, paths: cachedPaths };
  }
}
