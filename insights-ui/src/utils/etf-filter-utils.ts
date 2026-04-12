import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ReadonlyURLSearchParams } from 'next/navigation';

/** ----- Types and Enums ----- */

export enum EtfFilterType {
  AUM = 'aum',
  EXPENSE_RATIO = 'expenseRatio',
  PE_RATIO = 'peRatio',
  DIVIDEND_TTM = 'dividendTtm',
  PAYOUT_FREQUENCY = 'payoutFrequency',
  SHARES_OUT = 'sharesOut',
  HOLDINGS = 'holdings',
  SEARCH = 'search',
  // Advanced (Morningstar) filters — per period
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
  PAYOUT_FREQUENCY = 'payoutFrequency',
  SHARES_OUT = 'sharesOut',
  HOLDINGS = 'holdings',
  SEARCH = 'search',
  // Advanced (Morningstar) filters — per period
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
  | EtfFilterType.SHARES_OUT
  | EtfFilterType.HOLDINGS
  | EtfFilterType.MOR_UPSIDE_3YR
  | EtfFilterType.MOR_UPSIDE_5YR
  | EtfFilterType.MOR_UPSIDE_10YR
  | EtfFilterType.MOR_DOWNSIDE_3YR
  | EtfFilterType.MOR_DOWNSIDE_5YR
  | EtfFilterType.MOR_DOWNSIDE_10YR;

type SelectFilterType = EtfFilterType.PAYOUT_FREQUENCY | EtfFilterType.MOR_RISK_3YR | EtfFilterType.MOR_RISK_5YR | EtfFilterType.MOR_RISK_10YR;

export interface AppliedEtfRangeFilter extends AppliedEtfFilterBase {
  type: RangeFilterType;
  minValue?: number;
  maxValue?: number;
}

export interface AppliedEtfSelectFilter extends AppliedEtfFilterBase {
  type: SelectFilterType;
  selectedValue: string;
}

export interface AppliedEtfSearchFilter extends AppliedEtfFilterBase {
  type: EtfFilterType.SEARCH;
  searchQuery: string;
}

export type AppliedEtfFilter = AppliedEtfRangeFilter | AppliedEtfSelectFilter | AppliedEtfSearchFilter;

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

export const ETF_SHARES_OUT_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Small (< 10M)', value: '0-10000000' },
  { label: 'Medium (10M - 50M)', value: '10000000-50000000' },
  { label: 'Large (50M - 200M)', value: '50000000-200000000' },
  { label: 'Very Large (> 200M)', value: '200000000-' },
] as const;

export const ETF_HOLDINGS_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Very Few (1 - 5)', value: '0-5' },
  { label: 'Few (5 - 15)', value: '5-15' },
  { label: 'Moderate (15 - 50)', value: '15-50' },
  { label: 'Many (50 - 250)', value: '50-250' },
  { label: 'Very Many (250+)', value: '250-' },
] as const;

export const ETF_MOR_UPSIDE_CAPTURE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low (< 80%)', value: '0-80' },
  { label: 'Below Avg (80% - 95%)', value: '80-95' },
  { label: 'Average (95% - 105%)', value: '95-105' },
  { label: 'Above Avg (105% - 120%)', value: '105-120' },
  { label: 'High (> 120%)', value: '120-' },
] as const;

export const ETF_MOR_DOWNSIDE_CAPTURE_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Excellent (< 50%)', value: '0-50' },
  { label: 'Good (50% - 70%)', value: '50-70' },
  { label: 'Average (70% - 90%)', value: '70-90' },
  { label: 'Below Avg (90% - 100%)', value: '90-100' },
  { label: 'Poor (> 100%)', value: '100-' },
] as const;

export const ETF_MOR_RISK_LEVEL_OPTIONS: ReadonlyArray<ThresholdOption> = [
  { label: 'Any', value: '' },
  { label: 'Low', value: 'Low' },
  { label: 'Below Average', value: 'Below Average' },
  { label: 'Average', value: 'Average' },
  { label: 'Above Average', value: 'Above Average' },
  { label: 'High', value: 'High' },
] as const;

