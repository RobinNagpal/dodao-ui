import { Prisma, TickerAnalysisCategory } from '@prisma/client';
import {
  MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS,
  ManagementTeamAlignmentVerdict,
  STABILITY_RESILIENCE_VERDICT_DESCRIPTIONS,
  STABILITY_RESILIENCE_VERDICT_LABELS,
  StabilityResilienceVerdict,
} from '@/types/ticker-typesv1';
import { NextRequest } from 'next/server';
import { ReadonlyURLSearchParams } from 'next/navigation';
// Generic numeric-filter primitives (operator encoding, K/M/B/T parsing, Prisma
// fragment building) shared with the ETF filters — reused, not duplicated.
import {
  NUMERIC_FILTER_OP_SYMBOLS,
  formatCompactNumber,
  matchesNumericCriteria,
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
  REPORT_DATE_FROM = 'reportDateFrom',
  REPORT_DATE_TO = 'reportDateTo',
  MANAGEMENT_ALIGNMENT = 'managementAlignment',
  STABILITY_RESILIENCE = 'stabilityResilience',
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
  REPORT_DATE_FROM = 'reportDateFrom',
  REPORT_DATE_TO = 'reportDateTo',
  MANAGEMENT_ALIGNMENT = 'managementAlignment',
  STABILITY_RESILIENCE = 'stabilityResilience',
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

// Filter types backed by the report date (when the stock's report was last generated).
export type DateFilterType = FilterType.REPORT_DATE_FROM | FilterType.REPORT_DATE_TO;

// Interface for report-date filters (one bound each, so the two combine into a range)
export interface AppliedDateFilter extends AppliedFilterBase {
  type: DateFilterType;
  paramKey: FilterParamKey;
  // The `YYYY-MM-DD` URL value, kept verbatim so the date input re-hydrates.
  raw: string;
}

// Filter types backed by a report verdict the user picks from a fixed list.
export type MultiSelectFilterType = FilterType.MANAGEMENT_ALIGNMENT | FilterType.STABILITY_RESILIENCE;

// Interface for multi-select verdict filters (a stock matches any selected value)
export interface AppliedMultiSelectFilter extends AppliedFilterBase {
  type: MultiSelectFilterType;
  paramKey: FilterParamKey;
  // The comma-separated URL value, normalized to the recognized options only,
  // so the modal control re-hydrates to exactly what is being filtered on.
  raw: string;
  values: string[];
}

// Union type for all filter types
export type AppliedFilter =
  | AppliedCategoryFilter
  | AppliedTotalFilter
  | AppliedSearchFilter
  | AppliedNumericFilter
  | AppliedDateFilter
  | AppliedMultiSelectFilter;

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
  [FilterParamKey.REPORT_DATE_FROM]?: string;
  [FilterParamKey.REPORT_DATE_TO]?: string;
  [FilterParamKey.MANAGEMENT_ALIGNMENT]?: string;
  [FilterParamKey.STABILITY_RESILIENCE]?: string;
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

// Definition of a report-date bound (drives parsing, chips, and the modal's date inputs)
export interface DateFilterDef {
  type: DateFilterType;
  paramKey: FilterParamKey;
  /** Control label inside the modal. */
  label: string;
  /** Chip prefix, e.g. "Report updated on/after". */
  chipPrefix: string;
}

/**
 * The report date is `TickerV1.updatedAt`: every report save bumps it (see
 * `bumpUpdatedAtAndInvalidateCache` / `saveFinalSummaryResponse`), which is the
 * same anchor `getOldestStocksOverall` uses to find stale reports.
 */
export const DATE_FILTER_DEFS: ReadonlyArray<DateFilterDef> = [
  {
    type: FilterType.REPORT_DATE_FROM,
    paramKey: FilterParamKey.REPORT_DATE_FROM,
    label: 'From',
    chipPrefix: 'Report updated on/after',
  },
  {
    type: FilterType.REPORT_DATE_TO,
    paramKey: FilterParamKey.REPORT_DATE_TO,
    label: 'To',
    chipPrefix: 'Report updated on/before',
  },
] as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Accept only a real `YYYY-MM-DD` calendar date (what `<input type="date">` emits). */
export function parseIsoDateParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!ISO_DATE_PATTERN.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  // A hand-edited URL can carry an out-of-range day, which `Date` silently rolls
  // forward (2026-02-30 → 2026-03-02). Reject it rather than filter on a date
  // that differs from the one in the URL.
  return parsed.toISOString().startsWith(value) ? value : null;
}

