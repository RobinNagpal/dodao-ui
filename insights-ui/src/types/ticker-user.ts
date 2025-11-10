import { UserTickerTag, UserTickerList, FavouriteTicker, User, TickerV1 } from '@prisma/client';

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
export interface FavouriteTickerResponse extends Omit<FavouriteTicker, 'tags' | 'lists' | 'ticker'> {
  tags: UserTickerTagResponse[];
  lists: UserListResponse[];
  ticker: TickerV1;
}

export interface FavouriteTickersResponse {
  favouriteTickers: FavouriteTickerResponse[];
}

export interface CreateFavouriteTickerRequest {
  tickerId: string;
  tagIds?: string[];
  listIds?: string[];
  myNotes?: string;
  myScore?: number;
}

export interface UpdateFavouriteTickerRequest {
  tagIds?: string[];
  listIds?: string[];
  myNotes?: string;
  myScore?: number;
}
