import { analysisTypes, GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { AllExchanges, isExchange } from '@/utils/countryExchangeUtils';
import {
  createCacheFilter,
  createTickerFilter,
  FilterParams,
  isoDateToStartOfDayUtc,
  parseFilterParams,
  type SelectedFiltersMap,
} from '@/utils/ticker-filter-utils';
import { Prisma, TickerAnalysisCategory } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Admin ticker search: the shared stock filters (`ticker-filter-utils`) plus the
 * admin-only narrowing below, paginated. Backs the create-reports and
 * missing-reports screens. The param names double as the keys the screens keep
 * their selection under, so one map round-trips straight into the query string.
 */
export enum TickerSearchParamKey {
  EXCHANGE = 'exchange',
  INDUSTRY_KEY = 'industryKey',
  SUB_INDUSTRY_KEY = 'subIndustryKey',
  /** Comma-separated {@link MissingReportFilterKey}s: match tickers missing ANY of them. */
  MISSING_REPORT_TYPES = 'missingReportTypes',
  /** `true` hides tickers that already have a NotStarted / InProgress generation request. */
  EXCLUDE_PENDING = 'excludePending',
  /** `YYYY-MM-DD`: only tickers whose Business & Moat report is older than this (or absent). */
  BUSINESS_AND_MOAT_BEFORE = 'businessAndMoatBefore',
  /** `YYYY-MM-DD`: only tickers whose Fair Value report is older than this (or absent). */
  FAIR_VALUE_BEFORE = 'fairValueBefore',
  SKIP = 'skip',
  TAKE = 'take',
}

export const TICKER_SEARCH_DEFAULT_TAKE = 50;
export const TICKER_SEARCH_MAX_TAKE = 200;

/** Scraped financial data is not a report type, but the missing-reports screen tracks it alongside them. */
export const FINANCIAL_DATA_FILTER_KEY = 'financial-data';
export type MissingReportFilterKey = ReportType | typeof FINANCIAL_DATA_FILTER_KEY;

export interface MissingReportFilterOption {
  value: MissingReportFilterKey;
  label: string;
}

export const MISSING_REPORT_FILTER_OPTIONS: ReadonlyArray<MissingReportFilterOption> = [
  ...analysisTypes.map(({ key, label }) => ({
    value: key,
    // Regenerating the final summary also rewrites the about text and meta description.
    label: key === ReportType.FINAL_SUMMARY ? 'Final Summary / Meta / About' : label,
  })),
  { value: FINANCIAL_DATA_FILTER_KEY, label: 'Financial Data' },
];

/** Split a comma-separated list into the recognized keys only, in option order. */
export function parseMissingReportTypesParam(raw: string | null | undefined): MissingReportFilterKey[] {
  if (!raw) return [];
  const requested = new Set(raw.split(',').map((v) => v.trim()));
  return MISSING_REPORT_FILTER_OPTIONS.filter((option) => requested.has(option.value)).map((option) => option.value);
}

/** ----- Client-side ----- */

/** Query string for one page of results from a screen's selection map. */
export function buildTickerSearchQuery(selected: SelectedFiltersMap, page: number, pageSize: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(selected)) {
    if (value) params.set(key, value);
  }
  params.set(TickerSearchParamKey.SKIP, String((page - 1) * pageSize));
  params.set(TickerSearchParamKey.TAKE, String(pageSize));
  return params.toString();
}

/** ----- Server-side ----- */

export interface TickerSearchParams {
  filters: FilterParams;
  exchange?: AllExchanges;
  industryKey?: string;
  subIndustryKey?: string;
  missingReportTypes: MissingReportFilterKey[];
  excludePending: boolean;
  businessAndMoatBefore: Date | null;
  fairValueBefore: Date | null;
  skip: number;
  take: number;
}

