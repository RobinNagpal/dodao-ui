import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { ETF_OTHERS_GROUP_KEY, getCategoriesForGroupKey, getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { expandCategoryAliases } from '@/utils/etf-category-aliases';

/** ----- Types and Enums ----- */

export enum EtfFilterType {
  AUM = 'aum',
  EXPENSE_RATIO = 'expenseRatio',
  PE_RATIO = 'peRatio',
  DIVIDEND_TTM = 'dividendTtm',
  DIVIDEND_YIELD = 'dividendYield',
  PAYOUT_FREQUENCY = 'payoutFrequency',
  HOLDINGS = 'holdings',
  VOLUME = 'volume',
  BETA = 'beta',
  DIVIDEND_YEARS = 'dividendYears',
  SORTINO = 'sortino',
  SHARPE = 'sharpe',
  ASSET_CLASS = 'assetClass',
  CATEGORY = 'category',
  GROUP = 'group',
  ISSUER = 'issuer',
  SEARCH = 'search',
  // AI score thresholds (per category + total) — backed by EtfCachedScore.
  PERFORMANCE_SCORE = 'performanceScoreThreshold',
  FUTURE_SCORE = 'futureScoreThreshold',
  RISK_SCORE = 'riskScoreThreshold',
  COST_SCORE = 'costScoreThreshold',
  TOTAL_SCORE = 'totalScoreThreshold',
  // Advanced (Mor) filters — per period
  MOR_UPSIDE_3YR = 'morUpside3yr',
  MOR_UPSIDE_5YR = 'morUpside5yr',
  MOR_UPSIDE_10YR = 'morUpside10yr',
  MOR_DOWNSIDE_3YR = 'morDownside3yr',
  MOR_DOWNSIDE_5YR = 'morDownside5yr',
  MOR_DOWNSIDE_10YR = 'morDownside10yr',
  MOR_RISK_3YR = 'morRisk3yr',
  MOR_RISK_5YR = 'morRisk5yr',
  MOR_RISK_10YR = 'morRisk10yr',
}

export enum EtfFilterParamKey {
  AUM = 'aum',
  EXPENSE_RATIO = 'expenseRatio',
  PE_RATIO = 'peRatio',
  DIVIDEND_TTM = 'dividendTtm',
  DIVIDEND_YIELD = 'dividendYield',
  PAYOUT_FREQUENCY = 'payoutFrequency',
  HOLDINGS = 'holdings',
  VOLUME = 'volume',
  BETA = 'beta',
  DIVIDEND_YEARS = 'dividendYears',
  SORTINO = 'sortino',
  SHARPE = 'sharpe',
  ASSET_CLASS = 'assetClass',
  CATEGORY = 'category',
  GROUP = 'group',
  ISSUER = 'issuer',
  SEARCH = 'search',
  // AI score thresholds (per category + total) — backed by EtfCachedScore.
  PERFORMANCE_SCORE = 'performanceScoreThreshold',
  FUTURE_SCORE = 'futureScoreThreshold',
  RISK_SCORE = 'riskScoreThreshold',
  COST_SCORE = 'costScoreThreshold',
  TOTAL_SCORE = 'totalScoreThreshold',
  // Advanced (Mor) filters — per period
  MOR_UPSIDE_3YR = 'morUpside3yr',
  MOR_UPSIDE_5YR = 'morUpside5yr',
  MOR_UPSIDE_10YR = 'morUpside10yr',
  MOR_DOWNSIDE_3YR = 'morDownside3yr',
  MOR_DOWNSIDE_5YR = 'morDownside5yr',
  MOR_DOWNSIDE_10YR = 'morDownside10yr',
  MOR_RISK_3YR = 'morRisk3yr',
  MOR_RISK_5YR = 'morRisk5yr',
  MOR_RISK_10YR = 'morRisk10yr',
}

export type EtfSearchParams = { [key: string]: string | string[] | undefined };

export interface ThresholdOption {
  label: string;
  value: string;
}

/** Comparator for custom numeric filters: `>` (gt), `<` (lt), `=` (eq). */
export type NumericFilterOp = 'gt' | 'lt' | 'eq';

export const NUMERIC_FILTER_OP_SYMBOLS: Record<NumericFilterOp, string> = {
  lt: '<',
  eq: '=',
  gt: '>',
};

export interface NumericFilterCriteria {
  op?: NumericFilterOp;
  value?: number;
  min?: number;
  max?: number;
  negative?: boolean;
}

/**
 * Parse a numeric filter URL value into structured criteria. Supports three
 * coexisting encodings:
 *  - `negative`            → values below zero (where a `Negative` bucket exists)
 *  - `gt:`/`lt:`/`eq:`<n>  → custom operator + value (n may use K/M/B/T suffixes)
 *  - `<min>-<max>`         → legacy preset bucket range (either bound optional)
 */
export function parseNumericFilterValue(raw: string | undefined): NumericFilterCriteria | null {
  if (!raw || !raw.trim()) return null;
  const v = raw.trim();

  if (v === 'negative') return { negative: true };

  const opMatch = v.match(/^(gt|lt|eq):(.+)$/);
  if (opMatch) {
    const value = parseNumericStringValue(opMatch[2]);
    if (value === null) return null;
    return { op: opMatch[1] as NumericFilterOp, value };
  }

  const range = parseRangeParam(v);
  if (range) return { min: range.min, max: range.max };
  return null;
}

/** Build a Prisma numeric `where` fragment from parsed criteria. The shape is
 *  shared by Float and Int nullable filters, so callers cast to the right type. */
export function numericCriteriaToPrismaFilter(c: NumericFilterCriteria): Record<string, number> | null {
  if (c.negative) return { lt: 0 };
  if (c.op === 'gt') return { gt: c.value as number };
  if (c.op === 'lt') return { lt: c.value as number };
  if (c.op === 'eq') return { equals: c.value as number };
  const f: Record<string, number> = {};
  if (c.min !== undefined) f.gte = c.min;
  if (c.max !== undefined) f.lte = c.max;
  return Object.keys(f).length > 0 ? f : null;
}

/** App-level equivalent of {@link numericCriteriaToPrismaFilter}, used where the
 *  source column is a formatted string (e.g. AUM) and must be parsed in code. */
export function matchesNumericCriteria(value: number | null, c: NumericFilterCriteria): boolean {
  if (value === null) return false;
  if (c.negative) return value < 0;
  if (c.op === 'gt') return value > (c.value as number);
  if (c.op === 'lt') return value < (c.value as number);
  if (c.op === 'eq') return value === (c.value as number);
  if (c.min !== undefined && value < c.min) return false;
  if (c.max !== undefined && value > c.max) return false;
  return true;
}

/** Compact human-readable number for filter chip labels (e.g. 1.5B, 250M, 0.3). */
export function formatCompactNumber(v: number): string {
  const abs = Math.abs(v);
  const trim = (n: number, suffix: string): string => `${parseFloat(n.toFixed(2))}${suffix}`;
  if (abs >= 1e9) return trim(v / 1e9, 'B');
  if (abs >= 1e6) return trim(v / 1e6, 'M');
  if (abs >= 1e3) return trim(v / 1e3, 'K');
  return `${parseFloat(v.toFixed(4))}`;
}

export interface AppliedEtfFilterBase {
  type: EtfFilterType;
  label: string;
  paramKey: EtfFilterParamKey;
}

type RangeFilterType =
  | EtfFilterType.AUM
  | EtfFilterType.EXPENSE_RATIO
  | EtfFilterType.PE_RATIO
  | EtfFilterType.DIVIDEND_TTM
  | EtfFilterType.DIVIDEND_YIELD
  | EtfFilterType.HOLDINGS
  | EtfFilterType.VOLUME
  | EtfFilterType.BETA
  | EtfFilterType.DIVIDEND_YEARS
  | EtfFilterType.SORTINO
  | EtfFilterType.SHARPE
  | EtfFilterType.MOR_UPSIDE_3YR
  | EtfFilterType.MOR_UPSIDE_5YR
  | EtfFilterType.MOR_UPSIDE_10YR
  | EtfFilterType.MOR_DOWNSIDE_3YR
  | EtfFilterType.MOR_DOWNSIDE_5YR
  | EtfFilterType.MOR_DOWNSIDE_10YR;

type ScoreFilterType =
  | EtfFilterType.PERFORMANCE_SCORE
  | EtfFilterType.FUTURE_SCORE
  | EtfFilterType.RISK_SCORE
  | EtfFilterType.COST_SCORE
  | EtfFilterType.TOTAL_SCORE;

type SelectFilterType =
  | EtfFilterType.PAYOUT_FREQUENCY
  | EtfFilterType.ASSET_CLASS
  | EtfFilterType.CATEGORY
  | EtfFilterType.GROUP
  | EtfFilterType.ISSUER
  | EtfFilterType.MOR_RISK_3YR
  | EtfFilterType.MOR_RISK_5YR
  | EtfFilterType.MOR_RISK_10YR;

export interface AppliedEtfRangeFilter extends AppliedEtfFilterBase {
  type: RangeFilterType;
  // The original URL param value, kept verbatim so the modal can round-trip it
  // back into the matching control (bucket value, `negative`, or `op:value`).
  raw?: string;
  minValue?: number;
  maxValue?: number;
  // Operator form: `op` + `value` (e.g. expense ratio < 0.3).
  op?: NumericFilterOp;
  value?: number;
  negative?: boolean;
}

export interface AppliedEtfSelectFilter extends AppliedEtfFilterBase {
  type: SelectFilterType;
  selectedValue: string;
}

export interface AppliedEtfSearchFilter extends AppliedEtfFilterBase {
  type: EtfFilterType.SEARCH;
  searchQuery: string;
}

export interface AppliedEtfScoreFilter extends AppliedEtfFilterBase {
  type: ScoreFilterType;
  threshold: number;
}

export type AppliedEtfFilter = AppliedEtfRangeFilter | AppliedEtfSelectFilter | AppliedEtfSearchFilter | AppliedEtfScoreFilter;

const SCORE_FILTER_TYPES: Set<string> = new Set([
  EtfFilterType.PERFORMANCE_SCORE,
  EtfFilterType.FUTURE_SCORE,
  EtfFilterType.RISK_SCORE,
  EtfFilterType.COST_SCORE,
  EtfFilterType.TOTAL_SCORE,
]);

export type EtfSelectedFiltersMap = Record<string, string>;

export interface EtfFilterParams {
  [key: string]: string | undefined;
}

/** ----- Constants ----- */

export const ETF_AUM_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Micro (< $100M)', value: '0-100000000' },
  { label: 'Small ($100M - $500M)', value: '100000000-500000000' },
  { label: 'Medium ($500M - $2B)', value: '500000000-2000000000' },
  { label: 'Large ($2B - $10B)', value: '2000000000-10000000000' },
  { label: 'Very Large (> $10B)', value: '10000000000-' },
] as const;

