export interface CreateTweetCollectionRequest {
  name: string;
  description: string;
  handles: string[];
  archive: boolean | null;
}
