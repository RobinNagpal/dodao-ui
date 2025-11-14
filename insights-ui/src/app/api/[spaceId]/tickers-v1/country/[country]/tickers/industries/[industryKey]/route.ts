import { prisma } from '@/prisma';
import {
  IndustryWithSubIndustriesAndCounts,
  SubIndustryWithCount,
  TickerWithIndustryNames, // ⬅️ use the extended ticker type
} from '@/types/ticker-typesv1';
import { getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { createCacheFilter, createTickerFilter, hasFiltersApplied, parseFilterParams } from '@/utils/ticker-filter-utils';

interface SubIndustryWithAllTickers extends SubIndustryWithCount {
  tickers: TickerV1[];
  industryName: string;
}

interface SubIndustriesResponse {
  subIndustries: SubIndustryWithAllTickers[];
  filtersApplied: boolean;
}

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
        include: {
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
    const tickersWithNames: TickerV1[] = subIndustry.tickers.map((t) => ({
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

  return {
    subIndustries: formattedSubIndustries,
    filtersApplied,
  };
}

export const GET = withErrorHandlingV2<SubIndustriesResponse>(getHandler);
