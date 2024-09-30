import { Space } from "@prisma/client";

export interface CreateSpaceRequest {
  spaceData: Space,
  userId: string,
}

export interface CreateSpaceParams {
  id: string,
  name: string,
  creator: string,
  avatar?: string | null,
  adminUsernamesV1: UsernameAndName[],
  domains: string[],
  authSettings: AuthSettings,
  type: string,
  // features: string[],
  // themeColors?: ThemeColors | null,
  // verified: boolean,
  // createdAt: Date,
  // updatedAt: Date,
  // admins: string[],
  // adminUsernames: string[],
  // inviteLinks?: InviteLinks | null,
  // skin: string,
  // discordInvite?: string | null,
  // telegramInvite?: string | null,
  // botDomains: string[],
  // guideSettings?: GuideSettings,
  // socialSettings?: SocialSettings,
  // byteSettings?: ByteSettings,
  // tidbitsHomepage?: TidbitsHomepage | null,
}

export interface UsernameAndName {
  __typename?: 'UsernameAndName';
  nameOfTheUser: string;
  username: string;
}
  
export interface AuthSettings {
  __typename?: 'AuthSettings',
  enableLogin?: boolean | null,
  loginOptions?: string[] | null
}

export interface InviteLinks {
  discordInviteLink?: string | null,
  showAnimatedButtonForDiscord?: boolean | null,
  showAnimatedButtonForTelegram?: boolean | null,
  telegramInviteLink?: string | null,
}

export interface GuideSettings {
  __typename?: 'GuideSettings';
  askForLoginToSubmit?: boolean | null,
  /** @deprecated Use captureRating instead */
  captureBeforeAndAfterRating?: boolean | null,
  captureRating?: boolean | null,
  showCategoriesInSidebar?: boolean | null,
  showIncorrectAfterEachStep?: boolean | null,
  showIncorrectOnCompletion?: boolean | null,
}

export interface SocialSettings {
  __typename?: 'SocialSettings';
  linkedSharePdfBackgroundImage?: string | null;
}

export interface ByteSettings {
  __typename?: 'ByteSettings';
  askForLoginToSubmit?: boolean | null;
  /** @deprecated Use captureRating instead */
  captureBeforeAndAfterRating?: boolean | null;
  captureRating?: boolean | null;
  showCategoriesInSidebar?: boolean | null;
}

export interface TidbitsHomepage {
  __typename?: 'TidbitsHomepage';
  heading: string;
  shortDescription: string;
}

export interface ThemeColors {
  __typename?: 'ThemeColors';
  bgColor: string;
  blockBg: string;
  borderColor: string;
  headingColor: string;
  linkColor: string;
  primaryColor: string;
  textColor: string;
}
