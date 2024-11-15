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

export interface ByteSettingsDto {
  askForLoginToSubmit: boolean;
  captureBeforeAndAfterRating: boolean; // Deprecated: Use captureRating instead
  captureRating: boolean;
  showCategoriesInSidebar: boolean;
  byteViewMode: string;
}

export interface AuthSettingsDto {
  enableLogin?: boolean;
  loginOptions?: string[];
}

export interface SocialSettingsDto {
  linkedSharePdfBackgroundImage?: string;
}

export interface InviteLinksDto {
  discordInviteLink?: string | null;
  showAnimatedButtonForDiscord?: boolean | null;
  telegramInviteLink?: string | null;
  showAnimatedButtonForTelegram?: boolean | null;
}

export interface UsernameAndNameDto {
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
  discordGuildId: string | null;
  projectGalaxyToken: string | null;
  projectGalaxyTokenLastFour: string | null;
  loadersInfo: SpaceLoadersInfoDto | null;
  spaceApiKeys: SpaceApiKeyDto[];
}

export interface ThemeColorsDto {
  bgColor: string;
  blockBg: string;
  borderColor: string;
  headingColor: string;
  linkColor: string;
  primaryColor: string;
  textColor: string;
}
export interface SpaceWithIntegrationsDto extends Space {
  id: string;
  creator: string;
  features: string[];
  name: string;
  type: string;
  avatar: string | null;
  domains: string[];
  inviteLinks: InviteLinksDto | null;
  adminUsernamesV1: UsernameAndNameDto[];
  spaceIntegrations?: SpaceIntegrationsDto;
  authSettings: AuthSettingsDto;
  socialSettings: SocialSettingsDto;
  guideSettings: GuideSettingsDto;
  themeColors: ThemeColorsDto | null;
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

export interface UpsertSpaceInputDto {
  adminUsernamesV1: UsernameAndNameInputDto[];
  avatar: string;
  creator: string;
  domains: string[];
  features: string[];
  id: string;
  inviteLinks: InviteLinksDto | null;
  name: string;
  spaceIntegrations: SpaceIntegrationsInputDto;
  type: string;
}

export interface UsernameAndNameInputDto {
  nameOfTheUser: string;
  username: string;
}

export interface SpaceInviteLinksInputDto {
  discordInviteLink: string | null;
  showAnimatedButtonForDiscord?: boolean;
  showAnimatedButtonForTelegram?: boolean;
  telegramInviteLink?: string;
}

export interface SpaceGitRepositoryInputDto {
  authenticationToken?: string;
  gitRepoType?: string;
  repoUrl: string;
}

export interface GnosisSafeWalletInputDto {
  id: string;
  chainId: number;
  order: number;
  tokenContractAddress: string;
  walletAddress: string;
  walletName: string;
}

export interface SpaceApiKeyInputDto {
  creator: string;
  apiKey?: string;
  lastFourLetters: string;
  lastUsed?: any;
}

export interface SpaceIntegrationsInputDto {
  academyRepository?: string;
  discordGuildId?: string;
  projectGalaxyTokenLastFour?: string;
  spaceApiKeys: SpaceApiKeyInputDto[] | null;
}
