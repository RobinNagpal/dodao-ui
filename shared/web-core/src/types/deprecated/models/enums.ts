export enum StepItemSubmissionType {
  Question = 'Question',
  UserInput = 'UserInput',
  UserDiscordConnect = 'UserDiscordConnect',
}

export enum MoveCourseItemDirection {
  Up = 'Up',
  Down = 'Down',
}

export enum SpaceFeatures {
  Tasks = 'Tasks',
  Timeline = 'Timeline',
  Docs = 'Docs',
  NanoCourses = 'NanoCourses',
}

export enum PublishStatus {
  Live = 'Live',
  Draft = 'Draft',
}
export enum ProjectTypes {
  All = 'All',
  DeFi = 'DeFi',
  Chains = 'Chains',
  NFT = 'NFT',
  Gaming = 'Gaming',
  Other = 'Other',
}

export const UserDiscordConnectType = 'UserDiscordConnect';

export const DODAO_ACCESS_TOKEN_KEY = `DODAO_ACCESS_TOKEN_V1${process.env.NEXT_PUBLIC_DODAO_ACCESS_TOKEN_KEY_SUFFIX ?? ''}`;
export enum QuestionType {
  SingleChoice = 'SingleChoice',
  MultipleChoice = 'MultipleChoice',
}

export enum InputType {
  PublicShortInput = 'PublicShortInput',
  PrivateShortInput = 'PrivateShortInput',
}

export enum GuideCategoryType {
  community = 'Community',
  contentwriting = 'Contentwriting',
  design = 'Design',
  developer = 'Developer',
  engineering = 'Engineering',
  general = 'General',
  governance = 'Governance',
  introduction = 'Introduction',
  marketing = 'Marketing',
  member = 'Member',
  overview = 'Overview',
  products = 'Products',
  sales = 'Sales',
  setup = 'Setup',
}

export type StepItemType = InputType | QuestionType | typeof UserDiscordConnectType | string;

export enum VisibilityEnum {
  Public = 'Public',
  Hidden = 'Hidden',
}

export enum LoginProviders {
  Discord = 'Discord',
  MetaMask = 'MetaMask',
  Google = 'Google',
  Coinbase = 'Coinbase',
  Near = 'Near',
  Email = 'Email',
}

export enum TidbitShareSteps {
  SelectSocial = 'select-social',
  ReviewContents = 'review-contents',
  Preview = 'preview',
}

export enum LocalStorageKeys {
  GUIDE_SUBMISSION = 'GUIDE-SUBMISSION-V2',
  NEAR_PRE_REDIRECT_URL = 'NEAR-PRE-REDIRECT-URL',
  COMPLETED_TIDBITS = 'COMPLETED-TIDBITS',
  COMPLETED_CLICKABLE_DEMOS = 'COMPLETED_CLICKABLE_DEMOS',
  COMPLETED_SHORT_VIDEO = 'COMPLETED_SHORT_VIDEO',
}