const ALL_ETF_PARAM_KEYS: EtfFilterParamKey[] = [
  EtfFilterParamKey.AUM,
  EtfFilterParamKey.EXPENSE_RATIO,
  EtfFilterParamKey.PE_RATIO,
  EtfFilterParamKey.DIVIDEND_TTM,
  EtfFilterParamKey.PAYOUT_FREQUENCY,
  EtfFilterParamKey.SHARES_OUT,
  EtfFilterParamKey.HOLDINGS,
  EtfFilterParamKey.SEARCH,
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

export interface MorAdvancedFilterDef {
  paramKey: EtfFilterParamKey;
  filterType: EtfFilterType;
  period: MorPeriodKey;
  kind: 'upside' | 'downside' | 'risk';
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

const SELECT_FILTER_TYPES: Set<string> = new Set([
  EtfFilterType.PAYOUT_FREQUENCY,
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

  if (raw === 'negative') {
    return {
      type,
      paramKey,
      label: options.find((o) => o.value === 'negative')?.label || `${defaultLabel}: Negative / N/A`,
    };
  }

  const [minStr, maxStr] = raw.split('-');
  const minValue = minStr ? parseFloat(minStr) : undefined;
  const maxValue = maxStr ? parseFloat(maxStr) : undefined;

  const matchingOption = options.find((opt) => opt.value === raw);
  const label = matchingOption ? matchingOption.label : `${defaultLabel}: ${formatRange(minValue, maxValue)}`;

  return { type, paramKey, minValue, maxValue, label };
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

  // Shares Outstanding
  const soRaw = searchParams.get(EtfFilterParamKey.SHARES_OUT);
  if (soRaw) {
    const f = parseRangeFilter(soRaw, EtfFilterType.SHARES_OUT, EtfFilterParamKey.SHARES_OUT, ETF_SHARES_OUT_OPTIONS, 'Shares Out');
    if (f) filters.push(f);
  }

  // Holdings
  const holdingsRaw = searchParams.get(EtfFilterParamKey.HOLDINGS);
  if (holdingsRaw) {
    const f = parseRangeFilter(holdingsRaw, EtfFilterType.HOLDINGS, EtfFilterParamKey.HOLDINGS, ETF_HOLDINGS_OPTIONS, 'Holdings');
    if (f) filters.push(f);
  }

  // Morningstar advanced filters (per-period)
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
    } else if (SELECT_FILTER_TYPES.has(filter.type)) {
      initial[filter.paramKey] = (filter as AppliedEtfSelectFilter).selectedValue;
    } else {
      const rangeFilter = filter as AppliedEtfRangeFilter;
      if (filter.label.includes('Negative')) {
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

export function createEtfFinancialFilter(filters: EtfFilterParams): Prisma.EtfFinancialInfoWhereInput {
  const where: Prisma.EtfFinancialInfoWhereInput = {};

  const erRange = parseRangeParam(filters[EtfFilterParamKey.EXPENSE_RATIO]);
  if (erRange) {
    const erFilter: Prisma.FloatNullableFilter = {};
    if (erRange.min !== undefined) erFilter.gte = erRange.min;
    if (erRange.max !== undefined) erFilter.lte = erRange.max;
    where.expenseRatio = erFilter;
  }

  const peParam = filters[EtfFilterParamKey.PE_RATIO];
  if (peParam && peParam.trim()) {
    if (peParam === 'negative') {
      where.OR = [{ pe: { lt: 0 } }, { pe: null }];
    } else {
      const peRange = parseRangeParam(peParam);
      if (peRange) {
        const peFilter: Prisma.FloatNullableFilter = {};
        if (peRange.min !== undefined) peFilter.gte = peRange.min;
        if (peRange.max !== undefined) peFilter.lte = peRange.max;
        where.pe = peFilter;
      }
    }
  }

  const divRange = parseRangeParam(filters[EtfFilterParamKey.DIVIDEND_TTM]);
  if (divRange) {
    const divFilter: Prisma.FloatNullableFilter = {};
    if (divRange.min !== undefined) divFilter.gte = divRange.min;
    if (divRange.max !== undefined) divFilter.lte = divRange.max;
    where.dividendTtm = divFilter;
  }

  const pf = filters[EtfFilterParamKey.PAYOUT_FREQUENCY];
  if (pf && pf.trim()) {
    where.payoutFrequency = { equals: pf, mode: 'insensitive' };
  }

  const holdingsRange = parseRangeParam(filters[EtfFilterParamKey.HOLDINGS]);
  if (holdingsRange) {
    const holdingsFilter: Prisma.IntNullableFilter = {};
    if (holdingsRange.min !== undefined) holdingsFilter.gte = holdingsRange.min;
    if (holdingsRange.max !== undefined) holdingsFilter.lte = holdingsRange.max;
    where.holdings = holdingsFilter;
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

export function hasEtfFiltersAppliedServer(filters: EtfFilterParams): boolean {
  return ALL_ETF_PARAM_KEYS.some((key) => !!filters[key]?.trim());
}

export function hasAdvancedMorFilters(filters: EtfFilterParams): boolean {
  return ADVANCED_MOR_FILTER_KEYS.some((key) => !!filters[key]?.trim());
}

export function extractCaptureRatioForPeriod(riskPeriods: any, period: MorPeriodKey, columnSubstring: string): number | null {
  const periodData = riskPeriods?.[period];
  if (!periodData) return null;
  const table = periodData?.marketVolatilityMeasures?.captureRatios;
  if (!table?.columns || !table?.rows?.length) return null;

  const col = table.columns.find((c: string) => c.toLowerCase().includes(columnSubstring.toLowerCase()));
  if (!col) return null;

  const firstRow = table.rows[0];
  const raw = firstRow?.values?.[col];
  return parseNumericStringValue(raw);
}

export function extractRiskLevelForPeriod(riskPeriods: any, period: MorPeriodKey): string | null {
  return riskPeriods?.[period]?.portfolioRiskScore?.riskLevel ?? null;
}
