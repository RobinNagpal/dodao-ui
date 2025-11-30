import { DailyTopGainer, DailyTopLoser, TickerV1 } from '@prisma/client';

// Common types for both gainers and losers
export interface StockDataInScreenerResponse {
  symbol: string;
  companyName: string;
  marketCap: string;
  percentChange: string;
}

export interface ScreenerResponse {
  filters: Record<string, any>;
  totalMatched: number;
  count: number;
  stocks: StockDataInScreenerResponse[];
  errors: string[];
}

export interface SavedStock {
  symbol: string;
  companyName: string;
  percentageChange: number;
  exchange: string;
}

export interface GenerateStockMoversResponse {
  message: string;
  totalFromAPI: number;
  savedCount: number;
  savedStocks: SavedStock[];
  errors: string[];
}

// Type-specific interfaces with ticker relation
export interface TopGainerWithTicker extends DailyTopGainer {
  ticker: TickerV1;
}

export interface TopLoserWithTicker extends DailyTopLoser {
  ticker: TickerV1;
}
