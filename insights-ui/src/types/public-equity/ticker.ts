export interface Ticker {
  tickerKey: string;
  createdAt: Date;
  updatedAt: Date;
  sector: string;
  industryGroup: string;
}

// ✅ Request type for creating a ticker
export interface CreateTickerRequest {
  tickerKey: string;
  sector: string;
  industryGroup: string;
}

// ✅ Response type for API
export interface TickerResponse {
  success: boolean;
  message?: string;
  ticker?: Ticker;
  error?: string;
}

export interface AllTickersResponse {
  success: boolean;
  tickers?: Ticker[];
  error?: string;
}
