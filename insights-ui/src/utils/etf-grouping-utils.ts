import { prisma } from '@/prisma';
import { parseNumericStringValue } from '@/utils/etf-filter-utils';
import { ETF_EXCHANGE_TO_COUNTRY, EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

export interface EtfGroupingPreviewItem {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  finalScore: number | null;
  hasDetailedReport: boolean;
}

export interface EtfGroupingPreview<TKey extends string = string> {
  values: Map<TKey, EtfGroupingPreviewItem[]>;
  counts: Map<TKey, number>;
}

const TOP_N_PER_GROUPING = 5;

type GroupingMode = 'category' | 'assetClass';

interface FetchEtfsForGroupingsArgs<TKey extends string> {
  spaceId: string;
  mode: GroupingMode;
  // Maps the raw DB value (category name or assetClass label) to the output bucket key.
  // Multiple raw values can share the same key (e.g. all categories in a group → group key).
  valueToKey: Map<string, TKey>;
  // Restrict preview to ETFs whose exchange belongs to this country.
  country?: EtfSupportedCountry;
}

function exchangesForCountry(country: EtfSupportedCountry): string[] {
  return Object.entries(ETF_EXCHANGE_TO_COUNTRY)
    .filter(([, c]) => c === country)
    .map(([ex]) => ex);
}

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

  const where = country ? { ...baseWhere, exchange: { in: exchangesForCountry(country) } } : baseWhere;

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

  const combined = [...withReport, ...withoutReport].slice(0, TOP_N_PER_GROUPING);

  return combined.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    exchange: r.exchange,
    name: r.name,
    finalScore: r.finalScore,
    hasDetailedReport: r.finalScore !== null,
  }));
}

export async function fetchEtfsForGroupings<TKey extends string>({
  spaceId,
  mode,
  valueToKey,
  country,
}: FetchEtfsForGroupingsArgs<TKey>): Promise<EtfGroupingPreview<TKey>> {
  const dbValues = Array.from(valueToKey.keys());
  const rawRows = await loadRawEtfRows(spaceId, mode, dbValues, country);

  const rowsByKey = new Map<TKey, RawEtfRow[]>();
  const counts = new Map<TKey, number>();

  for (const row of rawRows) {
    const dbValue = mode === 'category' ? row.category : row.assetClass;
    if (!dbValue) continue;
    const outputKey = valueToKey.get(dbValue);
    if (!outputKey) continue;
    const bucket = rowsByKey.get(outputKey) ?? [];
    bucket.push(row);
    rowsByKey.set(outputKey, bucket);
    counts.set(outputKey, (counts.get(outputKey) ?? 0) + 1);
  }

  const values = new Map<TKey, EtfGroupingPreviewItem[]>();
  for (const [outputKey, rows] of rowsByKey.entries()) {
    values.set(outputKey, selectTopFive(rows));
  }

  return { values, counts };
}
