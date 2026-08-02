import { Prisma, TickerAnalysisCategory } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ReadonlyURLSearchParams } from 'next/navigation';
// Generic numeric-filter primitives (operator encoding, K/M/B/T parsing, Prisma
// fragment building) shared with the ETF filters — reused, not duplicated.
import {
  NUMERIC_FILTER_OP_SYMBOLS,
  formatCompactNumber,
  numericCriteriaToPrismaFilter,
  parseNumericFilterValue,
  type NumericFilterOp,
} from '@/utils/etf-filter-utils';

/** ----- Types and Enums ----- */

// Enum for filter types
export enum FilterType {
  CATEGORY = 'category',
  TOTAL = 'total',
  SEARCH = 'search',
  MARKET_CAP = 'marketCap',
  PE_RATIO = 'peRatio',
  DIVIDEND_YIELD = 'dividendYield',
  FORWARD_PE = 'forwardPe',
}

// Enum for parameter keys to ensure consistency
export enum FilterParamKey {
  BUSINESS_AND_MOAT = 'businessAndMoatThreshold',
  FINANCIAL_STATEMENT_ANALYSIS = 'financialStatementAnalysisThreshold',
  PAST_PERFORMANCE = 'pastPerformanceThreshold',
  FUTURE_GROWTH = 'futureGrowthThreshold',
  FAIR_VALUE = 'fairValueThreshold',
  TOTAL = 'totalThreshold',
  SEARCH = 'search',
  MARKET_CAP = 'marketCap',
  PE_RATIO = 'peRatio',
  DIVIDEND_YIELD = 'dividendYield',
  FORWARD_PE = 'forwardPe',
}

// Type for search parameters
export type SearchParams = { [key: string]: string | string[] | undefined };

// Interface for filter options
export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
  key: string;
  paramKey: FilterParamKey;
}

// Interface for threshold options
export interface ThresholdOption {
  label: string;
  value: string;
}

// Base interface for applied filters
export interface AppliedFilterBase {
  type: FilterType;
  label: string;
}

// Interface for category filters
export interface AppliedCategoryFilter extends AppliedFilterBase {
  type: FilterType.CATEGORY;
  categoryKey: TickerAnalysisCategory;
  threshold: number;
}

// Interface for total score filters
export interface AppliedTotalFilter extends AppliedFilterBase {
  type: FilterType.TOTAL;
  threshold: number;
}

// Interface for search filters
export interface AppliedSearchFilter extends AppliedFilterBase {
  type: FilterType.SEARCH;
  searchQuery: string;
}

// Filter types backed by a numeric metric (bucket range, `negative`, or `op:value`).
export type NumericFilterType = FilterType.MARKET_CAP | FilterType.PE_RATIO | FilterType.DIVIDEND_YIELD | FilterType.FORWARD_PE;

// Interface for numeric filters (market cap, PE, dividend yield, forward PE)
export interface AppliedNumericFilter extends AppliedFilterBase {
  type: NumericFilterType;
  paramKey: FilterParamKey;
  // The original URL param value, kept verbatim so the modal can round-trip it
  // back into the matching control (bucket value, `negative`, or `op:value`).
  raw: string;
  minValue?: number;
  maxValue?: number;
  // Operator form: `op` + `value` (e.g. PE < 15).
  op?: NumericFilterOp;
  value?: number;
  negative?: boolean;
}

// Union type for all filter types
export type AppliedFilter = AppliedCategoryFilter | AppliedTotalFilter | AppliedSearchFilter | AppliedNumericFilter;

// Type for selected filters map
export type SelectedFiltersMap = Record<string, string>;

// Interface for filter parameters used on the server side
export interface FilterParams {
  [FilterParamKey.BUSINESS_AND_MOAT]?: string;
  [FilterParamKey.FINANCIAL_STATEMENT_ANALYSIS]?: string;
  [FilterParamKey.PAST_PERFORMANCE]?: string;
  [FilterParamKey.FUTURE_GROWTH]?: string;
  [FilterParamKey.FAIR_VALUE]?: string;
  [FilterParamKey.TOTAL]?: string;
  [FilterParamKey.SEARCH]?: string;
  [FilterParamKey.MARKET_CAP]?: string;
  [FilterParamKey.PE_RATIO]?: string;
  [FilterParamKey.DIVIDEND_YIELD]?: string;
  [FilterParamKey.FORWARD_PE]?: string;
}

