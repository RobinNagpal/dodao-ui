/**
 * Prisma helpers shared by every /api/[spaceId]/etfs-v1/listings/* route, plus the
 * per-route loaders (`getEtf*IndexData` / `getEtfGroupDetailData`) that both the
 * routes and the listing pages call. Pages call the loaders in-process via
 * `src/utils/etf-listing-fetchers.ts`, which wraps them in `unstable_cache` with the
 * same per-listing cache tag + TTL the page fetch used — they must not call these
 * directly without that wrapper.
 */
import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { prisma } from '@/prisma';
import type { EtfGroupingPreview, EtfGroupingPreviewItem, EtfProvidersPreview, EtfUncategorizedPreview } from '@/types/etf/etf-listings-types';
import { canonicalizeCategory, expandCategoryAliases } from '@/utils/etf-category-aliases';
import { ETF_OTHERS_GROUP_KEY, getAllEtfGroups, getCategoriesForGroupKey, getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { ETF_ASSET_CLASS_OPTIONS, parseNumericStringValue } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry, getEtfExchangesByCountry } from '@/utils/etfCountryExchangeUtils';

export type { EtfGroupingPreview, EtfGroupingPreviewItem, EtfProvidersPreview, EtfUncategorizedPreview };

const TOP_N_PER_GROUPING = 5;

/**
 * A "populated" ETF has a generated report, signalled by the presence of an
 * `EtfCachedScore` row (the score is the last artifact the generation pipeline
 * writes). AND-ed into every listing query unless the caller is an admin asking
 * to include unpopulated ETFs. See `etf-listing-visibility.ts`.
 */
const POPULATED_ETF_WHERE = { cachedScore: { isNot: null } } as const;

type GroupingMode = 'category' | 'assetClass';

interface RawEtfRow {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  assetClass: string | null;
  category: string | null;
  finalScore: number | null;
  aum: string | null;
}

async function loadRawEtfRows(
  spaceId: string,
  mode: GroupingMode,
  dbValues: string[],
  country?: EtfSupportedCountry,
  includeUnpopulated = false
): Promise<RawEtfRow[]> {
  if (dbValues.length === 0) return [];

  const baseWhere =
    mode === 'category'
      ? { spaceId, stockAnalyzerInfo: { is: { category: { in: dbValues } } } }
      : { spaceId, stockAnalyzerInfo: { is: { assetClass: { in: dbValues } } } };

  const where = {
    ...baseWhere,
    ...(country ? { exchange: { in: getEtfExchangesByCountry(country) } } : {}),
    ...(includeUnpopulated ? {} : POPULATED_ETF_WHERE),
  };

  const etfs = await prisma.etf.findMany({
    where,
    select: {
      id: true,
      symbol: true,
      name: true,
      exchange: true,
      stockAnalyzerInfo: { select: { assetClass: true, category: true } },
      financialInfo: { select: { aum: true } },
      cachedScore: { select: { finalScore: true } },
    },
  });

  return etfs.map((etf) => ({
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    assetClass: etf.stockAnalyzerInfo?.assetClass ?? null,
    category: etf.stockAnalyzerInfo?.category ?? null,
    finalScore: etf.cachedScore?.finalScore ?? null,
    aum: etf.financialInfo?.aum ?? null,
  }));
}

function selectTopFive(rows: RawEtfRow[]): EtfGroupingPreviewItem[] {
  const withReport = rows.filter((r) => r.finalScore !== null).sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
  const withoutReport = rows.filter((r) => r.finalScore === null).sort((a, b) => (parseNumericStringValue(b.aum) ?? 0) - (parseNumericStringValue(a.aum) ?? 0));
  return [...withReport, ...withoutReport].slice(0, TOP_N_PER_GROUPING).map((r) => ({
    id: r.id,
    symbol: r.symbol,
    exchange: r.exchange,
    name: r.name,
    finalScore: r.finalScore,
    hasDetailedReport: r.finalScore !== null,
  }));
}

function sortByScoreThenAum(rows: RawEtfRow[]): EtfGroupingPreviewItem[] {
  const withReport = rows.filter((r) => r.finalScore !== null).sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
  const withoutReport = rows.filter((r) => r.finalScore === null).sort((a, b) => (parseNumericStringValue(b.aum) ?? 0) - (parseNumericStringValue(a.aum) ?? 0));
  return [...withReport, ...withoutReport].map((r) => ({
    id: r.id,
    symbol: r.symbol,
    exchange: r.exchange,
    name: r.name,
    finalScore: r.finalScore,
    hasDetailedReport: r.finalScore !== null,
  }));
}

