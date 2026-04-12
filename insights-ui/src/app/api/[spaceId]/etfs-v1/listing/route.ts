import { prisma } from '@/prisma';
import {
  createEtfFinancialFilter,
  createEtfSearchFilter,
  hasEtfFiltersAppliedServer,
  hasAdvancedMorFilters,
  parseEtfFilterParams,
  parseNumericStringValue,
  parseRangeParam,
  extractCaptureRatioForPeriod,
  extractRiskLevelForPeriod,
  EtfFilterParamKey,
  MOR_ADVANCED_FILTERS,
} from '@/utils/etf-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 32;

export interface EtfListingItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  aum: string | null;
  expenseRatio: number | null;
  pe: number | null;
  sharesOut: string | null;
  dividendTtm: number | null;
  dividendYield: number | null;
  payoutFrequency: string | null;
  holdings: number | null;
  beta: number | null;
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

function toEtfListingItem(etf: any): EtfListingItem {
  return {
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    aum: etf.financialInfo?.aum ?? null,
    expenseRatio: etf.financialInfo?.expenseRatio ?? null,
    pe: etf.financialInfo?.pe ?? null,
    sharesOut: etf.financialInfo?.sharesOut ?? null,
    dividendTtm: etf.financialInfo?.dividendTtm ?? null,
    dividendYield: etf.financialInfo?.dividendYield ?? null,
    payoutFrequency: etf.financialInfo?.payoutFrequency ?? null,
    holdings: etf.financialInfo?.holdings ?? null,
    beta: etf.financialInfo?.beta ?? null,
    hasMorAnalyzerInfo: !!etf.morAnalyzerInfo,
    hasMorRiskInfo: !!etf.morRiskInfo,
    hasMorPeopleInfo: !!etf.morPeopleInfo,
  };
}

const etfListingInclude = {
  financialInfo: true,
  morAnalyzerInfo: { select: { id: true } },
  morRiskInfo: { select: { id: true } },
  morPeopleInfo: { select: { id: true } },
} as const;

const etfListingIncludeWithMorRisk = {
  financialInfo: true,
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

  const financialFilter = createEtfFinancialFilter(filters);
  const hasFinancialFilter = Object.keys(financialFilter).length > 0;

  if (hasFinancialFilter) {
    etfWhere.financialInfo = { is: financialFilter };
  }

  // When advanced Morningstar filters are active, require morRiskInfo to exist
  if (hasMorFilters) {
    etfWhere.morRiskInfo = { isNot: null };
  }

  // Check if we need application-level post-filtering
  const aumRange = parseRangeParam(filters[EtfFilterParamKey.AUM]);
  const sharesOutRange = parseRangeParam(filters[EtfFilterParamKey.SHARES_OUT]);
  const needsPostFilter = aumRange !== null || sharesOutRange !== null || hasMorFilters;

  // Pre-parse active Morningstar advanced filters for post-filtering
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
      orderBy: [{ symbol: 'asc' }],
    });

    const filtered = allEtfs.filter((etf) => {
      if (aumRange) {
        const aumValue = parseNumericStringValue(etf.financialInfo?.aum);
        if (!isInRange(aumValue, aumRange.min, aumRange.max)) return false;
      }
      if (sharesOutRange) {
        const soValue = parseNumericStringValue(etf.financialInfo?.sharesOut);
        if (!isInRange(soValue, sharesOutRange.min, sharesOutRange.max)) return false;
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

  // Fast path: all filters are DB-level, use Prisma skip/take + count
  const [etfs, totalCount] = await Promise.all([
    prisma.etf.findMany({
      where: etfWhere,
      include,
      orderBy: [{ symbol: 'asc' }],
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
