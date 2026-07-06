import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/** Lightweight peer commodity shown in the "Similar Commodities" section. */
export interface SimilarCommodity {
  id: string;
  name: string;
  slug: string;
  commodityGroup: string;
  finalScore: number | null;
}

/**
 * Fetches same-group peer commodities from the shared `similar-commodities` API
 * (the same endpoint the report pages use). Promise-based so callers can hand it
 * to <CommoditySimilar> via `use()` and keep the Suspense boundary at the call
 * site. The prisma query itself lives in the route handler, mirroring the stock
 * `fetchSimilarTickers` / `similar-tickers` split.
 */
export async function fetchSimilarCommodities(slug: string): Promise<SimilarCommodity[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/commodities-v1/${encodeURIComponent(slug)}/similar-commodities`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchSimilarCommodities failed (${res.status}): ${url}`);

  return (await res.json()) as SimilarCommodity[];
}
