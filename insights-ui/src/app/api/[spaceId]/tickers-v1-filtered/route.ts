import { prisma } from '@/prisma';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { getCountryFilterClause } from '@/utils/countryUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerAnalysisCategory } from '@prisma/client';
import { NextRequest } from 'next/server';

interface FilterParams {
  businessandmoatThreshold?: string;
  financialstatementanalysisThreshold?: string;
  pastperformanceThreshold?: string;
  futuregrowthThreshold?: string;
  fairvalueThreshold?: string;
  totalthreshold?: string;
  country?: string;
  industry?: string;
  search?: string;
}

function toInt(v?: string) {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerWithIndustryNames[]> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);

  // Parse filter parameters
  const filters: FilterParams = {
    businessandmoatThreshold: searchParams.get('businessandmoatThreshold') || undefined,
    financialstatementanalysisThreshold: searchParams.get('financialstatementanalysisThreshold') || undefined,
    pastperformanceThreshold: searchParams.get('pastperformanceThreshold') || undefined,
    futuregrowthThreshold: searchParams.get('futuregrowthThreshold') || undefined,
    fairvalueThreshold: searchParams.get('fairvalueThreshold') || undefined,
    totalthreshold: searchParams.get('totalThreshold') || undefined,
    country: searchParams.get('country') || undefined,
    industry: searchParams.get('industry') || undefined,
    search: searchParams.get('search') || undefined,
  };

  // Base where clause
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
  };

  // Country filter
  Object.assign(whereClause, getCountryFilterClause(filters.country));

  // Industry filter
  if (filters.industry) {
    (whereClause as Prisma.TickerV1WhereInput).subIndustryKey = filters.industry;
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    whereClause.OR = [
      { symbol: { equals: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { symbol: { startsWith: searchTerm.toUpperCase(), mode: 'insensitive' } },
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      { symbol: { contains: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // --- NEW: push score thresholds into DB using TickerV1CachedScore relation ---
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

  if (Object.keys(cacheFilter).length > 0) {
    // Ensure we only return tickers whose cached scores exist and meet thresholds
    (whereClause as Prisma.TickerV1WhereInput).cachedScoreEntry = { is: cacheFilter };
  }

  // Fetch tickers with cached score joined (no heavy factor includes)
  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    include: {
      cachedScoreEntry: true, // <- use cached table
      industry: true,
      subIndustry: true,
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  const filteredTickers: TickerWithIndustryNames[] = tickers.map((ticker) => {
    const cached = ticker.cachedScoreEntry;

    const categoryScores: { [key in TickerAnalysisCategory]?: number } = {
      [TickerAnalysisCategory.BusinessAndMoat]: cached?.businessAndMoatScore ?? 0,
      [TickerAnalysisCategory.FinancialStatementAnalysis]: cached?.financialStatementAnalysisScore ?? 0,
      [TickerAnalysisCategory.PastPerformance]: cached?.pastPerformanceScore ?? 0,
      [TickerAnalysisCategory.FutureGrowth]: cached?.futureGrowthScore ?? 0,
      [TickerAnalysisCategory.FairValue]: cached?.fairValueScore ?? 0,
    };

    const totalScore = cached?.finalScore ?? 0;

    return {
      ...ticker,
      industryName: ticker.industry.name,
      subIndustryName: ticker.subIndustry.name,
      categoryScores,
      totalScore,
    };
  });

  // Keep the search-priority sort behavior when search is present
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    filteredTickers.sort((a, b) => {
      const searchUpper = searchTerm.toUpperCase();
      const searchLower = searchTerm.toLowerCase();

      const aSymbolExact = a.symbol.toUpperCase() === searchUpper;
      const bSymbolExact = b.symbol.toUpperCase() === searchUpper;
      if (aSymbolExact !== bSymbolExact) return aSymbolExact ? -1 : 1;

      const aSymbolStarts = a.symbol.toUpperCase().startsWith(searchUpper);
      const bSymbolStarts = b.symbol.toUpperCase().startsWith(searchUpper);
      if (aSymbolStarts !== bSymbolStarts) return aSymbolStarts ? -1 : 1;

      if (aSymbolStarts && bSymbolStarts && a.symbol.length !== b.symbol.length) {
        return a.symbol.length - b.symbol.length;
      }

      const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
      const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aNameStarts !== bNameStarts) return aNameStarts ? -1 : 1;

      return a.symbol.localeCompare(b.symbol);
    });
  }

  return filteredTickers;
}

export const GET = withErrorHandlingV2<TickerWithIndustryNames[]>(getHandler);
