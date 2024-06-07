export interface SpaceDiscordModel {
  id: string;
  accessToken: string;
  accessTokenExpiry: number;
  createdAt: number;
  refreshToken: string;
  selectedGuideId?: string;
  spaceId: string;
  updatedAt: number;
}
