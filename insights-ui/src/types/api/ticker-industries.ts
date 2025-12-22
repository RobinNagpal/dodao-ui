import { SubIndustryWithCount } from '@/types/ticker-typesv1';
import { FavouriteTicker, TickerV1CachedScore, TickerV1Industry, TickerV1Notes, UserTickerTag, UserTickerList } from '@prisma/client';

export interface IndustryWithSubIndustriesAndTopTickers extends TickerV1Industry {
  subIndustries: MinSubIndustryWithTopTickers[];
  tickerCount: number;
}

export interface TickerMinimal {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry: TickerV1CachedScore | null;
  favouriteTicker?: ExpandedFavouriteTicker | null;
  tickerNotes?: TickerV1Notes | null;
}

// Extended FavouriteTicker for industries endpoint (without nested ticker, as ticker data is at parent level)
export interface ExpandedFavouriteTicker extends Omit<FavouriteTicker, 'competitorsConsidered' | 'betterAlternatives' | 'tags' | 'lists'> {
  tags: UserTickerTag[];
  lists: UserTickerList[];
  competitorsConsidered: TickerMinimal[];
  betterAlternatives: TickerMinimal[];
}

export interface MinSubIndustryWithTopTickers extends Omit<SubIndustryWithCount, 'summary'> {
  topTickers: TickerMinimal[];
}

export interface IndustriesResponse {
  industries: IndustryWithSubIndustriesAndTopTickers[];
  filtersApplied: boolean;
}

export interface MinimalTickerWithOnlyFinalScore extends Omit<TickerMinimal, 'cachedScoreEntry'> {
  cachedScoreEntry: {
    finalScore: number;
  } | null;
}

// Define new types for the response
export interface IndustryWithTopTickers extends TickerV1Industry {
  topTickers: MinimalTickerWithOnlyFinalScore[];
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
  hasAnalysis: boolean;
}
