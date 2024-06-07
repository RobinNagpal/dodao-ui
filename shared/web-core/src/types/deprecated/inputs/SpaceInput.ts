export interface SpaceSettingsInput {
  avatar: string;
  about: string;
  admins: string[];
  blockchain: string;
  blogSite: string;
  creator: string;
  categories: string[];
  discordInvite?: string;
  github?: string;
  guidesPageFooterContent?: string;
  guidesPageHeaderContent?: string;
  guidesBundlePageFooterContent?: string;
  guidesBundlePageHeaderContent?: string;
  medium?: string;
  members: string[];
  mission: string;
  network: string;
  publicForumWebsite?: string;
  referenceDocsWebsite?: string;
  skin: string;
  telegramInvite?: string;
  terms: string;
  twitter: string;
  website?: string;
}

export interface SpaceInput {
  from: string;
  space: string;
  timestamp: number;
  settings: SpaceSettingsInput;
}
