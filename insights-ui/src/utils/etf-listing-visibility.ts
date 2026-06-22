import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { KoalaGainsSession } from '@/types/auth';
import { TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getServerSession } from 'next-auth/next';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * ETF listing visibility rule (shared across every listing surface).
 *
 * A "populated" ETF is one that has a generated report — i.e. an `EtfCachedScore`
 * row exists. The score is the last thing the generation pipeline writes (it is
 * derived from the per-category `EtfCategoryAnalysisResult` rows), so its presence
 * is the single most efficient and accurate signal that an ETF has real data.
 *
 * - Default (logged-out + non-admin users): only populated ETFs are listed.
 * - Admins: see every ETF, including ones without a generated report — same as the
 *   listing behaved before this filter was introduced.
 *
 * Unpopulated ETFs stay reachable by direct URL; this only filters the listings.
 *
 * The `includeUnpopulated=true` request flag is honored ONLY for admins. The page
 * (a Server Component that can read the session cookie) decides admin-ness and
 * forwards the cookie so the API route can independently re-verify. If that
 * re-verification ever fails, admins simply fall back to the populated-only view —
 * a safe default that never leaks unpopulated ETFs to non-admins.
 */
export const INCLUDE_UNPOPULATED_PARAM = 'includeUnpopulated';

/** True when the current request's session belongs to an Admin. Safe in both
 *  Server Components and Route Handlers (reads cookies from the ambient request). */
export async function isEtfAdminViewer(): Promise<boolean> {
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | null;
  return session?.role === 'Admin';
}

/**
 * Admin-aware fetch for the cached ETF listings index/grouping endpoints.
 * - Non-admin: the existing cached fetch (2-week revalidate + cache tag), which
 *   returns populated-only data.
 * - Admin: an uncached, cookie-authenticated fetch with `includeUnpopulated=true`
 *   so the full set is never cached under the public key.
 */
export async function fetchEtfListingsIndex(url: string, tag: string): Promise<Response> {
  if (await isEtfAdminViewer()) {
    const cookieHeader = (await headers()).get('cookie');
    const sep = url.includes('?') ? '&' : '?';
    return fetch(`${url}${sep}${INCLUDE_UNPOPULATED_PARAM}=true`, {
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
  }
  return fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [tag] } });
}

/**
 * Route-side check: returns true only when the request asked for unpopulated ETFs
 * (`includeUnpopulated=true`) AND the session is an admin. Anything else resolves
 * to false, so the populated-only filter is applied.
 */
export async function shouldIncludeUnpopulatedForRequest(req: NextRequest): Promise<boolean> {
  const { searchParams } = new URL(req.url);
  if (searchParams.get(INCLUDE_UNPOPULATED_PARAM) !== 'true') return false;
  return isEtfAdminViewer();
}