export function parseTickerSearchParams(req: NextRequest): TickerSearchParams {
  const { searchParams } = req.nextUrl;
  const get = (key: TickerSearchParamKey): string | undefined => searchParams.get(key)?.trim() || undefined;

  const exchangeRaw = get(TickerSearchParamKey.EXCHANGE)?.toUpperCase();
  const skip = Number.parseInt(get(TickerSearchParamKey.SKIP) ?? '0', 10);
  const take = Number.parseInt(get(TickerSearchParamKey.TAKE) ?? String(TICKER_SEARCH_DEFAULT_TAKE), 10);

  return {
    filters: parseFilterParams(req),
    exchange: exchangeRaw && isExchange(exchangeRaw) ? exchangeRaw : undefined,
    industryKey: get(TickerSearchParamKey.INDUSTRY_KEY),
    subIndustryKey: get(TickerSearchParamKey.SUB_INDUSTRY_KEY),
    missingReportTypes: parseMissingReportTypesParam(get(TickerSearchParamKey.MISSING_REPORT_TYPES)),
    excludePending: get(TickerSearchParamKey.EXCLUDE_PENDING) === 'true',
    businessAndMoatBefore: isoDateToStartOfDayUtc(get(TickerSearchParamKey.BUSINESS_AND_MOAT_BEFORE)),
    fairValueBefore: isoDateToStartOfDayUtc(get(TickerSearchParamKey.FAIR_VALUE_BEFORE)),
    skip: Number.isNaN(skip) ? 0 : Math.max(0, skip),
    take: Number.isNaN(take) ? TICKER_SEARCH_DEFAULT_TAKE : Math.min(TICKER_SEARCH_MAX_TAKE, Math.max(1, take)),
  };
}

const noFactorResults = (categoryKey: TickerAnalysisCategory): Prisma.TickerV1WhereInput => ({ factorResults: { none: { categoryKey } } });

const isBlank = (field: 'summary' | 'aboutReport' | 'metaDescription'): Prisma.TickerV1WhereInput[] => [{ [field]: null }, { [field]: '' }];

/**
 * "Report X is missing", as a Prisma condition, for each key the missing-reports
 * screen offers. Mirrors the flags `getReportStatusForTickerIds` computes in SQL.
 */
const MISSING_REPORT_CONDITIONS: Record<MissingReportFilterKey, Prisma.TickerV1WhereInput> = {
  [ReportType.BUSINESS_AND_MOAT]: noFactorResults(TickerAnalysisCategory.BusinessAndMoat),
  [ReportType.FINANCIAL_ANALYSIS]: noFactorResults(TickerAnalysisCategory.FinancialStatementAnalysis),
  [ReportType.PAST_PERFORMANCE]: noFactorResults(TickerAnalysisCategory.PastPerformance),
  [ReportType.FUTURE_GROWTH]: noFactorResults(TickerAnalysisCategory.FutureGrowth),
  [ReportType.FAIR_VALUE]: noFactorResults(TickerAnalysisCategory.FairValue),
  [ReportType.COMPETITION]: { vsCompetition: { is: null } },
  [ReportType.MANAGEMENT_TEAM]: { managementTeamReports: { none: {} } },
  [ReportType.STABILITY]: { stabilityReports: { none: {} } },
  [ReportType.FINAL_SUMMARY]: { OR: [...isBlank('summary'), ...isBlank('aboutReport'), ...isBlank('metaDescription')] },
  [FINANCIAL_DATA_FILTER_KEY]: {
    OR: [{ stockAnalyzerScrapperInfo: { is: null } }, { stockAnalyzerScrapperInfo: { is: { summary: { equals: {} } } } }],
  },
};

/** "Category report is absent or was last updated before `before`." */
const categoryStaleBefore = (categoryKey: TickerAnalysisCategory, before: Date): Prisma.TickerV1WhereInput => ({
  categoryAnalysisResults: { none: { categoryKey, updatedAt: { gte: before } } },
});

export function createTickerSearchWhere(spaceId: string, params: TickerSearchParams): Prisma.TickerV1WhereInput {
  const exchangeFilter: Prisma.TickerV1WhereInput = params.exchange ? { exchange: params.exchange } : {};
  const where = createTickerFilter(spaceId, exchangeFilter, params.filters, createCacheFilter(params.filters));

  // Delisted / migrated tickers are never worth generating reports for.
  where.isDeleted = false;
  where.movedExchange = null;
  where.movedSymbol = null;

  if (params.industryKey) where.industryKey = params.industryKey;
  if (params.subIndustryKey) where.subIndustryKey = params.subIndustryKey;

  if (params.excludePending) {
    where.generationRequests = { none: { status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] } } };
  }

  // `createTickerFilter` may already own the top-level `OR` (search), so the
  // extra conditions nest under `AND`.
  const and: Prisma.TickerV1WhereInput[] = [];
  if (params.missingReportTypes.length > 0) {
    and.push({ OR: params.missingReportTypes.map((key) => MISSING_REPORT_CONDITIONS[key]) });
  }
  if (params.businessAndMoatBefore) and.push(categoryStaleBefore(TickerAnalysisCategory.BusinessAndMoat, params.businessAndMoatBefore));
  if (params.fairValueBefore) and.push(categoryStaleBefore(TickerAnalysisCategory.FairValue, params.fairValueBefore));
  if (and.length > 0) where.AND = and;

  return where;
}
