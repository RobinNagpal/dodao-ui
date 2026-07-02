import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/** Max number of similar ETFs surfaced anywhere (matches the main detail page). */
export const SIMILAR_ETFS_LIMIT = 6;

/** Response shape of the `/similar-etfs` per-ETF endpoint. */
export interface EtfSimilarEtfsResponse {
  similarEtfs: SimilarEtf[];
}

interface StoredSimilarEtf {
  id: string;
  symbol: string;
  exchange: string;
  sortOrder: number;
}

/**
 * Hydrate the lightweight `EtfSimilarEtf` rows (symbol + exchange only) with the
 * peer's name and financial info so a full comparison table can be rendered.
 * Shared by the main detail page's `/full-render` endpoint and the dedicated
 * `/similar-etfs` endpoint (see {@link getSimilarEtfsForEtf}).
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
 * Prisma-side loader behind the `/similar-etfs` route: reads the source ETF's
 * stored peers (ordered, capped) and hydrates them with name + financial info.
 */
export async function getSimilarEtfsForEtf(spaceId: string, exchange: string, etf: string): Promise<SimilarEtf[]> {
  const where = getEtfWhereClause({ spaceId, exchange, etf });
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

/**
 * Server-component fetcher for the category sub-report pages. Hits the
 * `/similar-etfs` API over HTTP (same style as the pages' `fetchCategoryData` /
 * `fetchMorInfo`) so the response rides Next's Data Cache. Pass the page's own
 * cache tag(s) so the peer slice invalidates in lockstep with the rest of the
 * subpage — keeping the "one cache tag per subpage" topology intact. Returns an
 * empty list (never throws) so a peer-lookup hiccup can't fail the whole page.
 */
export async function fetchEtfSimilarEtfs(exchange: string, symbol: string, cacheTags: string[]): Promise<SimilarEtf[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${symbol.toUpperCase()}/similar-etfs`;
  try {
    const res = await fetch(url, { next: { tags: cacheTags } });
    if (!res.ok) return [];
    const json = (await res.json()) as EtfSimilarEtfsResponse;
    return json.similarEtfs ?? [];
  } catch {
    return [];
  }
}
