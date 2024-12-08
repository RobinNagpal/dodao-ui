export interface TweetSummary {
  id: string;
  collectionId: string;
  content: string;
  hashtags: string[];
  date: Date;
  lang: string;
  userId: string;
  userDisplayName: string;
  userUsername: string;
  userAvatar: string;
  url: string;
  archive: boolean | null;
}

export interface TweetDto {
  id: string;
  collectionId: string;
  content: string;
  hashtags: string[];
  date: Date;
  lang: string;
  userId: string;
  userDisplayName: string;
  userUsername: string;
  userAvatar: string;
  url: string;
  archive: boolean | null;
}
