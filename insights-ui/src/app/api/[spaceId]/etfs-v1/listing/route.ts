import { prisma } from '@/prisma';
import { ETF_OTHERS_GROUP_KEY } from '@/utils/etf-categorization-utils';
import {
  createEtfFinancialFilter,
  createEtfStockAnalyzerFilter,
  createEtfSearchFilter,
  createEtfCachedScoreFilter,
  createEtfFutureReturnsFilter,
  hasEtfFiltersAppliedServer,
  hasAdvancedMorFilters,
  parseEtfFilterParams,
  parseNumericStringValue,
  parseRangeParam,
  parseNumericFilterValue,
  matchesNumericCriteria,
  extractCaptureRatioForPeriod,
  extractRiskLevelForPeriod,
  getAppliedEtfSort,
  buildEtfDbOrderBy,
  EtfFilterParamKey,
  EtfSortField,
  MOR_ADVANCED_FILTERS,
} from '@/utils/etf-filter-utils';
import { shouldIncludeUnpopulatedForRequest } from '@/utils/etf-listing-visibility';
import { getEtfExchangesByCountry, isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 32;

export interface EtfListingItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  inception: string | null;
  aum: string | null;
  expenseRatio: number | null;
  pe: number | null;
  sharesOut: string | null;
  dividendTtm: number | null;
  dividendYield: number | null;
  payoutFrequency: string | null;
  holdings: number | null;
  beta: number | null;
  finalScore: number | null;
  category: string | null;
  hasMorAnalyzerInfo: boolean;
  hasMorRiskInfo: boolean;
  hasMorPeopleInfo: boolean;
}

export interface EtfListingResponse {
  etfs: EtfListingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filtersApplied: boolean;
}

