import { prisma } from '@/prisma';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { USExchanges } from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface StockDatainScreenerResponse {
  symbol: string;
  companyName: string;
  marketCap: string;
  percentChange: string;
}

interface ScreenerResponse {
  filters: {
    marketCapMin: string;
    priceChange1DMin: string;
    limit: number;
  };
  totalMatched: number;
  count: number;
  stocks: StockDatainScreenerResponse[];
  errors: string[];
}

interface SavedStock {
  symbol: string;
  companyName: string;
  percentageChange: number;
  exchange: string;
}

interface GenerateTopGainersResponse {
  message: string;
  totalFromAPI: number;
  savedCount: number;
  savedStocks: SavedStock[];
  errors: string[];
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerateTopGainersResponse> {
  const { spaceId } = await params;

  // Call the screener API
  const screenerResponse = await fetch('https://hjwcr69hjb.execute-api.us-east-1.amazonaws.com/screener', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      marketCapMin: 'Over 1B',
      priceChange1DMin: 'Over 1%',
      limit: 15,
    }),
  });

  if (!screenerResponse.ok) {
    throw new Error(`Screener API failed with status: ${screenerResponse.status}`);
  }

  const data: ScreenerResponse = await screenerResponse.json();

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
  const dailyTopGainersData = data.stocks
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

  // Bulk insert daily top gainers
  const result = await prisma.dailyTopGainer.createMany({
    data: dailyTopGainersData,
    skipDuplicates: true,
  });

  // Get the saved stocks for the response
  const savedStocks: SavedStock[] = dailyTopGainersData.map((data) => {
    const ticker = tickerMap.get(data.symbol)!;
    return {
      symbol: data.symbol,
      companyName: data.name,
      percentageChange: data.percentageChange,
      exchange: ticker.exchange,
    };
  });

  return {
    message: 'Top gainers processed successfully',
    totalFromAPI: data.count,
    savedCount: savedStocks.length,
    savedStocks,
    errors,
  };
}

export const GET = withErrorHandlingV2<GenerateTopGainersResponse>(getHandler);
