import { Etf, EtfCachedScore, FavouriteEtf } from '@prisma/client';

// FavouriteEtf types
export interface FavouriteEtfResponse extends Omit<FavouriteEtf, 'etf'> {
  etf: Etf & {
    cachedScore?: EtfCachedScore | null;
  };
}

export interface FavouriteEtfsResponse {
  favouriteEtfs: FavouriteEtfResponse[];
}

export interface CreateFavouriteEtfRequest {
  etfId: string;
  myNotes?: string | null;
  myScore?: number | null;
}

export interface UpdateFavouriteEtfRequest {
  myNotes?: string | null;
  myScore?: number | null;
}