export const ETF_EXPENSE_RATIO_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Ultra Low (< 0.1%)', value: '0-0.1' },
  { label: 'Low (0.1% - 0.3%)', value: '0.1-0.3' },
  { label: 'Moderate (0.3% - 0.75%)', value: '0.3-0.75' },
  { label: 'High (0.75% - 1%)', value: '0.75-1' },
  { label: 'Very High (> 1%)', value: '1-' },
] as const;

export const ETF_PE_RATIO_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low (< 15)', value: '0-15' },
  { label: 'Moderate (15 - 25)', value: '15-25' },
  { label: 'High (25 - 50)', value: '25-50' },
  { label: 'Very High (> 50)', value: '50-' },
  { label: 'Negative / N/A', value: 'negative' },
] as const;

export const ETF_DIVIDEND_TTM_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'None / Very Low (< $0.5)', value: '0-0.5' },
  { label: 'Low ($0.5 - $2)', value: '0.5-2' },
  { label: 'Moderate ($2 - $5)', value: '2-5' },
  { label: 'High ($5 - $10)', value: '5-10' },
  { label: 'Very High (> $10)', value: '10-' },
] as const;

export const ETF_PAYOUT_FREQUENCY_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Semi-Annual', value: 'Semi-Annual' },
  { label: 'Annual', value: 'Annual' },
  { label: 'Weekly', value: 'Weekly' },
] as const;

export const ETF_HOLDINGS_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Very Few (1 - 5)', value: '0-5' },
  { label: 'Few (5 - 15)', value: '5-15' },
  { label: 'Moderate (15 - 50)', value: '15-50' },
  { label: 'Many (50 - 250)', value: '50-250' },
  { label: 'Very Many (250+)', value: '250-' },
] as const;

// Daily trading volume buckets (shares). Source column is a Float, treated as raw share count.
export const ETF_VOLUME_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Thin (< 50K)', value: '0-50000' },
  { label: 'Light (50K - 250K)', value: '50000-250000' },
  { label: 'Moderate (250K - 1M)', value: '250000-1000000' },
  { label: 'Active (1M - 5M)', value: '1000000-5000000' },
  { label: 'Heavy (> 5M)', value: '5000000-' },
] as const;

export const ETF_BETA_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Negative (< 0)', value: 'negative' },
  { label: 'Low (0 - 0.5)', value: '0-0.5' },
  { label: 'Below Market (0.5 - 0.8)', value: '0.5-0.8' },
  { label: 'Market (0.8 - 1.2)', value: '0.8-1.2' },
  { label: 'Above Market (1.2 - 1.5)', value: '1.2-1.5' },
  { label: 'High (> 1.5)', value: '1.5-' },
] as const;

export const ETF_DIVIDEND_YIELD_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'None (< 0.5%)', value: '0-0.5' },
  { label: 'Low (0.5% - 2%)', value: '0.5-2' },
  { label: 'Moderate (2% - 4%)', value: '2-4' },
  { label: 'High (4% - 6%)', value: '4-6' },
  { label: 'Very High (> 6%)', value: '6-' },
] as const;

