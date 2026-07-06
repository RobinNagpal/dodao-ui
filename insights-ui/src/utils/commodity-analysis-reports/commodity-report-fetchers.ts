import type { CommodityListItem } from '@/app/api/[spaceId]/commodities-v1/listing/route';
import type { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { CommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

/**
 * Server-side HTTP fetchers for commodity report data. The report pages call
 * these instead of prisma directly, mirroring the stock/ETF fetch utils (each
 * hits an `/api/.../commodities-v1/...` route via `getBaseUrlForServerSidePages`).
 */

const apiBase = (): string => `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/commodities-v1`;

/** Every commodity in the space (grouped/scored) for the `/commodities` index. */
export async function fetchCommodityListing(): Promise<CommodityListItem[]> {
  const url = `${apiBase()}/listing`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchCommodityListing failed (${res.status}): ${url}`);
  return (await res.json()) as CommodityListItem[];
}

/**
 * JSON round-trips `Date`s to ISO strings; revive the known date fields so the
 * report components keep receiving real `Date`s (unchanged from the prisma path).
 */
function reviveCommodityDates(c: CommodityWithAllData): CommodityWithAllData {
  return {
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    keyFactsReport: c.keyFactsReport
      ? { ...c.keyFactsReport, createdAt: new Date(c.keyFactsReport.createdAt), updatedAt: new Date(c.keyFactsReport.updatedAt) }
      : null,
    cachedScore: c.cachedScore ? { ...c.cachedScore, createdAt: new Date(c.cachedScore.createdAt), updatedAt: new Date(c.cachedScore.updatedAt) } : null,
    categoryAnalysisResults: c.categoryAnalysisResults.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      factorResults: r.factorResults.map((f) => ({ ...f, createdAt: new Date(f.createdAt), updatedAt: new Date(f.updatedAt) })),
    })),
  };
}

/** Full report payload for one commodity slug (used by main + sub reports). */
export async function fetchCommodityReport(slug: string): Promise<CommodityWithAllData> {
  const url = `${apiBase()}/${encodeURIComponent(slug)}/report`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchCommodityReport failed (${res.status}): ${url}`);
  return reviveCommodityDates((await res.json()) as CommodityWithAllData);
}

/** On-demand price history (daily + weekly) for the report page's price chart. */
export async function fetchCommodityPriceHistory(slug: string): Promise<PriceHistoryResponse | null> {
  const url = `${apiBase()}/${encodeURIComponent(slug)}/price-history`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchCommodityPriceHistory failed (${res.status}): ${url}`);
  return (await res.json()) as PriceHistoryResponse | null;
}
