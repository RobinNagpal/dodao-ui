import { DailyTopGainer, DailyTopLoser, TickerV1 } from '@prisma/client';
import { DailyMoverType } from '@/types/daily-mover-constants';

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

/** One other gainer/loser page for the same ticker, shown in a mover page's move history. */
export interface DailyMoverHistoryItem {
  id: string;
  type: DailyMoverType;
  name: string;
  symbol: string;
  title: string | null;
  percentageChange: number;
  /** ISO timestamp the move was recorded. */
  createdAt: string;
}

// Response with related movers
export interface TopGainerWithRelated {
  mover: TopGainerWithTicker;
  relatedMovers: TopGainerWithTicker[];
  /** Other gainer and loser pages for the same ticker, newest first (max 10). */
  tickerMoves: DailyMoverHistoryItem[];
}

export interface TopLoserWithRelated {
  mover: TopLoserWithTicker;
  relatedMovers: TopLoserWithTicker[];
  /** Other gainer and loser pages for the same ticker, newest first (max 10). */
  tickerMoves: DailyMoverHistoryItem[];
}

// Input JSON for daily movers LLM
export interface DailyMoverInputJson {
  name: string;
  symbol: string;
  percentageChange: string;
  /** UTC date (YYYY-MM-DD) the move was recorded, so the model searches for the right trading day. */
  date: string;
}

// LLM Response for daily movers
export interface DailyMoverLLMResponse {
  title: string;
  metaDescription: string;
  oneLineExplanation: string;
  detailedExplanation: string;
}

// Trigger response for daily movers generation endpoints
export interface TriggerDailyMoverResponse {
  message: string;
  status: 'triggered';
  moverType: DailyMoverType;
  callbackUrl: string;
}