export const ETF_DIVIDEND_YEARS_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'None (0)', value: '0-0' },
  { label: 'New (1 - 3)', value: '1-3' },
  { label: 'Established (3 - 10)', value: '3-10' },
  { label: 'Long (10 - 20)', value: '10-20' },
  { label: 'Aristocrat (20+)', value: '20-' },
] as const;

// Risk-adjusted return ratios (higher is better). Sourced from EtfStockAnalyzerInfo.
export const ETF_SHARPE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Negative (< 0)', value: 'negative' },
  { label: 'Low (0 - 1)', value: '0-1' },
  { label: 'Good (1 - 2)', value: '1-2' },
  { label: 'Very Good (2 - 3)', value: '2-3' },
  { label: 'Excellent (> 3)', value: '3-' },
] as const;

export const ETF_SORTINO_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Negative (< 0)', value: 'negative' },
  { label: 'Low (0 - 1)', value: '0-1' },
  { label: 'Good (1 - 2)', value: '1-2' },
  { label: 'Very Good (2 - 3)', value: '2-3' },
  { label: 'Excellent (> 3)', value: '3-' },
] as const;

export const ETF_ASSET_CLASS_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Equity', value: 'Equity' },
  { label: 'Fixed Income', value: 'Fixed Income' },
  { label: 'Commodity', value: 'Commodity' },
  { label: 'Alternatives', value: 'Alternatives' },
  { label: 'Multi-Asset', value: 'Multi-Asset' },
  { label: 'Currency', value: 'Currency' },
] as const;

export const ETF_ISSUER_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'BlackRock', value: 'BlackRock' },
  { label: 'Vanguard', value: 'Vanguard' },
  { label: 'State Street', value: 'State Street' },
  { label: 'Invesco', value: 'Invesco' },
  { label: 'Schwab', value: 'Schwab' },
  { label: 'First Trust', value: 'First Trust' },
  { label: 'ProShares', value: 'ProShares' },
  { label: 'WisdomTree', value: 'WisdomTree' },
  { label: 'Goldman Sachs', value: 'Goldman Sachs' },
  { label: 'JPMorgan', value: 'JPMorgan' },
  { label: 'Fidelity', value: 'Fidelity' },
  { label: 'Direxion', value: 'Direxion' },
  { label: 'Global X', value: 'Global X' },
  { label: 'PIMCO', value: 'PIMCO' },
  { label: 'Innovator', value: 'Innovator' },
  { label: 'VanEck', value: 'VanEck' },
  { label: 'ARK', value: 'ARK' },
  { label: 'Dimensional', value: 'Dimensional' },
] as const;

/** Per-category AI score thresholds (each category caps at 5 factors passed). */
export const ETF_CATEGORY_SCORE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 3', value: '3' },
  { label: '≥ 4', value: '4' },
  { label: '≥ 5', value: '5' },
] as const;

/** Total score is the sum across 4 categories — surface across out of 20. */
export const ETF_TOTAL_SCORE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 12', value: '12' },
  { label: '≥ 14', value: '14' },
  { label: '≥ 16', value: '16' },
] as const;

export type EtfCachedScoreField =
  | 'performanceAndReturnsScore'
  | 'futurePerformanceOutlookScore'
  | 'riskAnalysisScore'
  | 'costEfficiencyAndTeamScore'
  | 'finalScore';

export interface EtfScoreFilterDef {
  label: string;
  paramKey: EtfFilterParamKey;
  filterType: ScoreFilterType;
  cachedScoreField: EtfCachedScoreField;
  options: ReadonlyArray<ThresholdOption>;
}

export const ETF_CATEGORY_SCORE_DEFS: ReadonlyArray<EtfScoreFilterDef> = [
  {
    label: 'Past Performance',
    paramKey: EtfFilterParamKey.PERFORMANCE_SCORE,
    filterType: EtfFilterType.PERFORMANCE_SCORE,
    cachedScoreField: 'performanceAndReturnsScore',
    options: ETF_CATEGORY_SCORE_OPTIONS,
  },
  {
    label: 'Future Outlook',
    paramKey: EtfFilterParamKey.FUTURE_SCORE,
    filterType: EtfFilterType.FUTURE_SCORE,
    cachedScoreField: 'futurePerformanceOutlookScore',
    options: ETF_CATEGORY_SCORE_OPTIONS,
  },
  {
    label: 'Risk Analysis',
    paramKey: EtfFilterParamKey.RISK_SCORE,
    filterType: EtfFilterType.RISK_SCORE,
    cachedScoreField: 'riskAnalysisScore',
    options: ETF_CATEGORY_SCORE_OPTIONS,
  },
  {
    label: 'Cost Efficiency',
    paramKey: EtfFilterParamKey.COST_SCORE,
    filterType: EtfFilterType.COST_SCORE,
    cachedScoreField: 'costEfficiencyAndTeamScore',
    options: ETF_CATEGORY_SCORE_OPTIONS,
  },
] as const;

export const ETF_TOTAL_SCORE_DEF: EtfScoreFilterDef = {
  label: 'Total Score',
  paramKey: EtfFilterParamKey.TOTAL_SCORE,
  filterType: EtfFilterType.TOTAL_SCORE,
  cachedScoreField: 'finalScore',
  options: ETF_TOTAL_SCORE_OPTIONS,
};

const ALL_SCORE_DEFS: ReadonlyArray<EtfScoreFilterDef> = [...ETF_CATEGORY_SCORE_DEFS, ETF_TOTAL_SCORE_DEF];

export const ETF_MOR_UPSIDE_CAPTURE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low (< 85)', value: '0-85' },
  { label: 'Below Avg (85 - 95)', value: '85-95' },
  { label: 'Average (95 - 105)', value: '95-105' },
  { label: 'Above Avg (105 - 115)', value: '105-115' },
  { label: 'High (> 115)', value: '115-' },
] as const;

export const ETF_MOR_DOWNSIDE_CAPTURE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Excellent (< 50)', value: '0-50' },
  { label: 'Good (50 - 80)', value: '50-80' },
  { label: 'Average (80 - 100)', value: '80-100' },
  { label: 'Below Avg (100 - 115)', value: '100-115' },
  { label: 'Poor (> 115)', value: '115-' },
] as const;

export const ETF_MOR_RISK_LEVEL_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Conservative', value: 'Conservative' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Aggressive', value: 'Aggressive' },
  { label: 'Very Aggressive', value: 'Very Aggressive' },
  { label: 'Extreme', value: 'Extreme' },
] as const;

