import 'server-only';
import { prisma } from '@/prisma';
import { IndustryWithTopTickers, MinimalTickerWithOnlyFinalScore, OnlyIndustriesResponse } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, SupportedCountries } from '@/utils/countryExchangeUtils';
import { Prisma } from '@prisma/client';

/**
 * Source-of-truth query for the "Explore Industries & Top US Companies" home-page showcase.
 *
 * This is a first-party Prisma read, so Server Components (and the `/api/.../only-industries`
 * route) call it directly instead of going through an HTTP self-fetch. The previous self-fetch
 * resolved to the public canonical origin (https://koalagains.com) during `next build`; once that
 * origin moved behind CloudFront→AWS, the build could receive an HTML error/redirect page instead
 * of JSON, which crashed `res.json()` and aborted the static export of "/". Reading the DB directly
 * removes the base-URL / CDN / cross-deployment dependency entirely.
 */
export async function getTopIndustriesWithTickers(spaceId: string, country: SupportedCountries): Promise<OnlyIndustriesResponse> {
  // Create the exchange filter clause for the country
  const exchangeFilter = getExchangeFilterClause(country);

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
    ...exchangeFilter,
  };

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
              cachedScoreEntry: {
                select: {
                  finalScore: true,
                },
              },
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
    const allIndustryTickers: MinimalTickerWithOnlyFinalScore[] = [];

    // Collect all tickers from all sub-industries
    for (const subIndustry of industry.subIndustries) {
      // Skip sub-industries with no tickers
      if (!subIndustry.tickers.length) continue;

      industryHasTickers = true;
      const tickerCount = (subIndustry as any)._count.tickers;
      totalTickerCount += tickerCount;

      // Convert tickers to TickerMinimal with industry and subindustry names
      const tickers: MinimalTickerWithOnlyFinalScore[] = subIndustry.tickers.map((t) => ({
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
