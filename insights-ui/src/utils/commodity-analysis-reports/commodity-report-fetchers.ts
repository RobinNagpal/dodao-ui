import type { CommodityListItem } from '@/app/api/[spaceId]/commodities-v1/listing/route';
import type { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { commoditySlugTag, COMMODITIES_LISTING_TAG, ONE_DAY_IN_SECONDS, ONE_WEEK_IN_SECONDS } from '@/utils/commodity-analysis-reports/commodity-cache-utils';
import type { CommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/**
 * Server-side HTTP fetchers for commodity report data. The report pages call
 * these instead of reading the JSON directly, mirroring the stock/ETF fetch
 * utils (each hits an `/api/.../commodities-v1/...` route via
 * `getBaseUrlForServerSidePages`).
 *
 * Caching (mirrors ETF/stock fetchers): each per-slug fetch carries the
 * `commoditySlugTag(slug)` Next.js Data Cache tag so a commodity's pages can be
 * purged together. The listing fetch carries the listing tag plus a 1-week
 * time-based revalidate; the live price history carries a 1-day revalidate.
 */

const apiBase = (): string => `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/commodities-v1`;

/** Every commodity (grouped/scored) for the `/commodities` index. */
export async function fetchCommodityListing(): Promise<CommodityListItem[]> {
  const url = `${apiBase()}/listing`;
  const res = await fetch(url, { next: { tags: [COMMODITIES_LISTING_TAG], revalidate: ONE_WEEK_IN_SECONDS } });
  if (!res.ok) throw new Error(`fetchCommodityListing failed (${res.status}): ${url}`);
  return (await res.json()) as CommodityListItem[];
}

/**
 * JSON round-trips `Date`s to ISO strings; revive the known date fields so the
 * report components keep receiving real `Date`s (top-level + per category).
 */
function reviveCommodityDates(c: CommodityWithAllData): CommodityWithAllData {
  return {
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    categoryAnalysisResults: c.categoryAnalysisResults.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    })),
  };
}

/** Full report payload for one commodity slug (used by main + sub reports). */
export async function fetchCommodityReport(slug: string): Promise<CommodityWithAllData> {
  const url = `${apiBase()}/${encodeURIComponent(slug)}/report`;
  const res = await fetch(url, { next: { tags: [commoditySlugTag(slug)] } });
  if (!res.ok) throw new Error(`fetchCommodityReport failed (${res.status}): ${url}`);
  return reviveCommodityDates((await res.json()) as CommodityWithAllData);
}

/** On-demand price history (daily + weekly) for the report page's price chart. */
export async function fetchCommodityPriceHistory(slug: string): Promise<PriceHistoryResponse | null> {
  const url = `${apiBase()}/${encodeURIComponent(slug)}/price-history`;
  const res = await fetch(url, { next: { tags: [commoditySlugTag(slug)], revalidate: ONE_DAY_IN_SECONDS } });
  if (!res.ok) throw new Error(`fetchCommodityPriceHistory failed (${res.status}): ${url}`);
  return (await res.json()) as PriceHistoryResponse | null;
}