function isInRange(value: number | null, min?: number, max?: number): boolean {
  if (value === null) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

// AUM is stored as a formatted string ("$1.2B"), so numeric ordering happens in
// app code. Nulls sort last; ties break on symbol to keep ordering stable.
function compareByParsedAum(a: any, b: any, order: 'asc' | 'desc'): number {
  const av = parseNumericStringValue(a.financialInfo?.aum);
  const bv = parseNumericStringValue(b.financialInfo?.aum);
  if (av === null && bv === null) return a.symbol.localeCompare(b.symbol);
  if (av === null) return 1;
  if (bv === null) return -1;
  if (av !== bv) return order === 'asc' ? av - bv : bv - av;
  return a.symbol.localeCompare(b.symbol);
}

function toEtfListingItem(etf: any): EtfListingItem {
  return {
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    inception: etf.inception ?? null,
    aum: etf.financialInfo?.aum ?? null,
    expenseRatio: etf.financialInfo?.expenseRatio ?? null,
    pe: etf.financialInfo?.pe ?? null,
    sharesOut: etf.financialInfo?.sharesOut ?? null,
    dividendTtm: etf.financialInfo?.dividendTtm ?? null,
    dividendYield: etf.financialInfo?.dividendYield ?? null,
    payoutFrequency: etf.financialInfo?.payoutFrequency ?? null,
    holdings: etf.financialInfo?.holdings ?? null,
    beta: etf.financialInfo?.beta ?? null,
    finalScore: etf.cachedScore?.finalScore ?? null,
    category: etf.stockAnalyzerInfo?.category ?? null,
    hasMorAnalyzerInfo: !!etf.morAnalyzerInfo,
    hasMorRiskInfo: !!etf.morRiskInfo,
    hasMorPeopleInfo: !!etf.morPeopleInfo,
  };
}

const etfListingInclude = {
  financialInfo: true,
  cachedScore: { select: { finalScore: true } },
  stockAnalyzerInfo: { select: { category: true } },
  morAnalyzerInfo: { select: { id: true } },
  morRiskInfo: { select: { id: true } },
  morPeopleInfo: { select: { id: true } },
} as const;

const etfListingIncludeWithMorRisk = {
  financialInfo: true,
  cachedScore: { select: { finalScore: true } },
  stockAnalyzerInfo: { select: { category: true } },
  morAnalyzerInfo: { select: { id: true } },
  morRiskInfo: true,
  morPeopleInfo: { select: { id: true } },
} as const;

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));

  const filters = parseEtfFilterParams(req);
  const filtersApplied = hasEtfFiltersAppliedServer(filters);
  const hasMorFilters = hasAdvancedMorFilters(filters);

  const etfWhere = createEtfSearchFilter(spaceId, filters);

  // Country is a route-level filter (mapped to an exchange list); not part of the
  // user-facing filter chips so it lives outside the ALL_ETF_PARAM_KEYS set.
  const countryParam = searchParams.get('country')?.trim();
  if (countryParam && isEtfSupportedCountry(countryParam)) {
    const exchanges = getEtfExchangesByCountry(countryParam);
    if (exchanges.length > 0) {
      etfWhere.exchange = { in: exchanges };
    }
  }

  const financialFilter = createEtfFinancialFilter(filters);
  const hasFinancialFilter = Object.keys(financialFilter).length > 0;

  if (hasFinancialFilter) {
    etfWhere.financialInfo = { is: financialFilter };
  }

  const cachedScoreFilter = createEtfCachedScoreFilter(filters);
  const hasCachedScoreFilter = Object.keys(cachedScoreFilter).length > 0;
  if (hasCachedScoreFilter) {
    // A score filter (`{ is: ... }`) already requires the row to exist, so it
    // implicitly restricts to populated ETFs.
    etfWhere.cachedScore = { is: cachedScoreFilter };
  } else if (!(await shouldIncludeUnpopulatedForRequest(req))) {
    // Default: only list ETFs that have a generated report (an EtfCachedScore
    // row). Admins requesting includeUnpopulated=true bypass this and see all.
    etfWhere.cachedScore = { isNot: null };
  }

  const futureReturnsFilter = createEtfFutureReturnsFilter(filters);
  if (Object.keys(futureReturnsFilter).length > 0) {
    etfWhere.futureReturns = { is: futureReturnsFilter };
  }

  const stockAnalyzerFilter = createEtfStockAnalyzerFilter(filters);
  const hasStockAnalyzerFilter = Object.keys(stockAnalyzerFilter).length > 0;
  const isOthersGroup = filters[EtfFilterParamKey.GROUP]?.trim() === ETF_OTHERS_GROUP_KEY;
  if (isOthersGroup) {
    // "Others" must also pick up ETFs that have no EtfStockAnalyzerInfo row at
    // all. createEtfStockAnalyzerFilter has already set category: null for the
    // case where a row exists; OR that with `is: null` for the no-row case.
    // Wrapped in AND so it composes with any etfWhere.OR set by the search
    // filter, which would otherwise be overwritten.
    const othersOr: Prisma.EtfWhereInput[] = [{ stockAnalyzerInfo: { is: null } }, { stockAnalyzerInfo: { is: stockAnalyzerFilter } }];
    const existingAnd = Array.isArray(etfWhere.AND) ? etfWhere.AND : etfWhere.AND ? [etfWhere.AND] : [];
    etfWhere.AND = [...existingAnd, { OR: othersOr }];
  } else if (hasStockAnalyzerFilter) {
    etfWhere.stockAnalyzerInfo = { is: stockAnalyzerFilter };
  }

  // When advanced Mor filters are active, require morRiskInfo to exist
  if (hasMorFilters) {
    etfWhere.morRiskInfo = { isNot: null };
  }

  const sort = getAppliedEtfSort(searchParams);
  const dbOrderBy = buildEtfDbOrderBy(sort);
  const needsAppSort = sort?.field === EtfSortField.AUM;

  // Check if we need application-level post-filtering / sorting. AUM is a
  // formatted string column, so its numeric filter is evaluated in app code.
  const aumCriteria = parseNumericFilterValue(filters[EtfFilterParamKey.AUM]);
  const needsPostFilter = aumCriteria !== null || hasMorFilters || needsAppSort;

  // Pre-parse active Mor advanced filters for post-filtering
  const activeMorFilters = MOR_ADVANCED_FILTERS.map((def) => ({
    ...def,
    raw: filters[def.paramKey]?.trim() || null,
    range: def.kind !== 'risk' ? parseRangeParam(filters[def.paramKey]) : null,
  })).filter((f) => f.raw);

  const include = hasMorFilters ? etfListingIncludeWithMorRisk : etfListingInclude;

  if (needsPostFilter) {
    const allEtfs = await prisma.etf.findMany({
      where: etfWhere,
      include,
      orderBy: dbOrderBy,
    });

    const filtered = allEtfs.filter((etf) => {
      if (aumCriteria) {
        const aumValue = parseNumericStringValue(etf.financialInfo?.aum);
        if (!matchesNumericCriteria(aumValue, aumCriteria)) return false;
      }
      const riskPeriods = (etf as any).morRiskInfo?.riskPeriods;
      for (const mf of activeMorFilters) {
        if (mf.kind === 'upside' && mf.range) {
          const val = extractCaptureRatioForPeriod(riskPeriods, mf.period, 'upside');
          if (!isInRange(val, mf.range.min, mf.range.max)) return false;
        } else if (mf.kind === 'downside' && mf.range) {
          const val = extractCaptureRatioForPeriod(riskPeriods, mf.period, 'downside');
          if (!isInRange(val, mf.range.min, mf.range.max)) return false;
        } else if (mf.kind === 'risk' && mf.raw) {
          const level = extractRiskLevelForPeriod(riskPeriods, mf.period);
          if (!level || level.toLowerCase() !== mf.raw.toLowerCase()) return false;
        }
      }
      return true;
    });

    if (needsAppSort && sort) {
      filtered.sort((a, b) => compareByParsedAum(a, b, sort.order));
    }

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const pageSlice = filtered.slice(start, start + pageSize);

    return {
      etfs: pageSlice.map(toEtfListingItem),
      totalCount,
      page,
      pageSize,
      totalPages,
      filtersApplied,
    };
  }

  // Fast path: all filters are DB-level, use Prisma skip/take + count for performance
  const [etfs, totalCount] = await Promise.all([
    prisma.etf.findMany({
      where: etfWhere,
      include,
      orderBy: dbOrderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.etf.count({ where: etfWhere }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    etfs: etfs.map(toEtfListingItem),
    totalCount,
    page,
    pageSize,
    totalPages,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<EtfListingResponse>(getHandler);
