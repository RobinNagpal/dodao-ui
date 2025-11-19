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
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`industries: `, industries.flatMap((i) => i.subIndustries.flatMap((si) => si.tickers)).length);
  console.log(`spaceId:`, spaceId, `country:`, country, `exchangeFilter:`, exchangeFilter);

  // Get all ticker counts grouped by industry and sub-industry in a single query
  // Use only spaceId and exchangeFilter (country-specific) but exclude user filters
  const tickerCounts = await prisma.tickerV1.groupBy({
    by: ['industryKey', 'subIndustryKey'],
    where: {
      spaceId,
      ...exchangeFilter,
    },
    _count: {
      id: true,
    },
  });
  console.log(`tickerCounts:`, tickerCounts);

  // Create a lookup map for quick access: "industryKey:subIndustryKey" -> count
  const countMap = new Map<string, number>();
  for (const item of tickerCounts) {
    const key = `${item.industryKey}:${item.subIndustryKey}`;
    countMap.set(key, item._count.id);
  }

  // Transform the data to match the expected response format
  const formattedIndustries: IndustryWithSubIndustriesAndTopTickers[] = [];
  const allTopTickers: TickerMinimal[] = [];

  for (const industry of industries) {
    // Skip industries with no sub-industries
    if (!industry.subIndustries.length) continue;

    const formattedSubIndustries: SubIndustryWithTopTickers[] = [];
    let totalTickerCount = 0;

    for (const subIndustry of industry.subIndustries) {
      // Get the count from our pre-computed map (counts for country, no user filters)
      const countKey = `${industry.industryKey}:${subIndustry.subIndustryKey}`;
      const tickerCount = countMap.get(countKey) || 0;

      // Skip sub-industries that have no tickers for this country at all
      if (tickerCount === 0) continue;

      totalTickerCount += tickerCount;

      // Convert tickers to TickerMinimal (these are filtered tickers)
      const topTickers: TickerMinimal[] = subIndustry.tickers;

      // Add to the flattened list (only if there are filtered tickers)
      if (topTickers.length > 0) {
        allTopTickers.push(...topTickers);
      }

      // Add formatted sub-industry (with unfiltered count but filtered top tickers)
      formattedSubIndustries.push({
        ...subIndustry,
        tickerCount, // Total count for country (unfiltered)
        topTickers, // Top 3 filtered tickers (may be empty if filters eliminate all)
      });
    }

    // Skip industries with no tickers for this country
    if (totalTickerCount === 0) continue;

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
