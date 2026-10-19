import type { FinancialInfoOptionalWrapper } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import type { PriceHistoryWrapper } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import type { QuarterlyChartDataWrapper } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/quarterly-chart-data/route';
import { prisma } from '@/prisma';
import {
  IndustriesResponse,
  IndustryWithSubIndustriesAndTopTickers,
  MinSubIndustryWithTopTickers,
  SubIndustriesResponse,
  SubIndustryWithAllTickers,
  TickerMinimal,
} from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { StockFundamentalsSummary } from '@/types/prismaTypes';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import { EXCHANGE_TO_COUNTRY, getExchangeFilterClause, isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import { ensurePriceHistoryIsFresh } from '@/utils/price-history-utils';
import { ensureStockAnalyzerDataIsFresh } from '@/utils/stock-analyzer-scraper-utils';
import { createCacheFilter, createTickerFilter, FilterParams, hasFiltersAppliedServer } from '@/utils/ticker-filter-utils';
import { buildFinancialInfoFromSummary, buildPriceHistoryFromPriceInfo, buildQuarterlyChartFromScraperInfo } from '@/utils/ticker-full-render-utils';
import { getCompetitorTickers, SimilarTicker, tickerV1IncludeWithRelations, TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { Prisma } from '@prisma/client';

/**
 * Data loaders shared by the `tickers-v1` GET API routes AND the `/stocks/*` Server Components.
 *
 * Each function is the body of one GET route, moved here so the route stays a thin HTTP wrapper and
 * the page can call it in-process instead of `fetch()`ing its own API over the public host (see
 * `src/utils/ssr-data-cache.ts` for why, and for the cache-semantics mapping the pages use).
 */

/* ------------------------------------------------------------------ */
/*  Ticker row (+ missing-report info)                                 */
/* ------------------------------------------------------------------ */

/**
 * `GET /api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]` (when `exchange` is given) and
 * `GET /api/[spaceId]/tickers-v1/[ticker]` (any exchange, when `exchange` is null).
 * With `allowNull` a missing ticker returns null; otherwise it throws (Prisma P2025).
 */
export async function getTickerV1WithMissingReports(
  spaceId: string,
  exchange: string | null,
  ticker: string,
  allowNull: boolean
): Promise<TickerV1FastResponse | null> {
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
    ...(exchange ? { exchange: exchange.toUpperCase() } : {}),
  };

  const tickerRecord = allowNull
    ? await prisma.tickerV1.findFirst({ where: whereClause, include: tickerV1IncludeWithRelations })
    : await prisma.tickerV1.findFirstOrThrow({ where: whereClause, include: tickerV1IncludeWithRelations });

  if (!tickerRecord) {
    return null;
  }

  const missingReports = await getMissingReportsForTicker(spaceId, tickerRecord.id);
  if (!missingReports) {
    throw new Error(`Failed to get missing reports for ticker ${ticker}`);
  }

  return { ...tickerRecord, ...missingReports };
}

/* ------------------------------------------------------------------ */
/*  Main-page slices: financial info, quarterly chart, price history   */
/* ------------------------------------------------------------------ */

/** `GET .../exchange/[exchange]/[ticker]/financial-info`. Never throws; failures resolve to `{ financialInfo: null }`. */
export async function getTickerFinancialInfo(spaceId: string, exchange: string, ticker: string): Promise<FinancialInfoOptionalWrapper> {
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();
  if (!t || !e) {
    return { financialInfo: null };
  }

  try {
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: { spaceId, symbol: t, exchange: e },
      include: { stockAnalyzerScrapperInfo: true },
    });

    // Ensure stock analyzer data is fresh (will fetch summary if older than 7 days)
    const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);
    const financialInfo = buildFinancialInfoFromSummary(scraperInfo.summary as StockFundamentalsSummary, tickerRecord.symbol);
    if (!financialInfo) {
      console.error(`No summary data available for ticker ${t}`);
    }
    return { financialInfo };
  } catch (error) {
    console.error(`Error fetching financial info for ${t}:`, error);
    return { financialInfo: null };
  }
}

/** `GET .../exchange/[exchange]/[ticker]/quarterly-chart-data`. Never throws; failures resolve to `{ chartData: null }`. */
export async function getTickerQuarterlyChartData(spaceId: string, exchange: string, ticker: string): Promise<QuarterlyChartDataWrapper> {
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();
  if (!t || !e) {
    return { chartData: null };
  }

  try {
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: { spaceId, symbol: t, exchange: e },
      include: { stockAnalyzerScrapperInfo: true },
    });

    const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);
    // Quarterly income statement first, annual as the fallback.
    return { chartData: buildQuarterlyChartFromScraperInfo(scraperInfo) };
  } catch (error) {
    console.error(`Error fetching quarterly chart data for ${t}:`, error);
    return { chartData: null };
  }
}

/** `GET .../exchange/[exchange]/[ticker]/price-history`. Never throws; failures resolve to `{ priceHistory: null }`. */
export async function getTickerPriceHistory(spaceId: string, exchange: string, ticker: string): Promise<PriceHistoryWrapper> {
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();
  if (!t || !e) {
    return { priceHistory: null };
  }

  try {
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: { spaceId, symbol: t, exchange: e },
    });

    const priceInfo = await ensurePriceHistoryIsFresh(tickerRecord);
    return { priceHistory: buildPriceHistoryFromPriceInfo(priceInfo, tickerRecord.symbol) };
  } catch (error) {
    console.error(`Error fetching price history for ${t}:`, error);
    return { priceHistory: null };
  }
}