const ALL_ETF_PARAM_KEYS: EtfFilterParamKey[] = [
  EtfFilterParamKey.AUM,
  EtfFilterParamKey.EXPENSE_RATIO,
  EtfFilterParamKey.PE_RATIO,
  EtfFilterParamKey.DIVIDEND_TTM,
  EtfFilterParamKey.DIVIDEND_YIELD,
  EtfFilterParamKey.PAYOUT_FREQUENCY,
  EtfFilterParamKey.HOLDINGS,
  EtfFilterParamKey.VOLUME,
  EtfFilterParamKey.BETA,
  EtfFilterParamKey.DIVIDEND_YEARS,
  EtfFilterParamKey.SORTINO,
  EtfFilterParamKey.SHARPE,
  EtfFilterParamKey.ASSET_CLASS,
  EtfFilterParamKey.CATEGORY,
  EtfFilterParamKey.GROUP,
  EtfFilterParamKey.ISSUER,
  EtfFilterParamKey.SEARCH,
  EtfFilterParamKey.PERFORMANCE_SCORE,
  EtfFilterParamKey.FUTURE_SCORE,
  EtfFilterParamKey.RISK_SCORE,
  EtfFilterParamKey.COST_SCORE,
  EtfFilterParamKey.TOTAL_SCORE,
  EtfFilterParamKey.MOR_UPSIDE_3YR,
  EtfFilterParamKey.MOR_UPSIDE_5YR,
  EtfFilterParamKey.MOR_UPSIDE_10YR,
  EtfFilterParamKey.MOR_DOWNSIDE_3YR,
  EtfFilterParamKey.MOR_DOWNSIDE_5YR,
  EtfFilterParamKey.MOR_DOWNSIDE_10YR,
  EtfFilterParamKey.MOR_RISK_3YR,
  EtfFilterParamKey.MOR_RISK_5YR,
  EtfFilterParamKey.MOR_RISK_10YR,
];

export const ADVANCED_MOR_FILTER_KEYS: EtfFilterParamKey[] = [
  EtfFilterParamKey.MOR_UPSIDE_3YR,
  EtfFilterParamKey.MOR_UPSIDE_5YR,
  EtfFilterParamKey.MOR_UPSIDE_10YR,
  EtfFilterParamKey.MOR_DOWNSIDE_3YR,
  EtfFilterParamKey.MOR_DOWNSIDE_5YR,
  EtfFilterParamKey.MOR_DOWNSIDE_10YR,
  EtfFilterParamKey.MOR_RISK_3YR,
  EtfFilterParamKey.MOR_RISK_5YR,
  EtfFilterParamKey.MOR_RISK_10YR,
];

export type MorPeriodKey = '3-Yr' | '5-Yr' | '10-Yr';
export type MorFieldKind = 'upside' | 'downside' | 'risk';

export const MOR_PERIODS: ReadonlyArray<MorPeriodKey> = ['3-Yr', '5-Yr', '10-Yr'];
export const MOR_FIELD_KINDS: ReadonlyArray<MorFieldKind> = ['upside', 'downside', 'risk'];
export const DEFAULT_MOR_PERIOD: MorPeriodKey = '5-Yr';

export interface MorAdvancedFilterDef {
  paramKey: EtfFilterParamKey;
  filterType: EtfFilterType;
  period: MorPeriodKey;
  kind: MorFieldKind;
  label: string;
  options: ReadonlyArray<ThresholdOption>;
}

export const MOR_ADVANCED_FILTERS: MorAdvancedFilterDef[] = [
  {
    paramKey: EtfFilterParamKey.MOR_UPSIDE_3YR,
    filterType: EtfFilterType.MOR_UPSIDE_3YR,
    period: '3-Yr',
    kind: 'upside',
    label: 'Upside Capture (3 Yr)',
    options: ETF_MOR_UPSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_UPSIDE_5YR,
    filterType: EtfFilterType.MOR_UPSIDE_5YR,
    period: '5-Yr',
    kind: 'upside',
    label: 'Upside Capture (5 Yr)',
    options: ETF_MOR_UPSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_UPSIDE_10YR,
    filterType: EtfFilterType.MOR_UPSIDE_10YR,
    period: '10-Yr',
    kind: 'upside',
    label: 'Upside Capture (10 Yr)',
    options: ETF_MOR_UPSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_DOWNSIDE_3YR,
    filterType: EtfFilterType.MOR_DOWNSIDE_3YR,
    period: '3-Yr',
    kind: 'downside',
    label: 'Downside Capture (3 Yr)',
    options: ETF_MOR_DOWNSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_DOWNSIDE_5YR,
    filterType: EtfFilterType.MOR_DOWNSIDE_5YR,
    period: '5-Yr',
    kind: 'downside',
    label: 'Downside Capture (5 Yr)',
    options: ETF_MOR_DOWNSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_DOWNSIDE_10YR,
    filterType: EtfFilterType.MOR_DOWNSIDE_10YR,
    period: '10-Yr',
    kind: 'downside',
    label: 'Downside Capture (10 Yr)',
    options: ETF_MOR_DOWNSIDE_CAPTURE_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_RISK_3YR,
    filterType: EtfFilterType.MOR_RISK_3YR,
    period: '3-Yr',
    kind: 'risk',
    label: 'Risk Level (3 Yr)',
    options: ETF_MOR_RISK_LEVEL_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_RISK_5YR,
    filterType: EtfFilterType.MOR_RISK_5YR,
    period: '5-Yr',
    kind: 'risk',
    label: 'Risk Level (5 Yr)',
    options: ETF_MOR_RISK_LEVEL_OPTIONS,
  },
  {
    paramKey: EtfFilterParamKey.MOR_RISK_10YR,
    filterType: EtfFilterType.MOR_RISK_10YR,
    period: '10-Yr',
    kind: 'risk',
    label: 'Risk Level (10 Yr)',
    options: ETF_MOR_RISK_LEVEL_OPTIONS,
  },
];

export function getMorFilterDef(kind: MorFieldKind, period: MorPeriodKey): MorAdvancedFilterDef {
  const def = MOR_ADVANCED_FILTERS.find((f) => f.kind === kind && f.period === period);
  if (!def) throw new Error(`Missing Mor filter definition for kind=${kind}, period=${period}`);
  return def;
}

export function getMorParamKey(kind: MorFieldKind, period: MorPeriodKey): EtfFilterParamKey {
  return getMorFilterDef(kind, period).paramKey;
}

export function getMorFilterShortLabel(kind: MorFieldKind): string {
  return kind === 'upside' ? 'Upside Capture' : kind === 'downside' ? 'Downside Capture' : 'Risk Level';
}

export function detectActiveMorPeriod(selected: EtfSelectedFiltersMap): MorPeriodKey {
  const counts: Record<MorPeriodKey, number> = { '3-Yr': 0, '5-Yr': 0, '10-Yr': 0 };
  for (const def of MOR_ADVANCED_FILTERS) {
    if (selected[def.paramKey]) counts[def.period]++;
  }
  let bestPeriod: MorPeriodKey = DEFAULT_MOR_PERIOD;
  let bestCount = 0;
  for (const period of MOR_PERIODS) {
    if (counts[period] > bestCount) {
      bestCount = counts[period];
      bestPeriod = period;
    }
  }
  return bestPeriod;
}

const SELECT_FILTER_TYPES: Set<string> = new Set([
  EtfFilterType.PAYOUT_FREQUENCY,
  EtfFilterType.ASSET_CLASS,
  EtfFilterType.CATEGORY,
  EtfFilterType.GROUP,
  EtfFilterType.ISSUER,
  EtfFilterType.MOR_RISK_3YR,
  EtfFilterType.MOR_RISK_5YR,
  EtfFilterType.MOR_RISK_10YR,
]);