/** ----- Constants (readonly) ----- */

// Category options with consistent keys
export const CATEGORY_OPTIONS: ReadonlyArray<FilterOption<TickerAnalysisCategory>> = [
  {
    label: 'Business & Moat',
    value: 'BusinessAndMoat',
    key: 'BusinessAndMoat',
    paramKey: FilterParamKey.BUSINESS_AND_MOAT,
  },
  {
    label: 'Financial Statement Analysis',
    value: 'FinancialStatementAnalysis',
    key: 'FinancialStatementAnalysis',
    paramKey: FilterParamKey.FINANCIAL_STATEMENT_ANALYSIS,
  },
  {
    label: 'Past Performance',
    value: 'PastPerformance',
    key: 'PastPerformance',
    paramKey: FilterParamKey.PAST_PERFORMANCE,
  },
  {
    label: 'Future Growth',
    value: 'FutureGrowth',
    key: 'FutureGrowth',
    paramKey: FilterParamKey.FUTURE_GROWTH,
  },
  {
    label: 'Fair Value',
    value: 'FairValue',
    key: 'FairValue',
    paramKey: FilterParamKey.FAIR_VALUE,
  },
] as const;

// Category threshold options
export const CATEGORY_THRESHOLD_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 3', value: '3' },
  { label: '≥ 4', value: '4' },
  { label: '≥ 5', value: '5' },
] as const;

// Total score options
export const TOTAL_SCORE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 15', value: '15' },
  { label: '≥ 18', value: '18' },
  { label: '≥ 21', value: '21' },
] as const;

// Market Cap options (in billions USD)
export const MARKET_CAP_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Micro Cap (< $300M)', value: '0-300000000' },
  { label: 'Small Cap ($300M - $2B)', value: '300000000-2000000000' },
  { label: 'Mid Cap ($2B - $10B)', value: '2000000000-10000000000' },
  { label: 'Large Cap ($10B - $200B)', value: '10000000000-200000000000' },
  { label: 'Mega Cap (> $200B)', value: '200000000000-' },
] as const;

// PE Ratio options
export const PE_RATIO_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low (< 15)', value: '0-15' },
  { label: 'Moderate (15 - 25)', value: '15-25' },
  { label: 'High (25 - 50)', value: '25-50' },
  { label: 'Very High (> 50)', value: '50-' },
  { label: 'Negative / No Earnings', value: 'negative' },
] as const;

// Dividend Yield options (percent)
export const DIVIDEND_YIELD_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'None (< 0.5%)', value: '0-0.5' },
  { label: 'Low (0.5% - 2%)', value: '0.5-2' },
  { label: 'Moderate (2% - 4%)', value: '2-4' },
  { label: 'High (4% - 6%)', value: '4-6' },
  { label: 'Very High (> 6%)', value: '6-' },
] as const;

// Forward PE options — same buckets as trailing PE
export const FORWARD_PE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low (< 15)', value: '0-15' },
  { label: 'Moderate (15 - 25)', value: '15-25' },
  { label: 'High (25 - 50)', value: '25-50' },
  { label: 'Very High (> 50)', value: '50-' },
  { label: 'Negative / No Earnings', value: 'negative' },
] as const;

// Definition of a numeric stock filter (drives parsing, chips, and the modal controls)
export interface NumericFilterDef {
  type: NumericFilterType;
  paramKey: FilterParamKey;
  label: string;
  options: ReadonlyArray<ThresholdOption>;
  /** Hint shown under the custom operator input (e.g. "e.g. 1B, 500M"). */
  hint?: string;
}