/** Top-5 ETFs bucketed by an arbitrary key mapping (used by index pages). */
export async function fetchEtfsForGroupings(
  spaceId: string,
  mode: GroupingMode,
  valueToKey: Map<string, string>,
  country?: EtfSupportedCountry,
  includeUnpopulated = false
): Promise<EtfGroupingPreview> {
  if (mode === 'category') {
    const canonicalToBucket = new Map(valueToKey);
    for (const [canonical, bucketKey] of canonicalToBucket) {
      const expansions = expandCategoryAliases([canonical]);
      for (const raw of expansions) {
        if (!valueToKey.has(raw)) valueToKey.set(raw, bucketKey);
      }
    }
  }

  const dbValues = Array.from(valueToKey.keys());
  const rawRows = await loadRawEtfRows(spaceId, mode, dbValues, country, includeUnpopulated);

  const rowsByKey = new Map<string, RawEtfRow[]>();
  const counts: Record<string, number> = {};

  for (const row of rawRows) {
    const dbValue = mode === 'category' ? row.category : row.assetClass;
    if (!dbValue) continue;
    const lookupValue = mode === 'category' ? canonicalizeCategory(dbValue) : dbValue;
    const outputKey = valueToKey.get(lookupValue) ?? valueToKey.get(dbValue);
    if (!outputKey) continue;
    const bucket = rowsByKey.get(outputKey) ?? [];
    bucket.push(row);
    rowsByKey.set(outputKey, bucket);
    counts[outputKey] = (counts[outputKey] ?? 0) + 1;
  }

  const values: Record<string, EtfGroupingPreviewItem[]> = {};
  for (const [outputKey, rows] of rowsByKey.entries()) {
    values[outputKey] = selectTopFive(rows);
  }

  return { values, counts };
}

/**
 * Every ETF (no top-N cap) bucketed by category. Used by the group detail page,
 * which lists every ETF in each category packed into columns.
 */
export async function fetchAllEtfsByCategory(
  spaceId: string,
  categoryNames: string[],
  country?: EtfSupportedCountry,
  includeUnpopulated = false
): Promise<EtfGroupingPreview> {
  const valueToKey = new Map<string, string>();
  for (const name of categoryNames) valueToKey.set(name, name);

  const canonicalToBucket = new Map(valueToKey);
  for (const [canonical, bucketKey] of canonicalToBucket) {
    const expansions = expandCategoryAliases([canonical]);
    for (const raw of expansions) {
      if (!valueToKey.has(raw)) valueToKey.set(raw, bucketKey);
    }
  }

  const dbValues = Array.from(valueToKey.keys());
  const rawRows = await loadRawEtfRows(spaceId, 'category', dbValues, country, includeUnpopulated);

  const rowsByKey = new Map<string, RawEtfRow[]>();
  const counts: Record<string, number> = {};

  for (const row of rawRows) {
    if (!row.category) continue;
    const lookup = canonicalizeCategory(row.category);
    const bucketKey = valueToKey.get(lookup) ?? valueToKey.get(row.category);
    if (!bucketKey) continue;
    const bucket = rowsByKey.get(bucketKey) ?? [];
    bucket.push(row);
    rowsByKey.set(bucketKey, bucket);
    counts[bucketKey] = (counts[bucketKey] ?? 0) + 1;
  }

  const values: Record<string, EtfGroupingPreviewItem[]> = {};
  for (const [bucketKey, rows] of rowsByKey.entries()) {
    values[bucketKey] = sortByScoreThenAum(rows);
  }

  return { values, counts };
}

/** ETFs whose category is null or whose stockAnalyzerInfo row is missing entirely. */
export async function fetchUncategorizedEtfPreview(
  spaceId: string,
  country?: EtfSupportedCountry,
  includeUnpopulated = false
): Promise<EtfUncategorizedPreview> {
  const baseWhere = {
    spaceId,
    OR: [{ stockAnalyzerInfo: { is: null } }, { stockAnalyzerInfo: { is: { category: null } } }],
  };
  const where = {
    ...baseWhere,
    ...(country ? { exchange: { in: getEtfExchangesByCountry(country) } } : {}),
    ...(includeUnpopulated ? {} : POPULATED_ETF_WHERE),
  };

  const etfs = await prisma.etf.findMany({
    where,
    select: {
      id: true,
      symbol: true,
      name: true,
      exchange: true,
      stockAnalyzerInfo: { select: { assetClass: true, category: true } },
      financialInfo: { select: { aum: true } },
      cachedScore: { select: { finalScore: true } },
    },
  });

  const rows: RawEtfRow[] = etfs.map((etf) => ({
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    assetClass: etf.stockAnalyzerInfo?.assetClass ?? null,
    category: etf.stockAnalyzerInfo?.category ?? null,
    finalScore: etf.cachedScore?.finalScore ?? null,
    aum: etf.financialInfo?.aum ?? null,
  }));

  return { items: selectTopFive(rows), count: rows.length };
}