/** ----- Client-side Helpers ----- */

function parseRangeFilter(
  raw: string,
  type: RangeFilterType,
  paramKey: EtfFilterParamKey,
  options: ReadonlyArray<ThresholdOption>,
  defaultLabel: string
): AppliedEtfRangeFilter | null {
  if (!raw || !raw.trim()) return null;
  const v = raw.trim();

  if (v === 'negative') {
    return {
      type,
      paramKey,
      raw: v,
      negative: true,
      label: options.find((o) => o.value === 'negative')?.label || `${defaultLabel}: Negative / N/A`,
    };
  }

  // Custom operator form: gt:/lt:/eq:<value>
  const opMatch = v.match(/^(gt|lt|eq):(.+)$/);
  if (opMatch) {
    const op = opMatch[1] as NumericFilterOp;
    const value = parseNumericStringValue(opMatch[2]);
    const shown = value !== null ? formatCompactNumber(value) : opMatch[2];
    return {
      type,
      paramKey,
      raw: v,
      op,
      value: value ?? undefined,
      label: `${defaultLabel} ${NUMERIC_FILTER_OP_SYMBOLS[op]} ${shown}`,
    };
  }

  const [minStr, maxStr] = v.split('-');
  const minValue = minStr ? parseFloat(minStr) : undefined;
  const maxValue = maxStr ? parseFloat(maxStr) : undefined;

  const matchingOption = options.find((opt) => opt.value === v);
  const label = matchingOption ? matchingOption.label : `${defaultLabel}: ${formatRange(minValue, maxValue)}`;

  return { type, paramKey, raw: v, minValue, maxValue, label };
}

function formatRange(min?: number, max?: number): string {
  const fmt = (v: number): string => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
    return `${v}`;
  };
  if (min !== undefined && max !== undefined) return `${fmt(min)} - ${fmt(max)}`;
  if (min !== undefined) return `> ${fmt(min)}`;
  if (max !== undefined) return `< ${fmt(max)}`;
  return 'Any';
}

export function getAppliedEtfFilters(searchParams: ReadonlyURLSearchParams): AppliedEtfFilter[] {
  const filters: AppliedEtfFilter[] = [];

  // AUM
  const aumRaw = searchParams.get(EtfFilterParamKey.AUM);
  if (aumRaw) {
    const f = parseRangeFilter(aumRaw, EtfFilterType.AUM, EtfFilterParamKey.AUM, ETF_AUM_OPTIONS, 'AUM');
    if (f) filters.push(f);
  }

  // Expense Ratio
  const erRaw = searchParams.get(EtfFilterParamKey.EXPENSE_RATIO);
  if (erRaw) {
    const f = parseRangeFilter(erRaw, EtfFilterType.EXPENSE_RATIO, EtfFilterParamKey.EXPENSE_RATIO, ETF_EXPENSE_RATIO_OPTIONS, 'Expense Ratio');
    if (f) filters.push(f);
  }

  // PE Ratio
  const peRaw = searchParams.get(EtfFilterParamKey.PE_RATIO);
  if (peRaw) {
    const f = parseRangeFilter(peRaw, EtfFilterType.PE_RATIO, EtfFilterParamKey.PE_RATIO, ETF_PE_RATIO_OPTIONS, 'P/E Ratio');
    if (f) filters.push(f);
  }

  // Dividend TTM
  const divRaw = searchParams.get(EtfFilterParamKey.DIVIDEND_TTM);
  if (divRaw) {
    const f = parseRangeFilter(divRaw, EtfFilterType.DIVIDEND_TTM, EtfFilterParamKey.DIVIDEND_TTM, ETF_DIVIDEND_TTM_OPTIONS, 'Dividend TTM');
    if (f) filters.push(f);
  }

  // Dividend Yield
  const dyRaw = searchParams.get(EtfFilterParamKey.DIVIDEND_YIELD);
  if (dyRaw) {
    const f = parseRangeFilter(dyRaw, EtfFilterType.DIVIDEND_YIELD, EtfFilterParamKey.DIVIDEND_YIELD, ETF_DIVIDEND_YIELD_OPTIONS, 'Dividend Yield');
    if (f) filters.push(f);
  }

  // Payout Frequency
  const pfRaw = searchParams.get(EtfFilterParamKey.PAYOUT_FREQUENCY);
  if (pfRaw && pfRaw.trim()) {
    const matchingOption = ETF_PAYOUT_FREQUENCY_OPTIONS.find((o) => o.value === pfRaw);
    filters.push({
      type: EtfFilterType.PAYOUT_FREQUENCY,
      paramKey: EtfFilterParamKey.PAYOUT_FREQUENCY,
      selectedValue: pfRaw,
      label: matchingOption ? `Payout: ${matchingOption.label}` : `Payout: ${pfRaw}`,
    });
  }

  // Holdings
  const holdingsRaw = searchParams.get(EtfFilterParamKey.HOLDINGS);
  if (holdingsRaw) {
    const f = parseRangeFilter(holdingsRaw, EtfFilterType.HOLDINGS, EtfFilterParamKey.HOLDINGS, ETF_HOLDINGS_OPTIONS, 'Holdings');
    if (f) filters.push(f);
  }

  // Volume
  const volumeRaw = searchParams.get(EtfFilterParamKey.VOLUME);
  if (volumeRaw) {
    const f = parseRangeFilter(volumeRaw, EtfFilterType.VOLUME, EtfFilterParamKey.VOLUME, ETF_VOLUME_OPTIONS, 'Volume');
    if (f) filters.push(f);
  }

  // Beta
  const betaRaw = searchParams.get(EtfFilterParamKey.BETA);
  if (betaRaw) {
    const f = parseRangeFilter(betaRaw, EtfFilterType.BETA, EtfFilterParamKey.BETA, ETF_BETA_OPTIONS, 'Beta');
    if (f) filters.push(f);
  }

  // Dividend Years
  const divYearsRaw = searchParams.get(EtfFilterParamKey.DIVIDEND_YEARS);
  if (divYearsRaw) {
    const f = parseRangeFilter(divYearsRaw, EtfFilterType.DIVIDEND_YEARS, EtfFilterParamKey.DIVIDEND_YEARS, ETF_DIVIDEND_YEARS_OPTIONS, 'Dividend Years');
    if (f) filters.push(f);
  }

  // Sortino Ratio
  const sortinoRaw = searchParams.get(EtfFilterParamKey.SORTINO);
  if (sortinoRaw) {
    const f = parseRangeFilter(sortinoRaw, EtfFilterType.SORTINO, EtfFilterParamKey.SORTINO, ETF_SORTINO_OPTIONS, 'Sortino');
    if (f) filters.push(f);
  }

  // Sharpe Ratio
  const sharpeRaw = searchParams.get(EtfFilterParamKey.SHARPE);
  if (sharpeRaw) {
    const f = parseRangeFilter(sharpeRaw, EtfFilterType.SHARPE, EtfFilterParamKey.SHARPE, ETF_SHARPE_OPTIONS, 'Sharpe');
    if (f) filters.push(f);
  }

  // Asset Class
  const acRaw = searchParams.get(EtfFilterParamKey.ASSET_CLASS);
  if (acRaw && acRaw.trim()) {
    const matchingOption = ETF_ASSET_CLASS_OPTIONS.find((o) => o.value === acRaw);
    filters.push({
      type: EtfFilterType.ASSET_CLASS,
      paramKey: EtfFilterParamKey.ASSET_CLASS,
      selectedValue: acRaw,
      label: matchingOption ? `Asset Class: ${matchingOption.label}` : `Asset Class: ${acRaw}`,
    });
  }

  // Category
  const categoryRaw = searchParams.get(EtfFilterParamKey.CATEGORY);
  if (categoryRaw && categoryRaw.trim()) {
    filters.push({
      type: EtfFilterType.CATEGORY,
      paramKey: EtfFilterParamKey.CATEGORY,
      selectedValue: categoryRaw,
      label: `Category: ${categoryRaw}`,
    });
  }

  // Group (key, e.g. "broad-equity")
  const groupRaw = searchParams.get(EtfFilterParamKey.GROUP);
  if (groupRaw && groupRaw.trim()) {
    const groupName = getEtfGroupByKey(groupRaw)?.name;
    filters.push({
      type: EtfFilterType.GROUP,
      paramKey: EtfFilterParamKey.GROUP,
      selectedValue: groupRaw,
      label: `Group: ${groupName ?? groupRaw}`,
    });
  }

  // Issuer
  const issuerRaw = searchParams.get(EtfFilterParamKey.ISSUER);
  if (issuerRaw && issuerRaw.trim()) {
    const matchingOption = ETF_ISSUER_OPTIONS.find((o) => o.value === issuerRaw);
    filters.push({
      type: EtfFilterType.ISSUER,
      paramKey: EtfFilterParamKey.ISSUER,
      selectedValue: issuerRaw,
      label: matchingOption ? `Issuer: ${matchingOption.label}` : `Issuer: ${issuerRaw}`,
    });
  }

  // AI score thresholds (per-category + total)
  for (const def of ALL_SCORE_DEFS) {
    const raw = searchParams.get(def.paramKey);
    if (!raw || !raw.trim()) continue;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) continue;
    filters.push({
      type: def.filterType,
      paramKey: def.paramKey,
      threshold: n,
      label: `${def.label}: ≥ ${n}`,
    });
  }

  // Mor advanced filters (per-period)
  for (const def of MOR_ADVANCED_FILTERS) {
    const raw = searchParams.get(def.paramKey);
    if (!raw || !raw.trim()) continue;

    if (def.kind === 'risk') {
      const matchingOption = def.options.find((o) => o.value === raw);
      filters.push({
        type: def.filterType as SelectFilterType,
        paramKey: def.paramKey,
        selectedValue: raw,
        label: matchingOption ? `${def.label}: ${matchingOption.label}` : `${def.label}: ${raw}`,
      });
    } else {
      const f = parseRangeFilter(raw, def.filterType as RangeFilterType, def.paramKey, def.options, def.label);
      if (f) filters.push(f);
    }
  }

  // Search
  const searchRaw = searchParams.get(EtfFilterParamKey.SEARCH);
  if (searchRaw && searchRaw.trim()) {
    filters.push({
      type: EtfFilterType.SEARCH,
      paramKey: EtfFilterParamKey.SEARCH,
      searchQuery: searchRaw.trim(),
      label: `Search: ${searchRaw.trim()}`,
    });
  }

  return filters;
}

