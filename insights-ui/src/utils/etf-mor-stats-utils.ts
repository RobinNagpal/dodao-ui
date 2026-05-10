import { MorFieldKind, MorPeriodKey } from '@/utils/etf-filter-utils';

export const MOR_STATS_FIELDS: ReadonlyArray<MorFieldKind> = ['upside', 'downside', 'risk'];

export function isNumericMorField(field: MorFieldKind): boolean {
  return field === 'upside' || field === 'downside';
}

export interface MorNumericStats {
  field: MorFieldKind;
  period: MorPeriodKey;
  kind: 'numeric';
  count: number;
  average: number | null;
  median: number | null;
  mode: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  p25: number | null;
  p75: number | null;
}

export interface MorCategoricalStats {
  field: MorFieldKind;
  period: MorPeriodKey;
  kind: 'categorical';
  count: number;
  mode: string | null;
  distribution: Record<string, number>;
}

export type MorFieldStats = MorNumericStats | MorCategoricalStats;

export type MorStatsByPeriod = Record<MorPeriodKey, MorFieldStats>;
export type MorStatsByFieldByPeriod = Record<MorFieldKind, MorStatsByPeriod>;

function round2(v: number | null | undefined): number | null {
  if (v === null || v === undefined || !Number.isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

function median(sortedAsc: number[]): number | null {
  const n = sortedAsc.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sortedAsc[mid - 1] + sortedAsc[mid]) / 2 : sortedAsc[mid];
}

function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
}

function modeNumber(values: number[]): number | null {
  if (values.length === 0) return null;
  // Bucket to integers so noisy capture-ratio readings cluster sensibly.
  const counts = new Map<number, number>();
  for (const v of values) {
    const bucket = Math.round(v);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  let bestKey: number | null = null;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      bestKey = k;
    }
  }
  return bestKey;
}

function modeString(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let bestKey: string | null = null;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      bestKey = k;
    }
  }
  return bestKey;
}

export function computeNumericStats(rawValues: ReadonlyArray<number | null>, field: MorFieldKind, period: MorPeriodKey): MorNumericStats {
  const values: number[] = [];
  for (const v of rawValues) {
    if (v !== null && Number.isFinite(v)) values.push(v);
  }
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  if (count === 0) {
    return {
      field,
      period,
      kind: 'numeric',
      count: 0,
      average: null,
      median: null,
      mode: null,
      min: null,
      max: null,
      stdDev: null,
      p25: null,
      p75: null,
    };
  }
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = sum / count;
  const variance = sorted.reduce((acc, v) => acc + (v - avg) ** 2, 0) / count;
  return {
    field,
    period,
    kind: 'numeric',
    count,
    average: round2(avg),
    median: round2(median(sorted)),
    mode: modeNumber(sorted),
    min: round2(sorted[0]),
    max: round2(sorted[count - 1]),
    stdDev: round2(Math.sqrt(variance)),
    p25: round2(percentile(sorted, 0.25)),
    p75: round2(percentile(sorted, 0.75)),
  };
}

export function computeCategoricalStats(rawValues: ReadonlyArray<string | null>, field: MorFieldKind, period: MorPeriodKey): MorCategoricalStats {
  const values: string[] = [];
  for (const v of rawValues) {
    if (v && v.trim()) values.push(v.trim());
  }
  const distribution: Record<string, number> = {};
  for (const v of values) distribution[v] = (distribution[v] ?? 0) + 1;
  return { field, period, kind: 'categorical', count: values.length, mode: modeString(values), distribution };
}
