import { prisma } from '@/prisma';
import { IndustryWithTopTickers, OnlyIndustriesResponse, TickerMinimal } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, SupportedCountries } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; country: string }> }): Promise<OnlyIndustriesResponse> {
  const { spaceId, country: countryParam } = await context.params;

  // Create the exchange filter clause for the country
  const exchangeFilter = getExchangeFilterClause(SupportedCountries.US);

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
    ...exchangeFilter,
  };
  // Create ticker filter

  // Get all industries with their sub-industries
  const industries = await prisma.tickerV1Industry.findMany({
    include: {
      subIndustries: {
        include: {
          // Include tickers for each sub-industry with filtering and ordering
          tickers: {
            where: whereClause,
            select: {
              id: true,
              name: true,
              symbol: true,
              exchange: true,
              cachedScoreEntry: true,
            },
            orderBy: [{ cachedScoreEntry: { finalScore: 'desc' } }, { name: 'asc' }, { symbol: 'asc' }],
          },
          // Get count of all tickers in this sub-industry
          _count: {
            select: {
              tickers: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Transform the data to match the expected response format
  const formattedIndustries: IndustryWithTopTickers[] = [];

  for (const industry of industries) {
    // Skip industries with no sub-industries or no tickers
    if (!industry.subIndustries.length) continue;

    let industryHasTickers = false;
    let totalTickerCount = 0;
    const allIndustryTickers: TickerMinimal[] = [];

    // Collect all tickers from all sub-industries
    for (const subIndustry of industry.subIndustries) {
      // Skip sub-industries with no tickers
      if (!subIndustry.tickers.length) continue;

      industryHasTickers = true;
      const tickerCount = (subIndustry as any)._count.tickers;
      totalTickerCount += tickerCount;

      // Convert tickers to TickerMinimal with industry and subindustry names
      const tickers: TickerMinimal[] = subIndustry.tickers.map((t) => ({
        ...t,
        industryName: industry.name,
        subIndustryName: subIndustry.name,
      }));

      // Add to the industry tickers list
      allIndustryTickers.push(...tickers);
    }

    // Skip industries with no tickers
    if (!industryHasTickers) continue;

    // Sort all tickers by score (desc), then name (asc), then symbol (asc)
    allIndustryTickers.sort((a, b) => {
      const scoreA = a.cachedScoreEntry?.finalScore ?? 0;
      const scoreB = b.cachedScoreEntry?.finalScore ?? 0;

      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Sort by score descending
      }

      if (a.name !== b.name) {
        return a.name.localeCompare(b.name); // Sort by name ascending
      }

      return a.symbol.localeCompare(b.symbol); // Sort by symbol ascending
    });

    // Take only the top 3 tickers for each industry
    const topTickers = allIndustryTickers.slice(0, 3);

    // Add formatted industry with top tickers
    formattedIndustries.push({
      ...industry,
      topTickers,
      tickerCount: totalTickerCount,
    });
  }

  return {
    industries: formattedIndustries,
  };
}

export const GET = withErrorHandlingV2<OnlyIndustriesResponse>(getHandler);