export function buildInitialEtfSelected(filters: ReadonlyArray<AppliedEtfFilter>): EtfSelectedFiltersMap {
  const initial: EtfSelectedFiltersMap = {};
  for (const filter of filters) {
    if (filter.type === EtfFilterType.SEARCH) {
      initial[EtfFilterParamKey.SEARCH] = (filter as AppliedEtfSearchFilter).searchQuery;
    } else if (SCORE_FILTER_TYPES.has(filter.type)) {
      initial[filter.paramKey] = String((filter as AppliedEtfScoreFilter).threshold);
    } else if (SELECT_FILTER_TYPES.has(filter.type)) {
      initial[filter.paramKey] = (filter as AppliedEtfSelectFilter).selectedValue;
    } else {
      const rangeFilter = filter as AppliedEtfRangeFilter;
      // `raw` preserves the exact URL value (bucket, `negative`, or `op:value`)
      // so the modal control re-hydrates to the user's original selection.
      if (rangeFilter.raw !== undefined) {
        initial[filter.paramKey] = rangeFilter.raw;
      } else if (rangeFilter.negative || filter.label.includes('Negative')) {
        initial[filter.paramKey] = 'negative';
      } else {
        const min = rangeFilter.minValue !== undefined ? rangeFilter.minValue : '';
        const max = rangeFilter.maxValue !== undefined ? rangeFilter.maxValue : '';
        initial[filter.paramKey] = `${min}-${max}`;
      }
    }
  }
  return initial;
}

export function clearAllEtfFilterParams(searchParams: ReadonlyURLSearchParams): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  for (const key of ALL_ETF_PARAM_KEYS) {
    params.delete(key);
  }
  params.delete('page');
  return params;
}

export function removeEtfFilterFromParams(searchParams: ReadonlyURLSearchParams, filterToRemove: AppliedEtfFilter): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(filterToRemove.paramKey);
  params.delete('page');
  return params;
}

export function applySelectedEtfFiltersToParams(searchParams: ReadonlyURLSearchParams, newSelected: EtfSelectedFiltersMap): URLSearchParams {
  const params = clearAllEtfFilterParams(searchParams);
  for (const [k, v] of Object.entries(newSelected)) {
    if (v && v.length > 0) {
      params.set(k, v);
    }
  }
  params.delete('page');
  return params;
}

export interface EtfFilterDestination {
  path: string;
  extraParams: Record<string, string>;
}

// Page patterns that read searchParams and pass them into fetchEtfListingData —
// applying filters should keep the user on the same path, not redirect.
// Keep in sync with the routes in src/app/etfs/**/page.tsx and src/app/etfs-filtered/**/page.tsx.
const ETF_INLINE_FILTER_PATH_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/etfs-filtered$/,
  /^\/etfs-filtered\/countries\/[^/]+$/,
  /^\/etfs\/countries\/[^/]+\/asset-classes\/[^/]+$/,
  /^\/etfs\/countries\/[^/]+\/providers\/[^/]+$/,
  /^\/etfs\/countries\/[^/]+\/groups\/[^/]+\/categories\/[^/]+$/,
  /^\/etfs\/groups\/[^/]+\/categories\/[^/]+$/,
  /^\/etfs\/asset-classes\/[^/]+$/,
  /^\/etfs\/providers\/[^/]+$/,
];

/**
 * Decide where to route when the user applies ETF filters from a given pathname.
 *
 * Inline-filter pages (above) stay put — the page itself respects searchParams.
 * Grid pages (`/etfs`, `/etfs/groups/[group]`, country roots, `/etfs/countries/<c>/groups/<g>`,
 * etc.) redirect to a filterable listing, lifting path-derived scope (group / country) into
 * filter params so the new listing inherits the user's context.
 */
