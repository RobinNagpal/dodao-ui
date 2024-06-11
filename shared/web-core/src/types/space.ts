export type SpaceWithIntegrationsFragment = {
  id: string;
  creator: string;
  features: Array<string>;
  name: string;
  type: string;
  skin: string;
  avatar?: string | null;
  domains: Array<string>;
  botDomains?: Array<string> | null;
  admins: Array<string>;
  adminUsernames: Array<string>;
  inviteLinks?: {
    discordInviteLink?: string | null;
    showAnimatedButtonForDiscord?: boolean | null;
    telegramInviteLink?: string | null;
    showAnimatedButtonForTelegram?: boolean | null;
  } | null;
  adminUsernamesV1: Array<{
    username: string;
    nameOfTheUser: string;
  }>;
  spaceIntegrations?: {
    academyRepository?: string | null;
    discordGuildId?: string | null;
    projectGalaxyTokenLastFour?: string | null;
    gitGuideRepositories?: Array<{
      authenticationToken?: string | null;
      gitRepoType?: string | null;
      repoUrl: string;
    }> | null;
    gnosisSafeWallets?: Array<{
      id: string;
      chainId: number;
      order: number;
      tokenContractAddress: string;
      walletAddress: string;
      walletName: string;
    }> | null;
    loadersInfo?: {
      discourseUrl?: string | null;
      discordServerId?: string | null;
    } | null;
  } | null;
  authSettings: {
    loginOptions?: Array<string> | null;
    enableLogin?: boolean | null;
  };
  socialSettings: {
    linkedSharePdfBackgroundImage?: string | null;
  };
  guideSettings: {
    askForLoginToSubmit?: boolean | null;
    captureRating?: boolean | null;
    showCategoriesInSidebar?: boolean | null;
    showIncorrectAfterEachStep?: boolean | null;
    showIncorrectOnCompletion?: boolean | null;
  };
  byteSettings: {
    askForLoginToSubmit?: boolean | null;
    captureRating?: boolean | null;
    showCategoriesInSidebar?: boolean | null;
  };
  themeColors?: {
    primaryColor: string;
    bgColor: string;
    textColor: string;
    linkColor: string;
    headingColor: string;
    borderColor: string;
    blockBg: string;
  } | null;
  tidbitsHomepage?: {
    heading: string;
    shortDescription: string;
  } | null;
};
