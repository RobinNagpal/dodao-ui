import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

/** Max number of similar ETFs surfaced anywhere (matches the main detail page). */
export const SIMILAR_ETFS_LIMIT = 6;

interface StoredSimilarEtf {
  id: string;
  symbol: string;
  exchange: string;
  sortOrder: number;
}

/**
 * Hydrate the lightweight `EtfSimilarEtf` rows (symbol + exchange only) with the
 * peer's name and financial info so a full comparison table can be rendered.
 * Shared by the main detail page's `/full-render` endpoint and the category
 * sub-report pages (see {@link fetchSimilarEtfsForEtf}).
 */
export async function hydrateSimilarEtfs(spaceId: string, stored: ReadonlyArray<StoredSimilarEtf>): Promise<SimilarEtf[]> {
  if (stored.length === 0) return [];

  const etfs = await prisma.etf.findMany({
    where: {
      spaceId,
      OR: stored.map((s) => ({ symbol: s.symbol, exchange: s.exchange })),
    },
    select: {
      symbol: true,
      exchange: true,
      name: true,
      financialInfo: true,
    },
  });
  const byKey = new Map(etfs.map((e) => [`${e.symbol}|${e.exchange}`, e]));

  return stored.map((s) => {
    const match = byKey.get(`${s.symbol}|${s.exchange}`);
    const fi = match?.financialInfo ?? null;
    return {
      id: s.id,
      symbol: s.symbol,
      exchange: s.exchange,
      name: match?.name ?? s.symbol,
      aum: fi?.aum ?? null,
      expenseRatio: fi?.expenseRatio ?? null,
      pe: fi?.pe ?? null,
      sharesOut: fi?.sharesOut ?? null,
      dividendTtm: fi?.dividendTtm ?? null,
      dividendYield: fi?.dividendYield ?? null,
      payoutFrequency: fi?.payoutFrequency ?? null,
      payoutRatio: fi?.payoutRatio ?? null,
      volume: fi?.volume ?? null,
      yearHigh: fi?.yearHigh ?? null,
      yearLow: fi?.yearLow ?? null,
      beta: fi?.beta ?? null,
      holdings: fi?.holdings ?? null,
    };
  });
}

/**
 * Server-side helper for ETF category sub-report pages. Hits Prisma directly so
 * the call rides the per-page ISR cache (no separate fetch-cache entry). Mirrors
 * {@link fetchEtfAvailableSlugs} in `EtfRelatedSections.tsx`.
 *
 * Kick this off in a parent server component (without `await`) and pass the
 * returned Promise to the report, unwrapped inside a `<Suspense>` boundary, so
 * the peer lookup runs in parallel with the rest of the report render.
 */
export async function fetchSimilarEtfsForEtf(exchange: string, symbol: string): Promise<SimilarEtf[]> {
  const where = getEtfWhereClause({ spaceId: KoalaGainsSpaceId, exchange, etf: symbol });
  if (!where.symbol || !where.exchange) return [];

  const etfRecord = await prisma.etf.findFirst({
    where,
    select: {
      spaceId: true,
      similarEtfs: {
        orderBy: { sortOrder: 'asc' },
        take: SIMILAR_ETFS_LIMIT,
        select: { id: true, symbol: true, exchange: true, sortOrder: true },
      },
    },
  });
  if (!etfRecord) return [];

  return hydrateSimilarEtfs(etfRecord.spaceId, etfRecord.similarEtfs);
}