export function getEtfFilterDestination(pathname: string): EtfFilterDestination {
  if (ETF_INLINE_FILTER_PATH_PATTERNS.some((re) => re.test(pathname))) {
    return { path: pathname, extraParams: {} };
  }

  // /etfs/countries/<country>/groups/<group> → /etfs-filtered/countries/<country>?group=<group>
  const countryGroupMatch = pathname.match(/^\/etfs\/countries\/([^/]+)\/groups\/([^/]+)$/);
  if (countryGroupMatch) {
    const [, country, group] = countryGroupMatch;
    return { path: `/etfs-filtered/countries/${country}`, extraParams: { [EtfFilterParamKey.GROUP]: decodeURIComponent(group) } };
  }

  // /etfs/countries/<country>/{asset-classes|providers} grid → /etfs-filtered/countries/<country>
  const countryGridMatch = pathname.match(/^\/etfs\/countries\/([^/]+)\/(?:asset-classes|providers)$/);
  if (countryGridMatch) {
    const [, country] = countryGridMatch;
    return { path: `/etfs-filtered/countries/${country}`, extraParams: {} };
  }

  // /etfs/countries/<country> (groups index for the country) → /etfs-filtered/countries/<country>
  const countryRootMatch = pathname.match(/^\/etfs\/countries\/([^/]+)$/);
  if (countryRootMatch) {
    const [, country] = countryRootMatch;
    return { path: `/etfs-filtered/countries/${country}`, extraParams: {} };
  }

  // /etfs/groups/<group> → /etfs-filtered?group=<group>
  const groupMatch = pathname.match(/^\/etfs\/groups\/([^/]+)$/);
  if (groupMatch) {
    const [, group] = groupMatch;
    return { path: '/etfs-filtered', extraParams: { [EtfFilterParamKey.GROUP]: decodeURIComponent(group) } };
  }

  // /etfs, /etfs/asset-classes, /etfs/providers, and any unmatched fallback → /etfs-filtered
  return { path: '/etfs-filtered', extraParams: {} };
}

const toScalar = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v.join(',') : v);

export const etfToSortedQueryString = (sp: EtfSearchParams): string => {
  const usp = new URLSearchParams();
  Object.keys(sp)
    .sort()
    .forEach((k) => {
      const v = toScalar(sp[k]);
      if (v) usp.set(k, v);
    });
  return usp.toString();
};

export const hasEtfFiltersApplied = (sp?: EtfSearchParams): boolean => {
  if (!sp) return false;
  return ALL_ETF_PARAM_KEYS.some((key) => Boolean(toScalar(sp[key])));
};

/** ----- Sort ----- */

export enum EtfSortParamKey {
  SORT_BY = 'sortBy',
  SORT_ORDER = 'sortOrder',
}

export type EtfSortOrder = 'asc' | 'desc';

export enum EtfSortField {
  AUM = 'aum',
  EXPENSE_RATIO = 'expenseRatio',
  PE_RATIO = 'pe',
  DIVIDEND_YIELD = 'dividendYield',
}

export interface EtfSortFieldDef {
  field: EtfSortField;
  label: string;
  // The direction picked the first time a field is selected (largest AUM first,
  // cheapest expense ratio first, etc.). Re-selecting the active field flips it.
  defaultOrder: EtfSortOrder;
}

export const ETF_SORT_FIELD_DEFS: ReadonlyArray<EtfSortFieldDef> = [
  { field: EtfSortField.AUM, label: 'AUM', defaultOrder: 'desc' },
  { field: EtfSortField.EXPENSE_RATIO, label: 'Expense Ratio', defaultOrder: 'asc' },
  { field: EtfSortField.PE_RATIO, label: 'P/E Ratio', defaultOrder: 'asc' },
  { field: EtfSortField.DIVIDEND_YIELD, label: 'Dividend Yield', defaultOrder: 'desc' },
] as const;

const ETF_SORT_FIELD_VALUES: Set<string> = new Set(ETF_SORT_FIELD_DEFS.map((d) => d.field));

export interface AppliedEtfSort {
  field: EtfSortField;
  order: EtfSortOrder;
  def: EtfSortFieldDef;
}

type ReadableSearchParams = { get(name: string): string | null };

/** Resolve the active sort from URL params. Works for both client
 *  (ReadonlyURLSearchParams) and server (URLSearchParams) callers. */
export function getAppliedEtfSort(searchParams: ReadableSearchParams): AppliedEtfSort | null {
  const rawField = searchParams.get(EtfSortParamKey.SORT_BY)?.trim();
  if (!rawField || !ETF_SORT_FIELD_VALUES.has(rawField)) return null;
  const def = ETF_SORT_FIELD_DEFS.find((d) => d.field === rawField)!;
  const rawOrder = searchParams.get(EtfSortParamKey.SORT_ORDER)?.trim();
  const order: EtfSortOrder = rawOrder === 'asc' || rawOrder === 'desc' ? rawOrder : def.defaultOrder;
  return { field: def.field, order, def };
}

export function applyEtfSortToParams(searchParams: ReadonlyURLSearchParams, field: EtfSortField | null, order: EtfSortOrder): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  if (field) {
    params.set(EtfSortParamKey.SORT_BY, field);
    params.set(EtfSortParamKey.SORT_ORDER, order);
  } else {
    params.delete(EtfSortParamKey.SORT_BY);
    params.delete(EtfSortParamKey.SORT_ORDER);
  }
  params.delete('page');
  return params;
}

export function hasEtfSortApplied(sp?: EtfSearchParams): boolean {
  if (!sp) return false;
  const field = toScalar(sp[EtfSortParamKey.SORT_BY]);
  return Boolean(field && ETF_SORT_FIELD_VALUES.has(field));
}

/** Server-side Prisma orderBy. AUM is a formatted string column, so it can't be
 *  ordered numerically in the DB — callers fall back to app-level sorting for it. */
export function buildEtfDbOrderBy(sort: AppliedEtfSort | null): Prisma.EtfOrderByWithRelationInput[] {
  if (!sort || sort.field === EtfSortField.AUM) return [{ symbol: 'asc' }];
  const dir: Prisma.SortOrderInput = { sort: sort.order, nulls: 'last' };
  switch (sort.field) {
    case EtfSortField.EXPENSE_RATIO:
      return [{ financialInfo: { expenseRatio: dir } }, { symbol: 'asc' }];
    case EtfSortField.PE_RATIO:
      return [{ financialInfo: { pe: dir } }, { symbol: 'asc' }];
    case EtfSortField.DIVIDEND_YIELD:
      return [{ financialInfo: { dividendYield: dir } }, { symbol: 'asc' }];
    default:
      return [{ symbol: 'asc' }];
  }
}

/** ----- Server-side Helpers ----- */

export function parseEtfFilterParams(req: NextRequest): EtfFilterParams {
  const { searchParams } = new URL(req.url);
  const params: EtfFilterParams = {};
  for (const key of ALL_ETF_PARAM_KEYS) {
    const val = searchParams.get(key);
    if (val) params[key] = val;
  }
  return params;
}

