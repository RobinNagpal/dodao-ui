/**
 * Shared parsing + period definitions for the ETF "Returns / CAGR" bar chart.
 *
 * `EtfStockAnalyzerInfo` stores period returns and CAGR as raw strings from the
 * upstream screener (e.g. `"10.85%"`, `"-1.20%"`, `"-"`, `""`). The chart needs
 * numbers, and the API needs to compute peer-category averages from the same
 * source — keep the parsing rules here so server + client agree.
 */

import type { EtfStockAnalyzerInfo } from '@prisma/client';

export type EtfPerformanceMetric = 'return' | 'cagr';

export type EtfReturnPeriodKey = '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | '10Y' | '15Y' | '20Y';
export type EtfCagrPeriodKey = '1Y' | '3Y' | '5Y' | '10Y' | '15Y' | '20Y';

type ReturnFieldKey = 'return1m' | 'return3m' | 'return6m' | 'returnYtd' | 'return1y' | 'return3y' | 'return5y' | 'return10y' | 'return15y' | 'return20y';

type CagrFieldKey = 'cagr1y' | 'cagr3y' | 'cagr5y' | 'cagr10y' | 'cagr15y' | 'cagr20y';

export type EtfPerformanceMetricFields = Pick<EtfStockAnalyzerInfo, ReturnFieldKey | CagrFieldKey>;

export interface EtfPerformancePeriod {
  key: EtfReturnPeriodKey;
  label: string;
  returnField: ReturnFieldKey | null;
  cagrField: CagrFieldKey | null;
}

// Source: user spec — Returns includes intra-year + 1Y..20Y; CAGR is annualized
// only and only meaningful for >= 1Y. Order is short -> long to read left to
// right as a "near to far" timeline.
export const ETF_PERFORMANCE_PERIODS: ReadonlyArray<EtfPerformancePeriod> = [
  { key: '1M', label: '1M', returnField: 'return1m', cagrField: null },
  { key: '3M', label: '3M', returnField: 'return3m', cagrField: null },
  { key: '6M', label: '6M', returnField: 'return6m', cagrField: null },
  { key: 'YTD', label: 'YTD', returnField: 'returnYtd', cagrField: null },
  { key: '1Y', label: '1Y', returnField: 'return1y', cagrField: 'cagr1y' },
  { key: '3Y', label: '3Y', returnField: 'return3y', cagrField: 'cagr3y' },
  { key: '5Y', label: '5Y', returnField: 'return5y', cagrField: 'cagr5y' },
  { key: '10Y', label: '10Y', returnField: 'return10y', cagrField: 'cagr10y' },
  { key: '15Y', label: '15Y', returnField: 'return15y', cagrField: 'cagr15y' },
  { key: '20Y', label: '20Y', returnField: 'return20y', cagrField: 'cagr20y' },
] as const;

const PERCENT_OR_DASH_RE = /^-?\d+(?:\.\d+)?$/;

/**
 * Parse the screener's percentage strings to a finite number. Accepts
 * `"10.85%"`, `"10.85"`, `" -1.2 % "`, `"+5"`. Returns null for `null`, `""`,
 * `"-"`, `"N/A"`, or anything that doesn't look numeric.
 */
export function parsePercentString(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '--' || /^n\/?a$/i.test(trimmed)) return null;
  const cleaned = trimmed.replace(/%/g, '').replace(/,/g, '').replace(/^\+/, '').trim();
  if (!PERCENT_OR_DASH_RE.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export interface EtfPerformancePeriodValue {
  periodKey: EtfReturnPeriodKey;
  etf: number | null;
  categoryAverage: number | null;
}

export interface EtfPerformanceMetricSeries {
  metric: EtfPerformanceMetric;
  /** Period values in the order returned by `ETF_PERFORMANCE_PERIODS`. */
  values: ReadonlyArray<EtfPerformancePeriodValue>;
}

export interface EtfPerformanceMetricsPayload {
  category: string | null;
  categoryPeerCount: number;
  returns: EtfPerformanceMetricSeries;
  cagr: EtfPerformanceMetricSeries;
}

function averageOf<F extends ReturnFieldKey | CagrFieldKey>(field: F, peers: ReadonlyArray<EtfPerformanceMetricFields>): number | null {
  let sum = 0;
  let count = 0;
  for (const peer of peers) {
    const parsed = parsePercentString(peer[field]);
    if (parsed === null) continue;
    sum += parsed;
    count += 1;
  }
  if (count === 0) return null;
  return sum / count;
}

/**
 * Build the full chart payload (both Returns + CAGR series) for a given ETF +
 * its category peer set.
 *
 * `peers` should be filtered to the same `category` as the focal ETF; the
 * focal ETF itself should not be in `peers` (so a category of 1 doesn't show a
 * "vs. self" comparison).
 */
export function buildEtfPerformanceMetricsPayload(
  focal: EtfPerformanceMetricFields | null,
  peers: ReadonlyArray<EtfPerformanceMetricFields>,
  category: string | null
): EtfPerformanceMetricsPayload {
  const returnValues: EtfPerformancePeriodValue[] = ETF_PERFORMANCE_PERIODS.map((period) => {
    const field = period.returnField;
    return {
      periodKey: period.key,
      etf: focal && field ? parsePercentString(focal[field]) : null,
      categoryAverage: field ? averageOf(field, peers) : null,
    };
  });

  const cagrValues: EtfPerformancePeriodValue[] = ETF_PERFORMANCE_PERIODS.map((period) => {
    const field = period.cagrField;
    if (!field) return { periodKey: period.key, etf: null, categoryAverage: null };
    return {
      periodKey: period.key,
      etf: focal ? parsePercentString(focal[field]) : null,
      categoryAverage: averageOf(field, peers),
    };
  });

  return {
    category,
    categoryPeerCount: peers.length,
    returns: { metric: 'return', values: returnValues },
    cagr: { metric: 'cagr', values: cagrValues },
  };
}