export const NUMERIC_FILTER_DEFS: ReadonlyArray<NumericFilterDef> = [
  {
    type: FilterType.MARKET_CAP,
    paramKey: FilterParamKey.MARKET_CAP,
    label: 'Market Cap',
    options: MARKET_CAP_OPTIONS,
    hint: 'e.g. 1B, 500M',
  },
  {
    type: FilterType.PE_RATIO,
    paramKey: FilterParamKey.PE_RATIO,
    label: 'PE Ratio',
    options: PE_RATIO_OPTIONS,
    hint: 'e.g. 15',
  },
  {
    type: FilterType.DIVIDEND_YIELD,
    paramKey: FilterParamKey.DIVIDEND_YIELD,
    label: 'Dividend Yield',
    options: DIVIDEND_YIELD_OPTIONS,
    hint: 'Percent, e.g. 4',
  },
  {
    type: FilterType.FORWARD_PE,
    paramKey: FilterParamKey.FORWARD_PE,
    label: 'Forward PE',
    options: FORWARD_PE_OPTIONS,
    hint: 'e.g. 20',
  },
] as const;

/** ----- Client-side Helpers ----- */

/**
 * Build initial selected filters map from applied filters
 */
export function buildInitialSelected(filters: ReadonlyArray<AppliedFilter>): SelectedFiltersMap {
  const initial: SelectedFiltersMap = {};
  for (const filter of filters) {
    if (filter.type === FilterType.CATEGORY) {
      // Find the corresponding category option to get the correct parameter key
      const categoryOption = CATEGORY_OPTIONS.find((opt) => opt.value === filter.categoryKey);
      if (categoryOption) {
        initial[categoryOption.paramKey] = String(filter.threshold);
      }
    } else if (filter.type === FilterType.TOTAL) {
      initial[FilterParamKey.TOTAL] = String(filter.threshold);
    } else if (filter.type !== FilterType.SEARCH) {
      // Numeric filters: `raw` preserves the exact URL value (bucket, `negative`,
      // or `op:value`) so the modal control re-hydrates to the original selection.
      initial[filter.paramKey] = filter.raw;
    }
  }
  return initial;
}

/**
 * Parse current filters from URL search params.
 */
export function getAppliedFilters(searchParams: ReadonlyURLSearchParams): AppliedFilter[] {
  const filters: AppliedFilter[] = [];

  // Category filters
  for (const category of CATEGORY_OPTIONS) {
    const param = searchParams.get(category.paramKey);
    if (param != null && param.trim().length > 0) {
      const n: number = Number.parseInt(param, 10);
      if (!Number.isNaN(n)) {
        filters.push({
          type: FilterType.CATEGORY,
          categoryKey: category.value,
          threshold: n,
          label: `${category.label} ≥ ${n}`,
        });
      }
    }
  }

  // Total score
  const totalThresholdRaw: string | null = searchParams.get(FilterParamKey.TOTAL);
  if (totalThresholdRaw != null && totalThresholdRaw.trim().length > 0) {
    const n: number = Number.parseInt(totalThresholdRaw, 10);
    if (!Number.isNaN(n)) {
      filters.push({
        type: FilterType.TOTAL,
        threshold: n,
        label: `Total Score ≥ ${n}`,
      });
    }
  }

  // Search
  const searchQueryRaw: string | null = searchParams.get(FilterParamKey.SEARCH);
  if (searchQueryRaw != null) {
    const q: string = searchQueryRaw.trim();
    if (q.length > 0) {
      filters.push({
        type: FilterType.SEARCH,
        searchQuery: q,
        label: `Search: ${q}`,
      });
    }
  }

  // Numeric filters (market cap, PE, dividend yield, forward PE)
  for (const def of NUMERIC_FILTER_DEFS) {
    const raw: string | null = searchParams.get(def.paramKey);
    if (raw != null && raw.trim().length > 0) {
      const f = parseNumericAppliedFilter(raw, def);
      if (f) filters.push(f);
    }
  }

  return filters;
}

/**
 * Parse a numeric filter URL value (`negative`, `op:value`, or `<min>-<max>` bucket)
 * into an applied-filter entry with a human-readable chip label.
 */
