import { IndustryWithSubIndustriesAndCounts, SubIndustryWithCount, type TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { TickerV1CachedScore, TickerV1Industry } from '@prisma/client';

export interface IndustryWithSubIndustriesAndTopTickers extends IndustryWithSubIndustriesAndCounts {
  subIndustries: SubIndustryWithTopTickers[];
}

export interface TickerMinimal {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry: TickerV1CachedScore | null;
}

export interface SubIndustryWithTopTickers extends SubIndustryWithCount {
  topTickers: TickerMinimal[];
}

export interface IndustriesResponse {
  industries: IndustryWithSubIndustriesAndTopTickers[];
  filtersApplied: boolean;
}

export type IndustryStocksDataPayload = {
  tickers: TickerWithIndustryNames[];
  filtersApplied: boolean;
};

// Define new types for the response
export interface IndustryWithTopTickers extends TickerV1Industry {
  topTickers: TickerMinimal[];
  tickerCount: number;
}

export interface OnlyIndustriesResponse {
  industries: IndustryWithTopTickers[];
}

export interface SubIndustryWithAllTickers extends SubIndustryWithCount {
  tickers: TickerMinimal[];
  industryName: string;
}

export interface SubIndustriesResponse extends Omit<TickerV1Industry, 'subIndustries'> {
  subIndustries: SubIndustryWithAllTickers[];
  filtersApplied: boolean;
}