export function parseNumericStringValue(value: string | null | undefined): number | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  const cleaned = raw.replace(/,/g, '').replace(/^\$/, '').replace(/%$/, '').trim();
  const match = cleaned.match(/^([+-]?\d+(?:\.\d+)?)\s*([KMBT])?$/i);
  if (!match) return null;

  const num = Number(match[1]);
  if (!Number.isFinite(num)) return null;

  const suffix = (match[2] || '').toUpperCase();
  const mult = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : suffix === 'T' ? 1_000_000_000_000 : 1;
  return num * mult;
}

export function parseRangeParam(param: string | undefined): { min?: number; max?: number } | null {
  if (!param || !param.trim()) return null;
  const [minStr, maxStr] = param.split('-');
  const min = minStr ? parseFloat(minStr) : undefined;
  const max = maxStr ? parseFloat(maxStr) : undefined;
  if (min === undefined && max === undefined) return null;
  return { min, max };
}

/** Assign a numeric filter (bucket range, operator, or negative) onto `target[key]`
 *  when the param resolves to usable criteria. Shared by financial + analyzer filters. */
function assignNumericFilter<T extends object>(target: T, key: keyof T, raw: string | undefined): void {
  const criteria = parseNumericFilterValue(raw);
  if (!criteria) return;
  const prismaFilter = numericCriteriaToPrismaFilter(criteria);
  if (prismaFilter) (target as Record<string, unknown>)[key as string] = prismaFilter;
}

export function createEtfFinancialFilter(filters: EtfFilterParams): Prisma.EtfFinancialInfoWhereInput {
  const where: Prisma.EtfFinancialInfoWhereInput = {};

  assignNumericFilter(where, 'expenseRatio', filters[EtfFilterParamKey.EXPENSE_RATIO]);

  // P/E keeps its special "Negative / N/A" bucket, which also matches null P/E.
  const peParam = filters[EtfFilterParamKey.PE_RATIO]?.trim();
  if (peParam) {
    if (peParam === 'negative') {
      where.OR = [{ pe: { lt: 0 } }, { pe: null }];
    } else {
      assignNumericFilter(where, 'pe', peParam);
    }
  }

  assignNumericFilter(where, 'dividendTtm', filters[EtfFilterParamKey.DIVIDEND_TTM]);

  const pf = filters[EtfFilterParamKey.PAYOUT_FREQUENCY];
  if (pf && pf.trim()) {
    where.payoutFrequency = { equals: pf, mode: 'insensitive' };
  }

  assignNumericFilter(where, 'holdings', filters[EtfFilterParamKey.HOLDINGS]);
  assignNumericFilter(where, 'volume', filters[EtfFilterParamKey.VOLUME]);
  assignNumericFilter(where, 'dividendYield', filters[EtfFilterParamKey.DIVIDEND_YIELD]);

  return where;
}

export function createEtfStockAnalyzerFilter(filters: EtfFilterParams): Prisma.EtfStockAnalyzerInfoWhereInput {
  const where: Prisma.EtfStockAnalyzerInfoWhereInput = {};

  assignNumericFilter(where, 'beta1y', filters[EtfFilterParamKey.BETA]);
  assignNumericFilter(where, 'divYears', filters[EtfFilterParamKey.DIVIDEND_YEARS]);
  assignNumericFilter(where, 'sortino', filters[EtfFilterParamKey.SORTINO]);
  assignNumericFilter(where, 'sharpe', filters[EtfFilterParamKey.SHARPE]);

  const assetClass = filters[EtfFilterParamKey.ASSET_CLASS]?.trim();
  if (assetClass) {
    where.assetClass = { equals: assetClass, mode: 'insensitive' };
  }

  const category = filters[EtfFilterParamKey.CATEGORY]?.trim();
  if (category) {
    const expanded = expandCategoryAliases([category]);
    where.category = expanded.length > 1 ? { in: expanded } : { equals: category, mode: 'insensitive' };
  }

  // Group is not stored on the row — translate the group key into the set of
  // category names that belong to it and match any of them. The synthetic
  // "others" group means "category is null"; the listing route then OR-s in
  // ETFs that lack a stockAnalyzerInfo relation entirely.
  const groupKey = filters[EtfFilterParamKey.GROUP]?.trim();
  if (groupKey) {
    if (groupKey === ETF_OTHERS_GROUP_KEY) {
      where.category = null;
    } else {
      const categoryNames = getCategoriesForGroupKey(groupKey).map((c) => c.name);
      if (categoryNames.length === 0) {
        // Unknown / empty group: force-empty result set so callers see "no matches"
        // rather than the unfiltered listing.
        where.category = { equals: '__no_match__' };
      } else {
        where.category = { in: expandCategoryAliases(categoryNames) };
      }
    }
  }

  const issuer = filters[EtfFilterParamKey.ISSUER]?.trim();
  if (issuer) {
    where.issuer = { contains: issuer, mode: 'insensitive' };
  }

  return where;
}

export function createEtfSearchFilter(spaceId: string, filters: EtfFilterParams): Prisma.EtfWhereInput {
  const etfWhere: Prisma.EtfWhereInput = { spaceId };

  const searchTerm = filters[EtfFilterParamKey.SEARCH]?.trim();
  if (searchTerm) {
    etfWhere.OR = [
      { symbol: { equals: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { symbol: { startsWith: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      { symbol: { contains: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  return etfWhere;
}

export function createEtfCachedScoreFilter(filters: EtfFilterParams): Prisma.EtfCachedScoreWhereInput {
  const where: Prisma.EtfCachedScoreWhereInput = {};
  for (const def of ALL_SCORE_DEFS) {
    const raw = filters[def.paramKey]?.trim();
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) continue;
    (where as Record<string, unknown>)[def.cachedScoreField] = { gte: n };
  }
  return where;
}

export function hasEtfFiltersAppliedServer(filters: EtfFilterParams): boolean {
  return ALL_ETF_PARAM_KEYS.some((key) => !!filters[key]?.trim());
}

export function hasAdvancedMorFilters(filters: EtfFilterParams): boolean {
  return ADVANCED_MOR_FILTER_KEYS.some((key) => !!filters[key]?.trim());
}

export function extractCaptureRatioForPeriod(riskPeriods: any, period: MorPeriodKey, rowLabel: string): number | null {
  const periodData = riskPeriods?.[period];
  if (!periodData) return null;
  const table = periodData?.marketVolatilityMeasures?.captureRatios;
  if (!table?.columns || !table?.rows?.length) return null;

  const row = table.rows.find((r: any) => r.label?.toLowerCase() === rowLabel.toLowerCase());
  if (!row) return null;

  const raw = row.values?.['Index'];
  return parseNumericStringValue(raw);
}

export function extractRiskLevelForPeriod(riskPeriods: any, period: MorPeriodKey): string | null {
  return riskPeriods?.[period]?.portfolioRiskScore?.riskLevel ?? null;
}
