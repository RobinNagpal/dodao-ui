import { prisma } from '@/prisma';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { DailyMoverHistoryItem, TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { buildDateWhereClause } from '@/utils/daily-movers-date-utils';
import { buildTickerWhereClause } from '@/utils/daily-stock-movers';
import { getDailyMoversByCountryTag } from '@/utils/ticker-v1-cache-utils';
import { unstable_cache } from 'next/cache';

/**
 * Server-side data access for the daily top movers pages (overview + per-country
 * gainers/losers), shared with the corresponding API routes.
 *
 * The pages used to `fetch()` their own API routes with `getBaseUrl()`. That
 * breaks `next build` in any environment where `NEXT_PUBLIC_VERCEL_URL` is not
 * set: the base URL resolves to '' and the server-side fetch throws
 * `ERR_INVALID_URL` while prerendering `/daily-top-movers` (and would fail the
 * per-country pages at request time). Querying prisma directly — wrapped in
 * `unstable_cache` with the same revalidate window + cache tags the fetches
 * used — removes the self-HTTP hop entirely while keeping
 * `revalidateDailyMoversByCountryTag` invalidation working. Mirrors the
 * `tariff-reports-listing.ts` pattern.
 */

/** Same 14-day window the pages previously passed as `next.revalidate`. */
export const DAILY_MOVERS_REVALIDATE_SECONDS = 1209600;

/** Unique dates (YYYY-MM-DD, newest first) that have movers of `type` for `country`. */
export async function getDailyMoverAvailableDates(spaceId: string, country: string | null, type: DailyMoverType): Promise<string[]> {
  const where = {
    spaceId,
    ticker: buildTickerWhereClause(country),
  };
  const selectAndOrder = {
    select: { createdAt: true as const },
    orderBy: { createdAt: 'desc' as const },
    distinct: ['createdAt' as const],
  };

  const records =
    type === DailyMoverType.LOSER
      ? await prisma.dailyTopLoser.findMany({ where, ...selectAndOrder })
      : await prisma.dailyTopGainer.findMany({ where, ...selectAndOrder });

  const dateSet = new Set<string>();
  records.forEach((r) => {
    dateSet.add(new Date(r.createdAt).toISOString().split('T')[0]);
  });

  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

export async function getDailyTopGainers(spaceId: string, country: string | null, date?: string | null): Promise<TopGainerWithTicker[]> {
  return prisma.dailyTopGainer.findMany({
    where: {
      spaceId,
      ticker: buildTickerWhereClause(country),
      ...buildDateWhereClause(date),
    },
    include: { ticker: true },
    orderBy: [{ createdAt: 'desc' }, { percentageChange: 'desc' }],
  });
}

export async function getDailyTopLosers(spaceId: string, country: string | null, date?: string | null): Promise<TopLoserWithTicker[]> {
  return prisma.dailyTopLoser.findMany({
    where: {
      spaceId,
      ticker: buildTickerWhereClause(country),
      ...buildDateWhereClause(date),
    },
    include: { ticker: true },
    orderBy: [{ createdAt: 'desc' }, { percentageChange: 'asc' }],
  });
}

/** Most moves listed in a mover page's "other big moves" history. */
export const TICKER_MOVE_HISTORY_LIMIT = 10;

/**
 * Other gainer and loser pages for the same ticker (excluding `currentMoverId`), newest first, for the move
 * history and "Newer move" banner on a mover details page. Only moves whose analysis has been generated (have
 * a title) are listed, so the history never links to an empty page.
 */
export async function getTickerMoveHistory(spaceId: string, tickerId: string, currentMoverId: string): Promise<DailyMoverHistoryItem[]> {
  const query = {
    where: { spaceId, tickerId, id: { not: currentMoverId }, AND: [{ title: { not: null } }, { title: { not: '' } }] },
    select: { id: true, name: true, symbol: true, title: true, percentageChange: true, createdAt: true },
    orderBy: { createdAt: 'desc' as const },
    take: TICKER_MOVE_HISTORY_LIMIT,
  };
  const [gainers, losers] = await Promise.all([prisma.dailyTopGainer.findMany(query), prisma.dailyTopLoser.findMany(query)]);

  return [
    ...gainers.map((m) => ({ ...m, type: DailyMoverType.GAINER, createdAt: m.createdAt.toISOString() })),
    ...losers.map((m) => ({ ...m, type: DailyMoverType.LOSER, createdAt: m.createdAt.toISOString() })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, TICKER_MOVE_HISTORY_LIMIT);
}

/**
 * Cached variants for the server components. `unstable_cache` is created per
 * call because the cache tag depends on (country, type); the key parts make
 * each argument combination its own cache entry.
 */
export function getCachedDailyMoverAvailableDates(spaceId: string, country: string, type: DailyMoverType): Promise<string[]> {
  return unstable_cache(() => getDailyMoverAvailableDates(spaceId, country, type), ['daily-movers-available-dates', spaceId, country, type], {
    revalidate: DAILY_MOVERS_REVALIDATE_SECONDS,
    tags: [getDailyMoversByCountryTag(country, type)],
  })();
}

export function getCachedDailyMovers(
  spaceId: string,
  country: string,
  type: DailyMoverType,
  date?: string | null
): Promise<(TopGainerWithTicker | TopLoserWithTicker)[]> {
  return unstable_cache(
    () => (type === DailyMoverType.LOSER ? getDailyTopLosers(spaceId, country, date) : getDailyTopGainers(spaceId, country, date)),
    ['daily-movers', spaceId, country, type, date ?? 'latest'],
    {
      revalidate: DAILY_MOVERS_REVALIDATE_SECONDS,
      tags: [getDailyMoversByCountryTag(country, type)],
    }
  )();
}