/* ------------------------------------------------------------------ */
/*  Competition + similar tickers                                      */
/* ------------------------------------------------------------------ */

/**
 * `GET .../exchange/[exchange]/[ticker]/competition-tickers` (when `exchange` is given) and
 * `GET .../tickers-v1/[ticker]/competition-tickers` (any exchange, when `exchange` is null).
 * A missing ticker resolves to `{ vsCompetition: null, competitorTickers: [], ticker: undefined }`.
 */
export async function getTickerCompetition(spaceId: string, exchange: string | null, ticker: string): Promise<CompetitionResponse> {
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
    ...(exchange ? { exchange: exchange.toUpperCase() } : {}),
  };

  const tickerRecord = await prisma.tickerV1.findFirst({
    where: whereClause,
    include: {
      vsCompetition: true,
      industry: true,
      subIndustry: true,
      cachedScoreEntry: true,
    },
  });

  if (!tickerRecord) {
    return { vsCompetition: null, competitorTickers: [], ticker: undefined };
  }

  const competitorTickers = await getCompetitorTickers(tickerRecord);

  return {
    vsCompetition: tickerRecord.vsCompetition || null,
    competitorTickers,
    ticker: tickerRecord,
  };
}

/** `GET .../exchange/[exchange]/[ticker]/similar-tickers`. Throws (Prisma P2025) when the ticker doesn't exist. */
export async function getSimilarTickers(spaceId: string, exchange: string, ticker: string): Promise<SimilarTicker[]> {
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  return prisma.tickerV1.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      // Delisted tickers serve a 404 on every one of their pages, so linking to
      // them from the "Top Similar Companies" widget only feeds crawlers dead URLs.
      isDeleted: false,
      id: {
        not: tickerRecord.id, // Exclude current ticker
      },
    },
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
    orderBy: {
      cachedScoreEntry: {
        finalScore: 'desc',
      },
    },
    take: 3,
  });
}

/* ------------------------------------------------------------------ */
/*  Listing pages: country → industries, country → industry → stocks   */
/* ------------------------------------------------------------------ */

/** `GET /api/[spaceId]/tickers-v1/country/[country]/tickers/industries`. */
export async function getCountryIndustriesWithTopTickers(
  spaceId: string,
  country: SupportedCountries | undefined,
  filters: FilterParams
): Promise<IndustriesResponse> {
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
        select: {
          // only the fields you actually want from TickerV1SubIndustry
          industryKey: true,
          subIndustryKey: true,
          name: true,
          archived: true, // optional, remove if you don't need it

          // relation: you can still nest the tickers selection here
          tickers: {
            where: tickerFilter,
            select: {
              id: true,
              name: true,
              symbol: true,
              exchange: true,
              cachedScoreEntry: true,
              financialInfo: {
                select: {
                  marketCap: true,
                  pe: true,
                },
              },
            },
            orderBy: [{ cachedScoreEntry: { finalScore: 'desc' } }, { name: 'asc' }, { symbol: 'asc' }],
            take: 3,
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

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

  // Create a lookup map for quick access: "industryKey:subIndustryKey" -> count
  const countMap = new Map<string, number>();
  for (const item of tickerCounts) {
    const key = `${item.industryKey}:${item.subIndustryKey}`;
    countMap.set(key, item._count.id);
  }

  // Transform the data to match the expected response format
  const formattedIndustries: IndustryWithSubIndustriesAndTopTickers[] = [];

  for (const industry of industries) {
    // Skip industries with no sub-industries
    if (!industry.subIndustries.length) continue;

    const formattedSubIndustries: MinSubIndustryWithTopTickers[] = [];
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

/** `GET /api/[spaceId]/tickers-v1/country/[country]/tickers/industries/[industryKey]`. Null when the industry doesn't exist. */
export async function getCountryIndustryStocks(
  spaceId: string,
  country: SupportedCountries | undefined,
  industryKey: string,
  filters: FilterParams
): Promise<SubIndustriesResponse | null> {
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
          financialInfo: {
            select: {
              marketCap: true,
              pe: true,
            },
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
  const industry = await prisma.tickerV1Industry.findUnique({
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

  // Return null if industry not found (UI handles gracefully)
  if (!industry) {
    return null;
  }

  // Countries with at least one ticker in this industry (same rule as the sitemap and the empty-listing
  // 404), so the "Also view" country switcher only links to populated industry pages.
  const exchangesWithStocks = await prisma.tickerV1.findMany({
    where: { spaceId, industryKey },
    select: { exchange: true },
    distinct: ['exchange'],
  });
  const countriesWithStocks = Array.from(
    new Set(
      exchangesWithStocks
        .map((t) => t.exchange)
        .filter(isExchange)
        .map((e) => EXCHANGE_TO_COUNTRY[e])
    )
  );

  return {
    ...industry,
    subIndustries: formattedSubIndustries,
    filtersApplied,
    hasAnalysis: industry._count.industryAnalyses > 0,
    countriesWithStocks,
  };
}