/**
 * ETFs that have no value for a given stockAnalyzer text field — the value is
 * null/empty, or the whole stockAnalyzerInfo row is missing. Powers the "Others"
 * bucket on the asset-class and provider index pages, mirroring
 * `fetchUncategorizedEtfPreview` for the groups index, so the index totals
 * account for every populated ETF — not just the ones that carry an asset class
 * or issuer.
 */
async function fetchEtfsMissingStockAnalyzerField(
  spaceId: string,
  field: 'assetClass' | 'issuer',
  country?: EtfSupportedCountry,
  includeUnpopulated = false
): Promise<EtfUncategorizedPreview> {
  const missing =
    field === 'assetClass'
      ? [{ stockAnalyzerInfo: { is: { assetClass: null } } }, { stockAnalyzerInfo: { is: { assetClass: '' } } }]
      : [{ stockAnalyzerInfo: { is: { issuer: null } } }, { stockAnalyzerInfo: { is: { issuer: '' } } }];

  const where = {
    spaceId,
    OR: [{ stockAnalyzerInfo: { is: null } }, ...missing],
    ...(country ? { exchange: { in: getEtfExchangesByCountry(country) } } : {}),
    ...(includeUnpopulated ? {} : POPULATED_ETF_WHERE),
  };

  const etfs = await prisma.etf.findMany({
    where,
    select: {
      id: true,
      symbol: true,
      name: true,
      exchange: true,
      financialInfo: { select: { aum: true } },
      cachedScore: { select: { finalScore: true } },
    },
  });

  const rows: RawEtfRow[] = etfs.map((etf) => ({
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    assetClass: null,
    category: null,
    finalScore: etf.cachedScore?.finalScore ?? null,
    aum: etf.financialInfo?.aum ?? null,
  }));

  return { items: selectTopFive(rows), count: rows.length };
}

/** ETFs with no asset class — the "Others" bucket for the asset-class index. */
export function fetchEtfsWithoutAssetClass(spaceId: string, country?: EtfSupportedCountry, includeUnpopulated = false): Promise<EtfUncategorizedPreview> {
  return fetchEtfsMissingStockAnalyzerField(spaceId, 'assetClass', country, includeUnpopulated);
}

/** ETFs with no issuer — the "Others" bucket for the provider index. */
export function fetchEtfsWithoutIssuer(spaceId: string, country?: EtfSupportedCountry, includeUnpopulated = false): Promise<EtfUncategorizedPreview> {
  return fetchEtfsMissingStockAnalyzerField(spaceId, 'issuer', country, includeUnpopulated);
}

