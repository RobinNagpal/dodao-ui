import { prisma } from '@/prisma';
import { SubIndustriesResponse, SubIndustryWithAllTickers, TickerMinimal } from '@/types/api/ticker-industries';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { createCacheFilter, createTickerFilter, hasFiltersAppliedServer, parseFilterParams } from '@/utils/ticker-filter-utils';
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
      // The where clause filters by country exchanges, so tickers.length gives us the country-specific count
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
    },
    orderBy: [{ industryKey: 'asc' }, { name: 'asc' }],
  });

  // Transform the data to match the expected response format
  const formattedSubIndustries: SubIndustryWithAllTickers[] = [];

  for (const subIndustry of subIndustries) {
    // Skip sub-industries with no tickers (after filters)
    if (!subIndustry.tickers.length) continue;

    const tickerCount = subIndustry.tickers.length; // Use filtered tickers count (country-specific)

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
  const filtersApplied = hasFiltersAppliedServer(cacheFilter, filters);
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
