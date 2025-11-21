import { UserTickerTag, UserTickerList, FavouriteTicker, User, TickerV1, TickerV1CachedScore } from '@prisma/client';
import { FullTickerV1CategoryAnalysisResult } from '@/utils/ticker-v1-model-utils';

// UserTickerTag types
export interface UserTickerTagResponse extends UserTickerTag {}

export interface UserTickerTagsResponse {
  tags: UserTickerTagResponse[];
}

export interface CreateUserTickerTagRequest {
  name: string;
  description?: string;
  colorHex: string;
}

export interface UpdateUserTickerTagRequest {
  name?: string;
  description?: string;
  colorHex?: string;
}

// UserList types
export interface UserListResponse extends UserTickerList {}

export interface UserListsResponse {
  lists: UserListResponse[];
}

export interface CreateUserListRequest {
  name: string;
  description?: string;
}

export interface UpdateUserListRequest {
  name?: string;
  description?: string;
}

// FavouriteTicker types
export interface FavouriteTickerResponse extends Omit<FavouriteTicker, 'tags' | 'lists' | 'ticker' | 'competitorsConsidered' | 'betterAlternatives'> {
  tags: UserTickerTagResponse[];
  lists: UserListResponse[];
  ticker: TickerV1 & {
    cachedScoreEntry?: TickerV1CachedScore | null;
    categoryAnalysisResults?: FullTickerV1CategoryAnalysisResult[];
  };
  competitorsConsidered: Array<
    TickerV1 & {
      cachedScoreEntry?: TickerV1CachedScore | null;
    }
  >;
  betterAlternatives: Array<
    TickerV1 & {
      cachedScoreEntry?: TickerV1CachedScore | null;
    }
  >;
}

export interface FavouriteTickersResponse {
  favouriteTickers: FavouriteTickerResponse[];
}

export interface CreateFavouriteTickerRequest {
  tickerId: string;
  tagIds?: string[];
  listIds?: string[];
  myNotes?: string | null;
  myScore?: number | null;
  competitorsConsidered?: string[];
  betterAlternatives?: string[];
}

export interface UpdateFavouriteTickerRequest {
  tagIds?: string[];
  listIds?: string[];
  myNotes?: string | null;
  myScore?: number | null;
  competitorsConsidered?: string[];
  betterAlternatives?: string[];
}

// Reusable interface for ticker information with basic fields and final score
export interface TickerBasicsWithFinalScore {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  cachedScoreEntry?: {
    finalScore: number;
  } | null;
}
