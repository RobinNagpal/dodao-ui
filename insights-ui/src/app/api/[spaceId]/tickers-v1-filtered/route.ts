import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory, EvaluationResult, Prisma } from '@prisma/client';
import { getIndustryMappings, getIndustryName, getSubIndustryName } from '@/lib/industryMappingUtils';
import { FilteredTicker } from '@/types/ticker-typesv1';
import { getCountryFilterClause } from '@/utils/countryUtils';

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

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<FilteredTicker[]> {
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

  // Build the where clause for database query
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
  };

  // Add country filter using utility function
  const countryFilter = getCountryFilterClause(filters.country);
  Object.assign(whereClause, countryFilter);

  // Add industry filter if provided
  if (filters.industry) {
    whereClause.subIndustryKey = filters.industry;
  }

  // Add search filter if provided (consistent with search API logic)
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    whereClause.OR = [
      // Exact symbol match (highest priority)
      {
        symbol: {
          equals: searchTerm.toUpperCase(),
          mode: 'insensitive',
        },
      },
      // Symbol starts with search term (high priority)
      {
        symbol: {
          startsWith: searchTerm.toUpperCase(),
          mode: 'insensitive',
        },
      },
      // Company name starts with search term (medium priority)
      {
        name: {
          startsWith: searchTerm,
          mode: 'insensitive',
        },
      },
      // Partial symbol match (lower priority)
      {
        symbol: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      // Company name contains search term (lowest priority)
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Fetch all tickers with their analysis data
  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: true,
        },
      },
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  // Calculate category scores and filter tickers
  const filteredTickers: FilteredTicker[] = [];

  // Get industry and sub-industry mappings
  const mappings = await getIndustryMappings();

  for (const ticker of tickers) {
    const categoryScores: { [key in TickerAnalysisCategory]?: number } = {};

    // Calculate scores for each category
    const categories = Object.values(TickerAnalysisCategory);
    for (const category of categories) {
      const categoryResult = ticker.categoryAnalysisResults.find((result) => result.categoryKey === category);

      if (categoryResult) {
        // Count passed factors in this category
        const passedCount = categoryResult.factorResults.filter((factor) => factor.result === EvaluationResult.Pass).length;

        categoryScores[category] = passedCount;
      } else {
        categoryScores[category] = 0;
      }
    }

    // Calculate total score
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);

    // Apply filters
    let passesFilters = true;

    // Category-specific filters
    if (filters.businessandmoatThreshold) {
      const threshold = parseInt(filters.businessandmoatThreshold);
      if ((categoryScores[TickerAnalysisCategory.BusinessAndMoat] || 0) < threshold) {
        passesFilters = false;
      }
    }

    if (filters.financialstatementanalysisThreshold) {
      const threshold = parseInt(filters.financialstatementanalysisThreshold);
      if ((categoryScores[TickerAnalysisCategory.FinancialStatementAnalysis] || 0) < threshold) {
        passesFilters = false;
      }
    }

    if (filters.pastperformanceThreshold) {
      const threshold = parseInt(filters.pastperformanceThreshold);
      if ((categoryScores[TickerAnalysisCategory.PastPerformance] || 0) < threshold) {
        passesFilters = false;
      }
    }

    if (filters.futuregrowthThreshold) {
      const threshold = parseInt(filters.futuregrowthThreshold);
      if ((categoryScores[TickerAnalysisCategory.FutureGrowth] || 0) < threshold) {
        passesFilters = false;
      }
    }

    if (filters.fairvalueThreshold) {
      const threshold = parseInt(filters.fairvalueThreshold);
      if ((categoryScores[TickerAnalysisCategory.FairValue] || 0) < threshold) {
        passesFilters = false;
      }
    }

    // Total score filter
    if (filters.totalthreshold) {
      const threshold = parseInt(filters.totalthreshold);
      if (totalScore < threshold) {
        passesFilters = false;
      }
    }

    if (passesFilters) {
      filteredTickers.push({
        id: ticker.id,
        name: ticker.name,
        symbol: ticker.symbol,
        exchange: ticker.exchange,
        industryKey: ticker.industryKey,
        subIndustryKey: ticker.subIndustryKey,
        industryName: getIndustryName(ticker.industryKey, mappings),
        subIndustryName: getSubIndustryName(ticker.subIndustryKey, mappings),
        websiteUrl: ticker.websiteUrl,
        summary: ticker.summary,
        cachedScore: ticker.cachedScore,
        spaceId: ticker.spaceId,
        categoryScores,
        totalScore,
      });
    }
  }

  // If search is applied, sort results with search priority (consistent with search API)
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    filteredTickers.sort((a, b) => {
      const searchUpper = searchTerm.toUpperCase();
      const searchLower = searchTerm.toLowerCase();

      // Priority 1: Exact symbol match
      const aSymbolExact = a.symbol.toUpperCase() === searchUpper;
      const bSymbolExact = b.symbol.toUpperCase() === searchUpper;
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      // Priority 2: Symbol starts with search term
      const aSymbolStarts = a.symbol.toUpperCase().startsWith(searchUpper);
      const bSymbolStarts = b.symbol.toUpperCase().startsWith(searchUpper);
      if (aSymbolStarts && !bSymbolStarts) return -1;
      if (!aSymbolStarts && bSymbolStarts) return 1;

      // If both symbols start with search term, prefer shorter symbols
      if (aSymbolStarts && bSymbolStarts) {
        if (a.symbol.length !== b.symbol.length) {
          return a.symbol.length - b.symbol.length;
        }
      }

      // Priority 3: Company name starts with search term
      const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
      const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      // Priority 4: Higher total score
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      // Priority 5: Alphabetical by symbol
      return a.symbol.localeCompare(b.symbol);
    });
  }

  return filteredTickers;
}

export const GET = withErrorHandlingV2<FilteredTicker[]>(getHandler);
