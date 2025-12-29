import { Prisma, TickerAnalysisCategory } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ReadonlyURLSearchParams } from 'next/navigation';

/** ----- Types and Enums ----- */

// Enum for filter types
export enum FilterType {
  CATEGORY = 'category',
  TOTAL = 'total',
  SEARCH = 'search',
  MARKET_CAP = 'marketCap',
  PE_RATIO = 'peRatio',
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

// Interface for market cap filters
export interface AppliedMarketCapFilter extends AppliedFilterBase {
  type: FilterType.MARKET_CAP;
  minValue?: number;
  maxValue?: number;
}

// Interface for PE ratio filters
export interface AppliedPERatioFilter extends AppliedFilterBase {
  type: FilterType.PE_RATIO;
  minValue?: number;
  maxValue?: number;
}

// Union type for all filter types
export type AppliedFilter = AppliedCategoryFilter | AppliedTotalFilter | AppliedSearchFilter | AppliedMarketCapFilter | AppliedPERatioFilter;

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
    } else if (filter.type === FilterType.MARKET_CAP) {
      const min = filter.minValue !== undefined ? filter.minValue : '';
      const max = filter.maxValue !== undefined ? filter.maxValue : '';
      initial[FilterParamKey.MARKET_CAP] = `${min}-${max}`;
    } else if (filter.type === FilterType.PE_RATIO) {
      const value = filter.label.includes('Negative') ? 'negative' : '';
      if (!value) {
        const min = filter.minValue !== undefined ? filter.minValue : '';
        const max = filter.maxValue !== undefined ? filter.maxValue : '';
        initial[FilterParamKey.PE_RATIO] = `${min}-${max}`;
      } else {
        initial[FilterParamKey.PE_RATIO] = value;
      }
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

  // Market Cap
  const marketCapRaw: string | null = searchParams.get(FilterParamKey.MARKET_CAP);
  if (marketCapRaw != null && marketCapRaw.trim().length > 0) {
    const [minStr, maxStr] = marketCapRaw.split('-');
    const minValue = minStr ? parseFloat(minStr) : undefined;
    const maxValue = maxStr ? parseFloat(maxStr) : undefined;

    // Find matching label from options
    const matchingOption = MARKET_CAP_OPTIONS.find((opt) => opt.value === marketCapRaw);
    const label = matchingOption ? matchingOption.label : `Market Cap: ${formatMarketCap(minValue, maxValue)}`;

    filters.push({
      type: FilterType.MARKET_CAP,
      minValue,
      maxValue,
      label,
    });
  }

  // PE Ratio
  const peRatioRaw: string | null = searchParams.get(FilterParamKey.PE_RATIO);
  if (peRatioRaw != null && peRatioRaw.trim().length > 0) {
    if (peRatioRaw === 'negative') {
      filters.push({
        type: FilterType.PE_RATIO,
        label: 'PE Ratio: Negative / No Earnings',
      });
    } else {
      const [minStr, maxStr] = peRatioRaw.split('-');
      const minValue = minStr ? parseFloat(minStr) : undefined;
      const maxValue = maxStr ? parseFloat(maxStr) : undefined;

      // Find matching label from options
      const matchingOption = PE_RATIO_OPTIONS.find((opt) => opt.value === peRatioRaw);
      const label = matchingOption ? matchingOption.label : `PE Ratio: ${formatPERatio(minValue, maxValue)}`;

      filters.push({
        type: FilterType.PE_RATIO,
        minValue,
        maxValue,
        label,
      });
    }
  }

  return filters;
}

/**
 * Helper function to format market cap for display
 */
function formatMarketCap(min?: number, max?: number): string {
  const formatValue = (val: number): string => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val}`;
  };

  if (min !== undefined && max !== undefined) {
    return `${formatValue(min)} - ${formatValue(max)}`;
  } else if (min !== undefined) {
    return `> ${formatValue(min)}`;
  } else if (max !== undefined) {
    return `< ${formatValue(max)}`;
  }
  return 'Any';
}

/**
 * Helper function to format PE ratio for display
 */
function formatPERatio(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) {
    return `${min} - ${max}`;
  } else if (min !== undefined) {
    return `> ${min}`;
  } else if (max !== undefined) {
    return `< ${max}`;
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
  params.delete(FilterParamKey.MARKET_CAP);
  params.delete(FilterParamKey.PE_RATIO);
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
  } else if (filterToRemove.type === FilterType.MARKET_CAP) {
    params.delete(FilterParamKey.MARKET_CAP);
  } else if (filterToRemove.type === FilterType.PE_RATIO) {
    params.delete(FilterParamKey.PE_RATIO);
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
  Boolean(toScalar(sp?.[FilterParamKey.MARKET_CAP])) ||
  Boolean(toScalar(sp?.[FilterParamKey.PE_RATIO]));

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

  // Apply financial info filters (Market Cap and PE Ratio)
  const financialFilter = createFinancialInfoFilter(filters);
  if (Object.keys(financialFilter).length > 0) {
    tickerFilter.financialInfo = { is: financialFilter };
  }

  return tickerFilter;
}

/**
 * Create a financial info filter for market cap and PE ratio
 */
export function createFinancialInfoFilter(filters: FilterParams): Prisma.TickerV1FinancialInfoWhereInput {
  const financialFilter: Prisma.TickerV1FinancialInfoWhereInput = {};

  // Market Cap filter
  const marketCapParam = filters[FilterParamKey.MARKET_CAP];
  if (marketCapParam && marketCapParam.trim()) {
    const [minStr, maxStr] = marketCapParam.split('-');
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;

    if (min !== undefined && max !== undefined) {
      financialFilter.marketCap = { gte: min, lte: max };
    } else if (min !== undefined) {
      financialFilter.marketCap = { gte: min };
    } else if (max !== undefined) {
      financialFilter.marketCap = { lte: max };
    }
  }

  // PE Ratio filter
  const peRatioParam = filters[FilterParamKey.PE_RATIO];
  if (peRatioParam && peRatioParam.trim()) {
    if (peRatioParam === 'negative') {
      // Filter for negative or null PE ratios
      financialFilter.OR = [{ pe: { lt: 0 } }, { pe: null }];
    } else {
      const [minStr, maxStr] = peRatioParam.split('-');
      const min = minStr ? parseFloat(minStr) : undefined;
      const max = maxStr ? parseFloat(maxStr) : undefined;

      if (min !== undefined && max !== undefined) {
        financialFilter.pe = { gte: min, lte: max };
      } else if (min !== undefined) {
        financialFilter.pe = { gte: min };
      } else if (max !== undefined) {
        financialFilter.pe = { lte: max };
      }
    }
  }

  return financialFilter;
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
  const hasMarketCapFilter = !!filters[FilterParamKey.MARKET_CAP]?.trim();
  const hasPERatioFilter = !!filters[FilterParamKey.PE_RATIO]?.trim();

  return hasScoreFilters || hasSearchFilter || hasMarketCapFilter || hasPERatioFilter;
}
