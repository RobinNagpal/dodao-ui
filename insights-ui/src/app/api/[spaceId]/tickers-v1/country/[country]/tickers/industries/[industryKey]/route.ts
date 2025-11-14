import { prisma } from '@/prisma';
import { SubIndustriesResponse, SubIndustryWithAllTickers, TickerMinimal } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { createCacheFilter, createTickerFilter, hasFiltersApplied, parseFilterParams } from '@/utils/ticker-filter-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; country: string; industryKey: string }> }
): Promise<SubIndustriesResponse> {
  const { spaceId, country: countryParam, industryKey } = await context.params;
  const country = toSupportedCountry(countryParam);

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
      tickers: {
        where: tickerFilter,
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
          tickers: true, // ✅ must be boolean; filtered counts aren't supported here
        },
      },
    },
    orderBy: [{ industryKey: 'asc' }, { name: 'asc' }],
  });

  // Transform the data to match the expected response format
  const formattedSubIndustries: SubIndustryWithAllTickers[] = [];

  for (const subIndustry of subIndustries) {
    // Skip sub-industries with no tickers (after filters)
    if (!subIndustry.tickers.length) continue;

    const tickerCount = subIndustry._count.tickers; // ✅ strongly typed now

    // Convert tickers to include industry and sub-industry names
    const tickersWithNames: TickerMinimal[] = subIndustry.tickers.map((t) => ({
      ...t,
    }));

    // Add formatted sub-industry
    formattedSubIndustries.push({
      ...subIndustry,
      industryName: subIndustry.industry.name,
      tickerCount,
      tickers: tickersWithNames,
    });
  }

  // Check if any filters are applied
  const filtersApplied = hasFiltersApplied(country, cacheFilter, filters);
  const industry = await prisma.tickerV1Industry.findUniqueOrThrow({
    where: {
      industryKey,
    },
  });

  return {
    ...industry,
    subIndustries: formattedSubIndustries,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<SubIndustriesResponse>(getHandler);
