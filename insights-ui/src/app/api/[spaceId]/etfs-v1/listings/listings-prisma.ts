/**
 * Prisma helpers shared by every /api/[spaceId]/etfs-v1/listings/* route.
 * Lives alongside the routes (not in src/utils) so UI pages can't import it —
 * listing data must always be fetched through the HTTP API so it benefits from
 * the per-listing cache tag + 2-week TTL configured on the page fetch.
 */
import { prisma } from '@/prisma';
import type { EtfGroupingPreview, EtfGroupingPreviewItem, EtfProvidersPreview, EtfUncategorizedPreview } from '@/types/etf/etf-listings-types';
import { canonicalizeCategory, expandCategoryAliases } from '@/utils/etf-category-aliases';
import { parseNumericStringValue } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry, getEtfExchangesByCountry } from '@/utils/etfCountryExchangeUtils';

export type { EtfGroupingPreview, EtfGroupingPreviewItem, EtfProvidersPreview, EtfUncategorizedPreview };

const TOP_N_PER_GROUPING = 5;

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

async function loadRawEtfRows(spaceId: string, mode: GroupingMode, dbValues: string[], country?: EtfSupportedCountry): Promise<RawEtfRow[]> {
  if (dbValues.length === 0) return [];

  const baseWhere =
    mode === 'category'
      ? { spaceId, stockAnalyzerInfo: { is: { category: { in: dbValues } } } }
      : { spaceId, stockAnalyzerInfo: { is: { assetClass: { in: dbValues } } } };

  const where = country ? { ...baseWhere, exchange: { in: getEtfExchangesByCountry(country) } } : baseWhere;

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
  country?: EtfSupportedCountry
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
  const rawRows = await loadRawEtfRows(spaceId, mode, dbValues, country);

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
export async function fetchAllEtfsByCategory(spaceId: string, categoryNames: string[], country?: EtfSupportedCountry): Promise<EtfGroupingPreview> {
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
  const rawRows = await loadRawEtfRows(spaceId, 'category', dbValues, country);

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
export async function fetchUncategorizedEtfPreview(spaceId: string, country?: EtfSupportedCountry): Promise<EtfUncategorizedPreview> {
  const baseWhere = {
    spaceId,
    OR: [{ stockAnalyzerInfo: { is: null } }, { stockAnalyzerInfo: { is: { category: null } } }],
  };
  const where = country ? { ...baseWhere, exchange: { in: getEtfExchangesByCountry(country) } } : baseWhere;

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

/** Bucketed by issuer (provider). */
export async function fetchEtfProvidersForCountry(spaceId: string, country?: EtfSupportedCountry): Promise<EtfProvidersPreview> {
  const baseWhere = { spaceId, stockAnalyzerInfo: { is: { issuer: { not: null } } } };
  const where = country ? { ...baseWhere, exchange: { in: getEtfExchangesByCountry(country) } } : baseWhere;

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
