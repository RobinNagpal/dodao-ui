import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory, EvaluationResult } from '@prisma/client';

interface FilteredTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScore: number;
  spaceId: string;
  categoryScores: {
    [key in TickerAnalysisCategory]?: number;
  };
  totalScore: number;
}

interface FilterParams {
  businessandmoatThreshold?: string;
  financialstatementanalysisThreshold?: string;
  pastperformanceThreshold?: string;
  futuregrowthThreshold?: string;
  fairvalueThreshold?: string;
  totalthreshold?: string;
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
  };

  // Fetch all tickers with their analysis data
  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
    },
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
        websiteUrl: ticker.websiteUrl,
        summary: ticker.summary,
        cachedScore: ticker.cachedScore,
        spaceId: ticker.spaceId,
        categoryScores,
        totalScore,
      });
    }
  }

  return filteredTickers;
}

export const GET = withErrorHandlingV2<FilteredTicker[]>(getHandler);