/**
 * Date bounds are resolved in UTC on both sides of the wire, so a filter matches
 * the same stocks whether Prisma or the browser evaluates it. `From` covers the
 * whole start day, `To` the whole end day.
 */
export function isoDateToStartOfDayUtc(raw: string | null | undefined): Date | null {
  const value = parseIsoDateParam(raw);
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export function isoDateToEndOfDayUtc(raw: string | null | undefined): Date | null {
  const value = parseIsoDateParam(raw);
  return value ? new Date(`${value}T23:59:59.999Z`) : null;
}

// One option in a multi-select verdict filter.
export interface MultiSelectFilterOption {
  value: string;
  label: string;
  /** Optional one-liner shown under the label in the dropdown. */
  description?: string;
}

// Definition of a verdict filter (drives parsing, chips, and the modal dropdown)
export interface MultiSelectFilterDef {
  type: MultiSelectFilterType;
  paramKey: FilterParamKey;
  label: string;
  options: ReadonlyArray<MultiSelectFilterOption>;
}

/**
 * The two report verdicts a stock can be filtered by. Each is a fixed enum on
 * its report row (`TickerV1ManagementTeamReport.alignmentVerdict` /
 * `TickerV1StabilityReport.resilienceVerdict`), and selecting several values
 * matches a stock carrying ANY of them.
 */
export const MULTI_SELECT_FILTER_DEFS: ReadonlyArray<MultiSelectFilterDef> = [
  {
    type: FilterType.MANAGEMENT_ALIGNMENT,
    paramKey: FilterParamKey.MANAGEMENT_ALIGNMENT,
    label: 'Management Team Experience & Alignment',
    options: Object.values(ManagementTeamAlignmentVerdict).map((verdict) => ({
      value: verdict,
      label: MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS[verdict],
    })),
  },
  {
    type: FilterType.STABILITY_RESILIENCE,
    paramKey: FilterParamKey.STABILITY_RESILIENCE,
    label: 'Stability & Market Drawdown',
    options: Object.values(StabilityResilienceVerdict).map((verdict) => ({
      value: verdict,
      label: STABILITY_RESILIENCE_VERDICT_LABELS[verdict],
      description: STABILITY_RESILIENCE_VERDICT_DESCRIPTIONS[verdict],
    })),
  },
] as const;

/**
 * Split a comma-separated verdict param into the recognized options only,
 * de-duplicated and kept in the definition's order. An unknown value (a stale
 * bookmark, a hand-edited URL) is dropped rather than filtering on nothing.
 */
export function parseMultiSelectParam(raw: string | null | undefined, def: MultiSelectFilterDef): string[] {
  if (!raw) return [];
  const requested = new Set(
    raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
  );
  return def.options.filter((option) => requested.has(option.value)).map((option) => option.value);
}

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

/** Reads one filter param by key. Backed either by the URL or by an in-memory selection map. */
export type FilterParamGetter = (paramKey: string) => string | null;

/**
 * Parse the applied filters out of an arbitrary param source. Shared by the
 * URL-driven stock pages and by client-side (state-driven) filtering, so both
 * produce identical chips and semantics.
 */
export function getAppliedFiltersFromGetter(getParam: FilterParamGetter): AppliedFilter[] {
  const filters: AppliedFilter[] = [];

  // Category filters
  for (const category of CATEGORY_OPTIONS) {
    const param = getParam(category.paramKey);
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
  const totalThresholdRaw: string | null = getParam(FilterParamKey.TOTAL);
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
  const searchQueryRaw: string | null = getParam(FilterParamKey.SEARCH);
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
    const raw: string | null = getParam(def.paramKey);
    if (raw != null && raw.trim().length > 0) {
      const f = parseNumericAppliedFilter(raw, def);
      if (f) filters.push(f);
    }
  }

  // Report verdicts (management alignment, stability resilience)
  for (const def of MULTI_SELECT_FILTER_DEFS) {
    const values: string[] = parseMultiSelectParam(getParam(def.paramKey), def);
    if (values.length > 0) {
      const labels: string = values.map((v) => def.options.find((o) => o.value === v)?.label ?? v).join(', ');
      filters.push({
        type: def.type,
        paramKey: def.paramKey,
        raw: values.join(','),
        values,
        label: `${def.label}: ${labels}`,
      });
    }
  }

  // Report-date bounds
  for (const def of DATE_FILTER_DEFS) {
    const date: string | null = parseIsoDateParam(getParam(def.paramKey));
    if (date) {
      filters.push({
        type: def.type,
        paramKey: def.paramKey,
        raw: date,
        label: `${def.chipPrefix} ${date}`,
      });
    }
  }

  return filters;
}

/**
 * Parse current filters from URL search params.
 */
export function getAppliedFilters(searchParams: ReadonlyURLSearchParams): AppliedFilter[] {
  return getAppliedFiltersFromGetter((paramKey: string): string | null => searchParams.get(paramKey));
}

/**
 * Parse current filters out of an in-memory selection map — the client-side
 * counterpart of {@link getAppliedFilters}, for screens that keep filter state
 * in React state instead of the URL.
 */
export function getAppliedFiltersFromSelected(selected: SelectedFiltersMap): AppliedFilter[] {
  return getAppliedFiltersFromGetter((paramKey: string): string | null => selected[paramKey] ?? null);
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
  for (const def of DATE_FILTER_DEFS) {
    params.delete(def.paramKey);
  }
  for (const def of MULTI_SELECT_FILTER_DEFS) {
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
  NUMERIC_FILTER_DEFS.some((def) => Boolean(toScalar(sp?.[def.paramKey]))) ||
  DATE_FILTER_DEFS.some((def) => Boolean(parseIsoDateParam(toScalar(sp?.[def.paramKey])))) ||
  MULTI_SELECT_FILTER_DEFS.some((def) => parseMultiSelectParam(toScalar(sp?.[def.paramKey]), def).length > 0);

/** ----- Client-side (in-browser) Filtering ----- */

/**
 * The ticker fields the stock filters evaluate. Screens that filter an already
 * fetched list in the browser (rather than re-querying the DB) map their rows
 * onto this shape and hand it to {@link matchesSelectedFilters}.
 */
export interface FilterableTicker {
  symbol: string;
  name?: string | null;
  /** Per-category AI scores, keyed the same way as {@link CATEGORY_OPTIONS}. */
  categoryScores?: Partial<Record<TickerAnalysisCategory, number | null>> | null;
  totalScore?: number | null;
  marketCap?: number | null;
  pe?: number | null;
  dividendYield?: number | null;
  forwardPe?: number | null;
  /** When the stock's report was last generated (`TickerV1.updatedAt`). */
  reportUpdatedAt?: Date | string | null;
  /** `TickerV1ManagementTeamReport.alignmentVerdict`, when the report exists. */
  managementAlignment?: string | null;
  /** `TickerV1StabilityReport.resilienceVerdict`, when the report exists. */
  stabilityResilience?: string | null;
}

/** Which {@link FilterableTicker} field each verdict filter reads. */
const MULTI_SELECT_FILTER_FIELDS: Record<string, (ticker: FilterableTicker) => string | null> = {
  [FilterParamKey.MANAGEMENT_ALIGNMENT]: (ticker) => ticker.managementAlignment ?? null,
  [FilterParamKey.STABILITY_RESILIENCE]: (ticker) => ticker.stabilityResilience ?? null,
};

/** Which {@link FilterableTicker} field each numeric filter reads. */
const NUMERIC_FILTER_FIELDS: Record<string, (ticker: FilterableTicker) => number | null> = {
  [FilterParamKey.MARKET_CAP]: (ticker) => ticker.marketCap ?? null,
  [FilterParamKey.PE_RATIO]: (ticker) => ticker.pe ?? null,
  [FilterParamKey.DIVIDEND_YIELD]: (ticker) => ticker.dividendYield ?? null,
  [FilterParamKey.FORWARD_PE]: (ticker) => ticker.forwardPe ?? null,
};

/**
 * Does this ticker satisfy every selected filter?
 *
 * Mirrors the server-side Prisma filters in `createTickerFilter` so a stock the
 * `/stocks-filtered` pages would show is exactly the stock this returns true for:
 * thresholds are inclusive (`>=`), a missing score/metric never matches, and the
 * PE "Negative / No Earnings" bucket also matches an unknown PE.
 */
export function matchesSelectedFilters(ticker: FilterableTicker, selected: SelectedFiltersMap): boolean {
  // Category score thresholds
  for (const category of CATEGORY_OPTIONS) {
    const threshold = toInt(selected[category.paramKey]);
    if (threshold === undefined) continue;
    const score = ticker.categoryScores?.[category.value];
    if (score == null || score < threshold) return false;
  }

  // Total score threshold
  const totalThreshold = toInt(selected[FilterParamKey.TOTAL]);
  if (totalThreshold !== undefined) {
    if (ticker.totalScore == null || ticker.totalScore < totalThreshold) return false;
  }

  // Free-text search over symbol and name
  const searchQuery = selected[FilterParamKey.SEARCH]?.trim().toLowerCase();
  if (searchQuery) {
    const haystack = `${ticker.symbol} ${ticker.name ?? ''}`.toLowerCase();
    if (!haystack.includes(searchQuery)) return false;
  }

  // Numeric metrics (market cap, PE, dividend yield, forward PE)
  for (const def of NUMERIC_FILTER_DEFS) {
    const raw = selected[def.paramKey]?.trim();
    if (!raw) continue;
    const value = NUMERIC_FILTER_FIELDS[def.paramKey](ticker);

    // PE keeps its special bucket that also matches a missing PE — same as the server.
    if (def.paramKey === FilterParamKey.PE_RATIO && raw === 'negative') {
      if (value !== null && value >= 0) return false;
      continue;
    }

    const criteria = parseNumericFilterValue(raw);
    if (!criteria) continue;
    if (!matchesNumericCriteria(value, criteria)) return false;
  }

  // Report verdicts — a stock matches when its verdict is any of the selected ones.
  for (const def of MULTI_SELECT_FILTER_DEFS) {
    const values: string[] = parseMultiSelectParam(selected[def.paramKey], def);
    if (values.length === 0) continue;
    const verdict: string | null = MULTI_SELECT_FILTER_FIELDS[def.paramKey](ticker);
    // No report means no verdict, so it can't be one of the selected ones —
    // matching the server's `some: { ... }` on the report relation.
    if (verdict === null || !values.includes(verdict)) return false;
  }

  // Report-date bounds
  for (const def of DATE_FILTER_DEFS) {
    const isFrom: boolean = def.type === FilterType.REPORT_DATE_FROM;
    const bound: Date | null = isFrom ? isoDateToStartOfDayUtc(selected[def.paramKey]) : isoDateToEndOfDayUtc(selected[def.paramKey]);
    if (!bound) continue;

    // A stock with no report date can't satisfy a date bound, matching the
    // server's `updatedAt` comparison against a non-null column.
    if (ticker.reportUpdatedAt == null) return false;
    const reportedAt: number = new Date(ticker.reportUpdatedAt).getTime();
    if (Number.isNaN(reportedAt)) return false;
    if (isFrom ? reportedAt < bound.getTime() : reportedAt > bound.getTime()) return false;
  }

  return true;
}

/** Return a new selection map with one applied filter removed. */
export function removeFilterFromSelected(selected: SelectedFiltersMap, filterToRemove: AppliedFilter): SelectedFiltersMap {
  const paramKey: FilterParamKey | undefined =
    filterToRemove.type === FilterType.CATEGORY
      ? CATEGORY_OPTIONS.find((opt) => opt.value === filterToRemove.categoryKey)?.paramKey
      : filterToRemove.type === FilterType.TOTAL
      ? FilterParamKey.TOTAL
      : filterToRemove.type === FilterType.SEARCH
      ? FilterParamKey.SEARCH
      : filterToRemove.paramKey;

  if (!paramKey) return selected;
  const { [paramKey]: _removed, ...rest } = selected;
  return rest;
}

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
    [FilterParamKey.REPORT_DATE_FROM]: searchParams.get(FilterParamKey.REPORT_DATE_FROM) || undefined,
    [FilterParamKey.REPORT_DATE_TO]: searchParams.get(FilterParamKey.REPORT_DATE_TO) || undefined,
    [FilterParamKey.MANAGEMENT_ALIGNMENT]: searchParams.get(FilterParamKey.MANAGEMENT_ALIGNMENT) || undefined,
    [FilterParamKey.STABILITY_RESILIENCE]: searchParams.get(FilterParamKey.STABILITY_RESILIENCE) || undefined,
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

  // Apply the report-date bounds
  const reportDateFilter = createReportDateFilter(filters);
  if (reportDateFilter) {
    tickerFilter.updatedAt = reportDateFilter;
  }

  // Apply the report-verdict filters
  const managementVerdicts = getSelectedVerdicts(filters, FilterParamKey.MANAGEMENT_ALIGNMENT);
  if (managementVerdicts.length > 0) {
    tickerFilter.managementTeamReports = { some: { alignmentVerdict: { in: managementVerdicts as ManagementTeamAlignmentVerdict[] } } };
  }

  const stabilityVerdicts = getSelectedVerdicts(filters, FilterParamKey.STABILITY_RESILIENCE);
  if (stabilityVerdicts.length > 0) {
    tickerFilter.stabilityReports = { some: { resilienceVerdict: { in: stabilityVerdicts as StabilityResilienceVerdict[] } } };
  }

  return tickerFilter;
}

/** The recognized verdict values selected for one multi-select filter. */
export function getSelectedVerdicts(filters: FilterParams, paramKey: FilterParamKey): string[] {
  const def = MULTI_SELECT_FILTER_DEFS.find((d) => d.paramKey === paramKey);
  if (!def) return [];
  return parseMultiSelectParam(filters[paramKey], def);
}

/**
 * Build the `TickerV1.updatedAt` range for the report-date bounds. `updatedAt`
 * is bumped by every report save, so it is the ticker's report date.
 */
export function createReportDateFilter(filters: FilterParams): Prisma.DateTimeFilter | null {
  const from: Date | null = isoDateToStartOfDayUtc(filters[FilterParamKey.REPORT_DATE_FROM]);
  const to: Date | null = isoDateToEndOfDayUtc(filters[FilterParamKey.REPORT_DATE_TO]);
  if (!from && !to) return null;

  const dateFilter: Prisma.DateTimeFilter = {};
  if (from) dateFilter.gte = from;
  if (to) dateFilter.lte = to;
  return dateFilter;
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
  const hasDateFilter = DATE_FILTER_DEFS.some((def) => !!parseIsoDateParam(filters[def.paramKey]));
  const hasVerdictFilter = MULTI_SELECT_FILTER_DEFS.some((def) => parseMultiSelectParam(filters[def.paramKey], def).length > 0);

  return hasScoreFilters || hasSearchFilter || hasNumericFilter || hasDateFilter || hasVerdictFilter;
}