function parseNumericAppliedFilter(raw: string, def: NumericFilterDef): AppliedNumericFilter | null {
  const v = raw.trim();
  if (!v) return null;

  if (v === 'negative') {
    const optionLabel = def.options.find((o) => o.value === 'negative')?.label;
    return {
      type: def.type,
      paramKey: def.paramKey,
      raw: v,
      negative: true,
      label: `${def.label}: ${optionLabel || 'Negative'}`,
    };
  }

  // Custom operator form: gt:/lt:/eq:<value>
  const criteria = parseNumericFilterValue(v);
  if (criteria?.op !== undefined) {
    const shown = criteria.value !== undefined ? formatCompactNumber(criteria.value) : v;
    return {
      type: def.type,
      paramKey: def.paramKey,
      raw: v,
      op: criteria.op,
      value: criteria.value,
      label: `${def.label} ${NUMERIC_FILTER_OP_SYMBOLS[criteria.op]} ${shown}`,
    };
  }

  const [minStr, maxStr] = v.split('-');
  const minValue = minStr ? parseFloat(minStr) : undefined;
  const maxValue = maxStr ? parseFloat(maxStr) : undefined;

  const matchingOption = def.options.find((opt) => opt.value === v);
  const label = matchingOption ? matchingOption.label : `${def.label}: ${formatNumericRange(minValue, maxValue)}`;

  return { type: def.type, paramKey: def.paramKey, raw: v, minValue, maxValue, label };
}

/**
 * Helper function to format a numeric range for display (fallback when the raw
 * URL value does not match a preset bucket).
 */
function formatNumericRange(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) {
    return `${formatCompactNumber(min)} - ${formatCompactNumber(max)}`;
  } else if (min !== undefined) {
    return `> ${formatCompactNumber(min)}`;
  } else if (max !== undefined) {
    return `< ${formatCompactNumber(max)}`;
  }
  return 'Any';
}

/**
 * Return a new URLSearchParams with all filter params cleared.
 */
export function clearAllFilterParams(searchParams: ReadonlyURLSearchParams): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(searchParams.toString());
  for (const c of CATEGORY_OPTIONS) {
    params.delete(c.paramKey);
  }
  params.delete(FilterParamKey.TOTAL);
  params.delete(FilterParamKey.SEARCH);
  for (const def of NUMERIC_FILTER_DEFS) {
    params.delete(def.paramKey);
  }
  return params;
}

/**
 * Return new params with a single filter removed.
 */
export function removeFilterFromParams(searchParams: ReadonlyURLSearchParams, filterToRemove: AppliedFilter): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(searchParams.toString());
  if (filterToRemove.type === FilterType.CATEGORY) {
    const categoryOption = CATEGORY_OPTIONS.find((opt) => opt.value === filterToRemove.categoryKey);
    if (categoryOption) {
      params.delete(categoryOption.paramKey);
    }
  } else if (filterToRemove.type === FilterType.TOTAL) {
    params.delete(FilterParamKey.TOTAL);
  } else if (filterToRemove.type === FilterType.SEARCH) {
    params.delete(FilterParamKey.SEARCH);
  } else {
    params.delete(filterToRemove.paramKey);
  }
  return params;
}

/**
 * Return new params with the provided selected filters applied.
 * Clears existing filter params first, then sets new ones.
 */
export function applySelectedFiltersToParams(searchParams: ReadonlyURLSearchParams, newSelected: SelectedFiltersMap): URLSearchParams {
  const params: URLSearchParams = clearAllFilterParams(searchParams);
  for (const [k, v] of Object.entries(newSelected)) {
    if (v && v.length > 0) {
      params.set(k, v);
    }
  }
  return params;
}

const toScalar = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v.join(',') : v);

export const toSortedQueryString = (sp: SearchParams, country?: string): string => {
  const usp = new URLSearchParams();
  Object.keys(sp)
    .sort()
    .forEach((k) => {
      if (k === 'page') return;
      const v = toScalar(sp[k]);
      if (v) usp.set(k, v);
    });
  // Include country in query string for proper caching differentiation
  if (country) {
    usp.set('country', country);
  }
  return usp.toString();
};

export const hasFiltersApplied = (sp?: SearchParams): boolean =>
  (sp && Object.keys(sp).some((k) => k.includes('Threshold'))) ||
  Boolean(toScalar(sp?.[FilterParamKey.SEARCH])) ||
  NUMERIC_FILTER_DEFS.some((def) => Boolean(toScalar(sp?.[def.paramKey])));

