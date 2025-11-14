import { prisma } from '@/prisma';
import { IndustriesResponse, IndustryWithSubIndustriesAndTopTickers, SubIndustryWithTopTickers, TickerMinimal } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { createCacheFilter, createTickerFilter, hasFiltersAppliedServer, parseFilterParams } from '@/utils/ticker-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; country: string }> }): Promise<IndustriesResponse> {
  const { spaceId, country: countryParam } = await context.params;
  const country = toSupportedCountry(countryParam);

  // Parse filter parameters
  const filters = parseFilterParams(req);

  // Create the exchange filter clause for the country
  const exchangeFilter = getExchangeFilterClause(country);

  // Create cached score filter
  const cacheFilter = createCacheFilter(filters);

  // Create ticker filter
  const tickerFilter = createTickerFilter(spaceId, exchangeFilter, filters, cacheFilter);

  // Get all industries with their sub-industries
  const industries = await prisma.tickerV1Industry.findMany({
    include: {
      subIndustries: {
        include: {
          // Include tickers for each sub-industry with filtering and ordering
          tickers: {
            where: tickerFilter,
            // we only need minimal fields, no relation data
            select: {
              id: true,
              name: true,
              symbol: true,
              exchange: true,
              cachedScoreEntry: true,
            },
            orderBy: [
              // order by related cachedScoreEntry even if we don't select it
              { cachedScoreEntry: { finalScore: 'desc' } },
              { name: 'asc' },
              { symbol: 'asc' },
            ],
            take: 3,
          },
          // Get count of all tickers in this sub-industry (unfiltered)
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

  console.log(`industries: `, industries.flatMap((i) => i.subIndustries.flatMap((si) => si.tickers)).length);

  // Transform the data to match the expected response format
  const formattedIndustries: IndustryWithSubIndustriesAndTopTickers[] = [];
  const allTopTickers: TickerMinimal[] = [];

  for (const industry of industries) {
    // Skip industries with no sub-industries or no tickers
    if (!industry.subIndustries.length) continue;

    let industryHasTickers = false;
    const formattedSubIndustries: SubIndustryWithTopTickers[] = [];
    let totalTickerCount = 0;

    for (const subIndustry of industry.subIndustries) {
      // Skip sub-industries with no tickers
      if (!subIndustry.tickers.length) continue;

      industryHasTickers = true;
      const tickerCount = subIndustry._count.tickers;
      totalTickerCount += tickerCount;

      // Convert tickers to TickerMinimal with industry/sub-industry names
      const topTickers: TickerMinimal[] = subIndustry.tickers;

      // Add to the flattened list
      allTopTickers.push(...topTickers);

      // Add formatted sub-industry
      formattedSubIndustries.push({
        ...subIndustry,
        tickerCount,
        topTickers,
      });
    }

    // Skip industries with no tickers
    if (!industryHasTickers) continue;

    // Sort sub-industries by name
    formattedSubIndustries.sort((a, b) => a.name.localeCompare(b.name));

    // Add formatted industry
    formattedIndustries.push({
      ...industry,
      subIndustries: formattedSubIndustries,
      tickerCount: totalTickerCount,
    });
  }

  // Check if any filters are applied
  const filtersApplied = hasFiltersAppliedServer(cacheFilter, filters);

  return {
    industries: formattedIndustries,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<IndustriesResponse>(getHandler);
