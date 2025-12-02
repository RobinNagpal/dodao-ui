import { prisma } from '@/prisma';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { GenerateStockMoversResponse, SavedStock, ScreenerResponse } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import { USExchanges } from '@/utils/countryExchangeUtils';

/**
 * Processes stocks from screener API and saves them to the database
 */
export async function processAndSaveStockMovers(data: ScreenerResponse, spaceId: string, type: DailyMoverType): Promise<GenerateStockMoversResponse> {
  if (!data.stocks || data.stocks.length === 0) {
    return {
      message: 'No stocks found',
      totalFromAPI: 0,
      savedCount: 0,
      savedStocks: [],
      errors: [],
    };
  }

  const usExchanges = Object.values(USExchanges);
  const errors: string[] = [];

  // Get all symbols from the API response
  const symbols = data.stocks.map((stock) => stock.symbol);

  // Find all matching tickers in US exchanges
  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      symbol: {
        in: symbols,
      },
      exchange: {
        in: usExchanges,
      },
    },
  });

  // Create a map for quick lookup
  const tickerMap = new Map(tickers.map((t) => [t.symbol, t]));

  // Prepare data for bulk insert
  const stockMoversData = data.stocks
    .filter((stock) => {
      const ticker = tickerMap.get(stock.symbol);
      if (!ticker) {
        errors.push(`Ticker not found for symbol: ${stock.symbol} in US exchanges`);
        return false;
      }
      return true;
    })
    .map((stock) => {
      const ticker = tickerMap.get(stock.symbol)!;
      const percentageChange = parseFloat(stock.percentChange.replace('%', ''));

      return {
        name: stock.companyName,
        symbol: stock.symbol,
        percentageChange,
        status: GenerationRequestStatus.NotStarted,
        tickerId: ticker.id,
        spaceId,
        createdBy: 'system-cron',
        createdAt: new Date(),
      };
    });

  // Bulk insert based on type
  if (type === DailyMoverType.GAINER) {
    await prisma.dailyTopGainer.createMany({
      data: stockMoversData,
      skipDuplicates: true,
    });
  } else {
    await prisma.dailyTopLoser.createMany({
      data: stockMoversData,
      skipDuplicates: true,
    });
  }

  // Get the saved stocks for the response
  const savedStocks: SavedStock[] = stockMoversData.map((data) => {
    const ticker = tickerMap.get(data.symbol)!;
    return {
      symbol: data.symbol,
      companyName: data.name,
      percentageChange: data.percentageChange,
      exchange: ticker.exchange,
    };
  });

  const typeName = type === DailyMoverType.GAINER ? 'gainers' : 'losers';
  return {
    message: `Top ${typeName} processed successfully`,
    totalFromAPI: data.count,
    savedCount: savedStocks.length,
    savedStocks,
    errors,
  };
}
