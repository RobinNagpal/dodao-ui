// utils/filters.ts
import { TickerAnalysisCategory } from '@prisma/client';
import { ReadonlyURLSearchParams } from 'next/navigation';

/** ----- Types ----- */

export type FilterType = 'category' | 'total' | 'search';

type SearchParams = { [key: string]: string | string[] | undefined };

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
  key: string;
}

export interface ThresholdOption {
  label: string;
  value: string;
}

export interface AppliedFilterBase {
  type: FilterType;
  label: string;
}

export interface AppliedCategoryFilter extends AppliedFilterBase {
  type: 'category';
  categoryKey: TickerAnalysisCategory;
  threshold: number;
}

export interface AppliedTotalFilter extends AppliedFilterBase {
  type: 'total';
  threshold: number;
}

export interface AppliedSearchFilter extends AppliedFilterBase {
  type: 'search';
  searchQuery: string;
}

export type AppliedFilter = AppliedCategoryFilter | AppliedTotalFilter | AppliedSearchFilter;

export type SelectedFiltersMap = Record<string, string>;

/** ----- Constants (readonly) ----- */

export const CATEGORY_OPTIONS: ReadonlyArray<FilterOption<TickerAnalysisCategory>> = [
  { label: 'Business & Moat', value: 'BusinessAndMoat', key: 'BusinessAndMoat' },
  { label: 'Financial Statement Analysis', value: 'FinancialStatementAnalysis', key: 'FinancialStatementAnalysis' },
  { label: 'Past Performance', value: 'PastPerformance', key: 'PastPerformance' },
  { label: 'Future Growth', value: 'FutureGrowth', key: 'FutureGrowth' },
  { label: 'Fair Value', value: 'FairValue', key: 'FairValue' },
] as const;

export const CATEGORY_THRESHOLD_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 3', value: '3' },
  { label: '≥ 4', value: '4' },
  { label: '≥ 5', value: '5' },
] as const;

export const TOTAL_SCORE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: '≥ 15', value: '15' },
  { label: '≥ 18', value: '18' },
  { label: '≥ 21', value: '21' },
] as const;

/** ----- Helpers ----- */

export function categoryThresholdParamKey(categoryKey: string): string {
  return `${categoryKey.toLowerCase()}Threshold`;
}

export function buildInitialSelected(filters: ReadonlyArray<AppliedFilter>): SelectedFiltersMap {
  const initial: SelectedFiltersMap = {};
  for (const filter of filters) {
    if (filter.type === 'category') {
      initial[categoryThresholdParamKey(filter.categoryKey)] = String(filter.threshold);
    } else if (filter.type === 'total') {
      initial['totalThreshold'] = String(filter.threshold);
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
    const param = searchParams.get(categoryThresholdParamKey(category.key));
    if (param != null && param.trim().length > 0) {
      const n: number = Number.parseInt(param, 10);
      if (!Number.isNaN(n)) {
        filters.push({
          type: 'category',
          categoryKey: category.value,
          threshold: n,
          label: `${category.label} ≥ ${n}`,
        });
      }
    }
  }

  // Total score
  const totalThresholdRaw: string | null = searchParams.get('totalThreshold');
  if (totalThresholdRaw != null && totalThresholdRaw.trim().length > 0) {
    const n: number = Number.parseInt(totalThresholdRaw, 10);
    if (!Number.isNaN(n)) {
      filters.push({
        type: 'total',
        threshold: n,
        label: `Total Score ≥ ${n}`,
      });
    }
  }

  // Search
  const searchQueryRaw: string | null = searchParams.get('search');
  if (searchQueryRaw != null) {
    const q: string = searchQueryRaw.trim();
    if (q.length > 0) {
      filters.push({
        type: 'search',
        searchQuery: q,
        label: `Search: ${q}`,
      });
    }
  }

  return filters;
}

/**
 * Return a new URLSearchParams with all filter params cleared.
 */
export function clearAllFilterParams(searchParams: ReadonlyURLSearchParams): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(searchParams.toString());
  for (const c of CATEGORY_OPTIONS) {
    params.delete(categoryThresholdParamKey(c.key));
  }
  params.delete('totalThreshold');
  params.delete('search');
  return params;
}

/**
 * Return new params with a single filter removed.
 */
export function removeFilterFromParams(searchParams: ReadonlyURLSearchParams, filterToRemove: AppliedFilter): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(searchParams.toString());
  if (filterToRemove.type === 'category') {
    params.delete(categoryThresholdParamKey(filterToRemove.categoryKey));
  } else if (filterToRemove.type === 'total') {
    params.delete('totalThreshold');
  } else if (filterToRemove.type === 'search') {
    params.delete('search');
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

export const toSortedQueryString = (sp: SearchParams): string => {
  const usp = new URLSearchParams();
  Object.keys(sp)
    .sort()
    .forEach((k) => {
      if (k === 'page') return;
      const v = toScalar(sp[k]);
      if (v) usp.set(k, v);
    });
  usp.set('country', 'US');
  return usp.toString();
};

export const hasFiltersApplied = (sp: SearchParams): boolean => Object.keys(sp).some((k) => k.includes('Threshold')) || Boolean(toScalar(sp['search']));
