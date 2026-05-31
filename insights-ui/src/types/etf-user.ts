import { Etf, EtfCachedScore, FavouriteEtf } from '@prisma/client';

// FavouriteEtf types
// The base Prisma `FavouriteEtf` type only carries scalar columns (relations
// are not included), so we extend it directly and add the hydrated `etf`
// relation that the GET/POST handlers include.
export interface FavouriteEtfResponse extends FavouriteEtf {
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