/** ----- Server-side Helpers ----- */

/**
 * Convert a string value to an integer, returning undefined if the value is invalid
 */
export function toInt(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * Parse filter parameters from the request
 */
export function parseFilterParams(req: NextRequest): FilterParams {
  const { searchParams } = new URL(req.url);

  return {
    [FilterParamKey.BUSINESS_AND_MOAT]: searchParams.get(FilterParamKey.BUSINESS_AND_MOAT) || undefined,
    [FilterParamKey.FINANCIAL_STATEMENT_ANALYSIS]: searchParams.get(FilterParamKey.FINANCIAL_STATEMENT_ANALYSIS) || undefined,
    [FilterParamKey.PAST_PERFORMANCE]: searchParams.get(FilterParamKey.PAST_PERFORMANCE) || undefined,
    [FilterParamKey.FUTURE_GROWTH]: searchParams.get(FilterParamKey.FUTURE_GROWTH) || undefined,
    [FilterParamKey.FAIR_VALUE]: searchParams.get(FilterParamKey.FAIR_VALUE) || undefined,
    [FilterParamKey.TOTAL]: searchParams.get(FilterParamKey.TOTAL) || undefined,
    [FilterParamKey.SEARCH]: searchParams.get(FilterParamKey.SEARCH) || undefined,
    [FilterParamKey.MARKET_CAP]: searchParams.get(FilterParamKey.MARKET_CAP) || undefined,
    [FilterParamKey.PE_RATIO]: searchParams.get(FilterParamKey.PE_RATIO) || undefined,
    [FilterParamKey.DIVIDEND_YIELD]: searchParams.get(FilterParamKey.DIVIDEND_YIELD) || undefined,
    [FilterParamKey.FORWARD_PE]: searchParams.get(FilterParamKey.FORWARD_PE) || undefined,
  };
}

/**
 * Create a cache filter for score thresholds
 */
export function createCacheFilter(filters: FilterParams): Prisma.TickerV1CachedScoreWhereInput {
  const cacheFilter: Prisma.TickerV1CachedScoreWhereInput = {};
  const bm = toInt(filters[FilterParamKey.BUSINESS_AND_MOAT]);
  const fsa = toInt(filters[FilterParamKey.FINANCIAL_STATEMENT_ANALYSIS]);
  const pp = toInt(filters[FilterParamKey.PAST_PERFORMANCE]);
  const fg = toInt(filters[FilterParamKey.FUTURE_GROWTH]);
  const fv = toInt(filters[FilterParamKey.FAIR_VALUE]);
  const total = toInt(filters[FilterParamKey.TOTAL]);

  if (bm !== undefined) cacheFilter.businessAndMoatScore = { gte: bm };
  if (fsa !== undefined) cacheFilter.financialStatementAnalysisScore = { gte: fsa };
  if (pp !== undefined) cacheFilter.pastPerformanceScore = { gte: pp };
  if (fg !== undefined) cacheFilter.futureGrowthScore = { gte: fg };
  if (fv !== undefined) cacheFilter.fairValueScore = { gte: fv };
  if (total !== undefined) cacheFilter.finalScore = { gte: total };

  return cacheFilter;
}

/**
 * Create a ticker filter with search and score filters
 */
export function createTickerFilter(
  spaceId: string,
  exchangeFilter: Prisma.TickerV1WhereInput,
  filters: FilterParams,
  cacheFilter: Prisma.TickerV1CachedScoreWhereInput
): Prisma.TickerV1WhereInput {
  // Base ticker filter
  const tickerFilter: Prisma.TickerV1WhereInput = {
    spaceId,
    ...exchangeFilter,
  };

  // Apply search filter if provided
  if (filters[FilterParamKey.SEARCH] && filters[FilterParamKey.SEARCH].trim()) {
    const searchTerm = filters[FilterParamKey.SEARCH].trim();
    tickerFilter.OR = [
      { symbol: { equals: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { symbol: { startsWith: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      { symbol: { contains: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Apply score filters if any are set
  if (Object.keys(cacheFilter).length > 0) {
    tickerFilter.cachedScoreEntry = { is: cacheFilter };
  }

  // Apply financial info filters (Market Cap, PE Ratio, Dividend Yield)
  const financialFilter = createFinancialInfoFilter(filters);
  if (Object.keys(financialFilter).length > 0) {
    tickerFilter.financialInfo = { is: financialFilter };
  }

  // Apply forward PE filter (sourced from the stock analyzer summary JSON)
  const forwardPeFilter = createForwardPeScraperFilter(filters);
  if (forwardPeFilter) {
    tickerFilter.stockAnalyzerScrapperInfo = { is: forwardPeFilter };
  }

  return tickerFilter;
}

/**
 * Create a financial info filter for market cap, PE ratio, and dividend yield.
 * Each param supports preset buckets (`<min>-<max>`), `negative`, and the
 * custom operator encoding (`gt:`/`lt:`/`eq:<value>` with K/M/B/T suffixes).
 */
export function createFinancialInfoFilter(filters: FilterParams): Prisma.TickerV1FinancialInfoWhereInput {
  const financialFilter: Prisma.TickerV1FinancialInfoWhereInput = {};

  // Market Cap filter
  const marketCapCriteria = parseNumericFilterValue(filters[FilterParamKey.MARKET_CAP]);
  if (marketCapCriteria) {
    const f = numericCriteriaToPrismaFilter(marketCapCriteria);
    if (f) financialFilter.marketCap = f;
  }

  // PE Ratio filter — keeps its special "Negative / No Earnings" bucket, which also matches null PE
  const peRatioParam = filters[FilterParamKey.PE_RATIO]?.trim();
  if (peRatioParam === 'negative') {
    financialFilter.OR = [{ pe: { lt: 0 } }, { pe: null }];
  } else {
    const peCriteria = parseNumericFilterValue(peRatioParam);
    if (peCriteria) {
      const f = numericCriteriaToPrismaFilter(peCriteria);
      if (f) financialFilter.pe = f;
    }
  }

  // Dividend Yield filter
  const dividendYieldCriteria = parseNumericFilterValue(filters[FilterParamKey.DIVIDEND_YIELD]);
  if (dividendYieldCriteria) {
    const f = numericCriteriaToPrismaFilter(dividendYieldCriteria);
    if (f) financialFilter.dividendYield = f;
  }

  return financialFilter;
}

/**
 * Create a scraper-info filter for forward PE. Forward PE is not a column on
 * TickerV1FinancialInfo — it only exists inside the stock analyzer summary
 * JSON, so it's filtered with a JSON path filter on `summary.forwardPE`.
 */
export function createForwardPeScraperFilter(filters: FilterParams): Prisma.TickerV1StockAnalyzerScrapperInfoWhereInput | null {
  const raw = filters[FilterParamKey.FORWARD_PE]?.trim();
  if (!raw) return null;

  const criteria = parseNumericFilterValue(raw);
  if (!criteria) return null;

  const path = ['forwardPE'];
  if (criteria.negative) return { summary: { path, lt: 0 } };
  if (criteria.op === 'gt') return { summary: { path, gt: criteria.value } };
  if (criteria.op === 'lt') return { summary: { path, lt: criteria.value } };
  if (criteria.op === 'eq') return { summary: { path, equals: criteria.value } };

  const rangeFilter: { path: string[]; gte?: number; lte?: number } = { path };
  if (criteria.min !== undefined) rangeFilter.gte = criteria.min;
  if (criteria.max !== undefined) rangeFilter.lte = criteria.max;
  if (rangeFilter.gte === undefined && rangeFilter.lte === undefined) return null;
  return { summary: rangeFilter };
}

/**
 * Check if any filters are applied
 */

export function hasFiltersAppliedServer(
  cacheFilter: Prisma.TickerV1CachedScoreWhereInput, // not used or remove this param
  filters: FilterParams
): boolean {
  const hasScoreFilters = Object.keys(cacheFilter).length > 0;
  const hasSearchFilter = !!filters[FilterParamKey.SEARCH]?.trim();
  const hasNumericFilter = NUMERIC_FILTER_DEFS.some((def) => !!filters[def.paramKey]?.trim());

  return hasScoreFilters || hasSearchFilter || hasNumericFilter;
}
