import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Interface for filter parameters
 */
export interface FilterParams {
  businessandmoatThreshold?: string;
  financialstatementanalysisThreshold?: string;
  pastperformanceThreshold?: string;
  futuregrowthThreshold?: string;
  fairvalueThreshold?: string;
  totalthreshold?: string;
  search?: string;
}

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
    businessandmoatThreshold: searchParams.get('businessandmoatThreshold') || undefined,
    financialstatementanalysisThreshold: searchParams.get('financialstatementanalysisThreshold') || undefined,
    pastperformanceThreshold: searchParams.get('pastperformanceThreshold') || undefined,
    futuregrowthThreshold: searchParams.get('futuregrowthThreshold') || undefined,
    fairvalueThreshold: searchParams.get('fairvalueThreshold') || undefined,
    totalthreshold: searchParams.get('totalThreshold') || undefined,
    search: searchParams.get('search') || undefined,
  };
}

/**
 * Create a cache filter for score thresholds
 */
export function createCacheFilter(filters: FilterParams): Prisma.TickerV1CachedScoreWhereInput {
  const cacheFilter: Prisma.TickerV1CachedScoreWhereInput = {};
  const bm = toInt(filters.businessandmoatThreshold);
  const fsa = toInt(filters.financialstatementanalysisThreshold);
  const pp = toInt(filters.pastperformanceThreshold);
  const fg = toInt(filters.futuregrowthThreshold);
  const fv = toInt(filters.fairvalueThreshold);
  const total = toInt(filters.totalthreshold);

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
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
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

  return tickerFilter;
}

/**
 * Check if any filters are applied
 */
export function hasFiltersApplied(country: string | undefined, cacheFilter: Prisma.TickerV1CachedScoreWhereInput, filters: FilterParams): boolean {
  const hasScoreFilters = Object.keys(cacheFilter).length > 0;
  const hasSearchFilter = !!(filters.search && filters.search.trim());

  return !!country || hasScoreFilters || hasSearchFilter;
}
