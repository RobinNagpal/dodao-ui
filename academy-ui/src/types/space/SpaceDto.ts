import { Space, SpaceIntegration } from '@prisma/client';

export enum SpaceTypes {
  AcademySite = 'ACADEMY_SITE',
  TidbitsSite = 'TidbitsSite',
}

export interface GuideSettingsDto {
  askForLoginToSubmit?: boolean;
  captureRating?: boolean;
  showIncorrectAfterEachStep?: boolean;
  showIncorrectOnCompletion?: boolean;
}

export interface AuthSettingsDto {
  enableLogin?: boolean;
  loginOptions?: string[];
}

export interface SocialSettingsDto {
  linkedSharePdfBackgroundImage?: string;
}

export interface InviteLinksDto {
  discordInviteLink?: string;
  showAnimatedButtonForDiscord?: boolean;
  telegramInviteLink?: string;
  showAnimatedButtonForTelegram?: boolean;
}

export interface UsernameAndName {
  username: string;
  nameOfTheUser: string;
}

export interface SpaceLoadersInfoDto {
  discourseUrl?: string;
  discordServerId?: string;
}

export interface SpaceApiKeyDto {
  creator: string;
  apiKey?: string;
  lastFourLetters: string;
  lastUsed?: any;
}

export interface SpaceIntegrationsDto extends SpaceIntegration {
  academyRepository: string | null;
  discordGuildId: string | null;
  projectGalaxyToken: string | null;
  projectGalaxyTokenLastFour: string | null;
  loadersInfo: SpaceLoadersInfo | null;
  spaceApiKeys: SpaceApiKey[] | null;
}

export interface SpaceWithIntegrationsDto extends Space {
  id: string;
  creator: string;
  features: string[];
  name: string;
  type: string;
  skin: string;
  avatar: string | null;
  domains: string[];
  inviteLinks: InviteLinks | null;
  adminUsernamesV1: UsernameAndName[];
  spaceIntegrations?: SpaceIntegrationsDto;
  authSettings: AuthSettingsDto;
  socialSettings: SocialSettingsDto;
  guideSettings: GuideSettingsDto;
}

export interface SpaceSummaryDto {
  id: string;
  admins: string[];
  adminUsernames: string[];
  avatar?: string;
  creator: string;
  name: string;
  skin: string;
  domains: string[];
  type: string;
}
