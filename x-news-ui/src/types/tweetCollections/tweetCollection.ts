import { TweetSummary } from '../tweets/tweet';

export interface TweetCollectionSummary {
  id: string;
  name: string;
  description: string;
  handles: string[];
  tweets?: TweetSummary[];
  archive: boolean | null;
}

export interface TweetCollectionDto {
  id: string;
  name: string;
  description: string;
  archive?: boolean;
  handles: string[];
}
