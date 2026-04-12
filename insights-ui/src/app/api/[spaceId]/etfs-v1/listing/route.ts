import { prisma } from '@/prisma';
import {
  createEtfFinancialFilter,
  createEtfSearchFilter,
  hasEtfFiltersAppliedServer,
  parseEtfFilterParams,
  parseNumericStringValue,
  EtfFilterParamKey,
} from '@/utils/etf-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const DEFAULT_PAGE_SIZE = 25;

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
}

export interface EtfListingResponse {
  etfs: EtfListingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filtersApplied: boolean;
}

function parseRangeParam(param: string | undefined): { min?: number; max?: number } | null {
  if (!param || !param.trim()) return null;
  const [minStr, maxStr] = param.split('-');
  const min = minStr ? parseFloat(minStr) : undefined;
  const max = maxStr ? parseFloat(maxStr) : undefined;
  if (min === undefined && max === undefined) return null;
  return { min, max };
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
  };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfListingResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)));

  const filters = parseEtfFilterParams(req);
  const filtersApplied = hasEtfFiltersAppliedServer(filters);

  // Build Prisma where clause for Etf (search)
  const etfWhere = createEtfSearchFilter(spaceId, filters);

  // Build Prisma where clause for EtfFinancialInfo (float fields)
  const financialFilter = createEtfFinancialFilter(filters);
  const hasFinancialFilter = Object.keys(financialFilter).length > 0;

  if (hasFinancialFilter) {
    etfWhere.financialInfo = { is: financialFilter };
  }

  // Check if we need application-level post-filtering (string numeric fields)
  const aumRange = parseRangeParam(filters[EtfFilterParamKey.AUM]);
  const sharesOutRange = parseRangeParam(filters[EtfFilterParamKey.SHARES_OUT]);
  const needsPostFilter = aumRange !== null || sharesOutRange !== null;

  if (needsPostFilter) {
    // When post-filtering is needed, fetch all DB-matching records,
    // apply string-field filters in memory, then paginate the result.
    const allEtfs = await prisma.etf.findMany({
      where: etfWhere,
      include: { financialInfo: true },
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
      include: { financialInfo: true },
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
