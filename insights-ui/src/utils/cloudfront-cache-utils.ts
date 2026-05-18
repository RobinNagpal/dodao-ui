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
 * Only paths under `/stocks/*`, `/etfs/*`, `/industry-tariff-report/*`, or
 * `/tariff-reports*` are cached at CloudFront today (see
 * `dodao-api-v2-deployment/cloudfront.tf`). Calls for any other path are
 * filtered out before reaching the AWS API — they would not have a cache
 * entry to purge and would just consume the monthly invalidation quota.
 *
 * Configuration:
 * - `CLOUDFRONT_DISTRIBUTION_ID` env var must be set on Vercel.
 * - IAM credentials with `cloudfront:CreateInvalidation` permission must be
 *   provided to the Vercel runtime (set up separately).
 * - If the env var is not set, this module is a no-op (safe for preview / dev).
 */

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

const CACHED_PATH_PATTERNS = [/^\/stocks(\/|$)/, /^\/etfs(\/|$)/, /^\/industry-tariff-report(\/|$)/, /^\/tariff-reports(\/|\*|$)/];

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
  return CACHED_PATH_PATTERNS.some((pattern) => pattern.test(path));
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

  const command = new CreateInvalidationCommand({
    DistributionId: dist,
    InvalidationBatch: {
      Paths: { Quantity: cachedPaths.length, Items: [...cachedPaths] },
      CallerReference: `revalidate-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    },
  });

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