/** Bucketed by issuer (provider). */
export async function fetchEtfProvidersForCountry(spaceId: string, country?: EtfSupportedCountry, includeUnpopulated = false): Promise<EtfProvidersPreview> {
  const baseWhere = { spaceId, stockAnalyzerInfo: { is: { issuer: { not: null } } } };
  const where = {
    ...baseWhere,
    ...(country ? { exchange: { in: getEtfExchangesByCountry(country) } } : {}),
    ...(includeUnpopulated ? {} : POPULATED_ETF_WHERE),
  };

  const etfs = await prisma.etf.findMany({
    where,
    select: {
      id: true,
      symbol: true,
      name: true,
      exchange: true,
      stockAnalyzerInfo: { select: { issuer: true } },
      financialInfo: { select: { aum: true } },
      cachedScore: { select: { finalScore: true } },
    },
  });

  const rowsByIssuer = new Map<string, RawEtfRow[]>();
  const counts: Record<string, number> = {};

  for (const etf of etfs) {
    const issuer = etf.stockAnalyzerInfo?.issuer?.trim();
    if (!issuer) continue;
    const row: RawEtfRow = {
      id: etf.id,
      symbol: etf.symbol,
      name: etf.name,
      exchange: etf.exchange,
      assetClass: null,
      category: null,
      finalScore: etf.cachedScore?.finalScore ?? null,
      aum: etf.financialInfo?.aum ?? null,
    };
    const bucket = rowsByIssuer.get(issuer) ?? [];
    bucket.push(row);
    rowsByIssuer.set(issuer, bucket);
    counts[issuer] = (counts[issuer] ?? 0) + 1;
  }

  const values: Record<string, EtfGroupingPreviewItem[]> = {};
  for (const [issuer, rows] of rowsByIssuer.entries()) {
    values[issuer] = selectTopFive(rows);
  }

  const providers = Object.keys(counts).sort((a, b) => {
    const diff = (counts[b] ?? 0) - (counts[a] ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  return { providers, values, counts };
}

/* ------------------------------------------------------------------ */
/*  Per-route loaders (route handlers + listing pages)                 */
/* ------------------------------------------------------------------ */

/** `/listings/groups-index`: per-category + per-group previews and the "Others" bucket. */
export async function getEtfGroupsIndexData(
  spaceId: string,
  country: EtfSupportedCountry | undefined,
  includeUnpopulated: boolean
): Promise<EtfGroupsIndexResponse> {
  const groups = getAllEtfGroups();

  const categoryValueToKey = new Map<string, string>();
  const groupValueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      categoryValueToKey.set(cat.name, cat.name);
      groupValueToKey.set(cat.name, group.key);
    }
  }

  const [byCategory, byGroup, others] = await Promise.all([
    fetchEtfsForGroupings(spaceId, 'category', categoryValueToKey, country, includeUnpopulated),
    fetchEtfsForGroupings(spaceId, 'category', groupValueToKey, country, includeUnpopulated),
    fetchUncategorizedEtfPreview(spaceId, country, includeUnpopulated),
  ]);

  return {
    categoryValues: byCategory.values,
    categoryCounts: byCategory.counts,
    groupCounts: byGroup.counts,
    others,
  };
}

/** `/listings/asset-classes-index`: per-asset-class previews and the "Others" bucket. */
export async function getEtfAssetClassesIndexData(
  spaceId: string,
  country: EtfSupportedCountry | undefined,
  includeUnpopulated: boolean
): Promise<EtfAssetClassesIndexResponse> {
  const valueToKey = new Map<string, string>();
  for (const opt of ETF_ASSET_CLASS_OPTIONS) {
    if (opt.value !== '') valueToKey.set(opt.value, opt.value);
  }

  const [grouped, others] = await Promise.all([
    fetchEtfsForGroupings(spaceId, 'assetClass', valueToKey, country, includeUnpopulated),
    fetchEtfsWithoutAssetClass(spaceId, country, includeUnpopulated),
  ]);

  return { values: grouped.values, counts: grouped.counts, others };
}

/** `/listings/providers-index`: provider buckets plus the "Others" (no issuer) bucket. */
export async function getEtfProvidersIndexData(
  spaceId: string,
  country: EtfSupportedCountry | undefined,
  includeUnpopulated: boolean
): Promise<EtfProvidersIndexResponse> {
  const [providers, others] = await Promise.all([
    fetchEtfProvidersForCountry(spaceId, country, includeUnpopulated),
    fetchEtfsWithoutIssuer(spaceId, country, includeUnpopulated),
  ]);

  return { ...providers, others };
}

/** `/listings/group`: one group's per-category previews (or the "Others" bucket). */
export async function getEtfGroupDetailData(
  spaceId: string,
  country: EtfSupportedCountry | undefined,
  groupKey: string | undefined,
  includeUnpopulated: boolean
): Promise<EtfGroupDetailResponse> {
  if (!groupKey) {
    return { found: false, values: {}, counts: {}, others: null };
  }

  const groupObj = getEtfGroupByKey(groupKey);
  if (!groupObj) {
    return { found: false, values: {}, counts: {}, others: null };
  }

  if (groupObj.key === ETF_OTHERS_GROUP_KEY) {
    const others = await fetchUncategorizedEtfPreview(spaceId, country, includeUnpopulated);
    return { found: true, values: {}, counts: {}, others };
  }

  const categories = getCategoriesForGroupKey(groupObj.key);
  const categoryNames = categories.map((c) => c.name);
  const { values, counts } = await fetchAllEtfsByCategory(spaceId, categoryNames, country, includeUnpopulated);

  return { found: true, values, counts, others: null };
}
