import { prisma } from '@/prisma';
import { SubIndustriesResponse, SubIndustryWithAllTickers, TickerMinimal } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { createCacheFilter, createTickerFilter, hasFiltersAppliedServer, parseFilterParams } from '@/utils/ticker-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { TickerV1CachedScore } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; country: string; industryKey: string; profileId: string }> }
): Promise<SubIndustriesResponse> {
  const { spaceId, country: countryParam, industryKey, profileId } = await context.params;
  const country = toSupportedCountry(countryParam);

  // Get userId from profileId
  const profile = await prisma.portfolioManagerProfile.findUniqueOrThrow({
    where: { id: profileId },
    select: { userId: true },
  });

  const userId = profile.userId;

  // Parse filter parameters
  const filters = parseFilterParams(req);

  // Create the exchange filter clause for the country
  const exchangeFilter = getExchangeFilterClause(country);

  // Create cached score filter
  const cacheFilter = createCacheFilter(filters);

  // Create ticker filter
  const tickerFilter = createTickerFilter(spaceId, exchangeFilter, filters, cacheFilter);

  // Get all sub-industries with their tickers for the specified industry
  const subIndustries = await prisma.tickerV1SubIndustry.findMany({
    where: {
      industryKey,
    },
    include: {
      industry: true,
      // Include all tickers for each sub-industry with filtering and ordering
      // The where clause filters by country exchanges, so tickers.length gives us the country-specific count
      tickers: {
        where: tickerFilter,
        include: {
          cachedScoreEntry: true,
          // Include user-specific data with full relations
          favouriteTickers: {
            where: { userId },
            take: 1,
            include: {
              tags: true,
              lists: true,
            },
          },
          tickerNotes: {
            where: { userId },
            take: 1,
          },
        },
        orderBy: [{ cachedScoreEntry: { finalScore: 'desc' } }, { name: 'asc' }, { symbol: 'asc' }],
      },
    },
    orderBy: [{ industryKey: 'asc' }, { name: 'asc' }],
  });

  // Transform the data to match the expected response format
  const formattedSubIndustries: SubIndustryWithAllTickers[] = [];

  for (const subIndustry of subIndustries) {
    // Skip sub-industries with no tickers (after filters)
    if (!subIndustry.tickers.length) continue;

    const tickerCount = subIndustry.tickers.length; // Use filtered tickers count (country-specific)

    // Convert tickers to include industry and sub-industry names, plus user data
    const tickersWithNames: TickerMinimal[] = await Promise.all(
      subIndustry.tickers.map(async (t) => {
        const favouriteTicker = t.favouriteTickers?.[0] || null;

        // If there's a favourite ticker with competitors or alternatives, fetch those ticker details
        let competitorsConsidered: Array<{
          id: string;
          symbol: string;
          name: string;
          exchange: string;
          cachedScoreEntry: TickerV1CachedScore | null;
        }> = [];
        let betterAlternatives: Array<{
          id: string;
          symbol: string;
          name: string;
          exchange: string;
          cachedScoreEntry: TickerV1CachedScore | null;
        }> = [];

        if (favouriteTicker) {
          if (favouriteTicker.competitorsConsidered?.length > 0) {
            const competitors = await prisma.tickerV1.findMany({
              where: {
                id: { in: favouriteTicker.competitorsConsidered },
              },
              select: {
                id: true,
                symbol: true,
                name: true,
                exchange: true,
                cachedScoreEntry: true,
              },
            });
            competitorsConsidered = competitors;
          }

          if (favouriteTicker.betterAlternatives?.length > 0) {
            const alternatives = await prisma.tickerV1.findMany({
              where: {
                id: { in: favouriteTicker.betterAlternatives },
              },
              select: {
                id: true,
                symbol: true,
                name: true,
                exchange: true,
                cachedScoreEntry: true,
              },
            });
            betterAlternatives = alternatives;
          }
        }

        return {
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          exchange: t.exchange,
          cachedScoreEntry: t.cachedScoreEntry,
          favouriteTicker: favouriteTicker
            ? {
                ...favouriteTicker,
                competitorsConsidered,
                betterAlternatives,
              }
            : null,
          tickerNotes: t.tickerNotes?.[0] || null,
        };
      })
    );

    // Add formatted sub-industry
    formattedSubIndustries.push({
      ...subIndustry,
      industryName: subIndustry.industry.name,
      tickerCount,
      tickers: tickersWithNames,
    });
  }

  // Check if any filters are applied
  const filtersApplied = hasFiltersAppliedServer(cacheFilter, filters);
  const industry = await prisma.tickerV1Industry.findUniqueOrThrow({
    where: {
      industryKey,
    },
    include: {
      _count: {
        select: {
          industryAnalyses: true,
        },
      },
    },
  });

  return {
    ...industry,
    subIndustries: formattedSubIndustries,
    filtersApplied,
    hasAnalysis: industry._count.industryAnalyses > 0,
  };
}

export const GET = withErrorHandlingV2<SubIndustriesResponse>(getHandler);
