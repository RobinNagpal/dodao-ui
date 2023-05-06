import { SpaceIntegrationModel } from './SpaceIntegrationModel';

export interface SpaceModel {
  id: string;
  about?: string;
  admins: string[];
  avatar?: string;
  blogSite?: string;
  blockchain: string;
  categories: string[];
  creator: string;
  discordInvite?: string;
  features: string[];
  github?: string;
  guidesPageFooterContent?: string;
  guidesPageHeaderContent?: string;
  guidesBundlePageFooterContent?: string;
  guidesBundlePageHeaderContent?: string;
  inviteLinks?: SpaceInviteLinks;
  courseAdmins?: string[];
  members: string[];
  mission: string;
  name: string;
  network: string;
  publicForumWebsite?: string;
  referenceDocsWebsite?: string;
  skin: string;
  spaceIntegrations?: Omit<SpaceIntegrationModel, 'projectGalaxyToken'>;
  terms?: string;
  telegramInvite?: string;
  twitter?: string;
}

export interface SpaceInviteLinks {
  discordInviteLink?: string | null;
  showAnimatedButtonForDiscord?: boolean | null;
  showAnimatedButtonForTelegram?: boolean | null;
  telegramInviteLink?: string | null;
}
