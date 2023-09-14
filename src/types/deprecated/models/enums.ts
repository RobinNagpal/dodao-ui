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

export enum Themes {
  Uniswap = 'Uniswap',
  DoDAO = 'DoDAO',
  Fuse = 'Fuse',
  Compound = 'Compound',
  Aave = 'Aave',
  Balancer = 'Balancer',
  Kleros = 'Kleros',
  Optimism = 'Optimism',
}

export const UserDiscordConnectType = 'UserDiscordConnect';

export const DODAO_ACCESS_TOKEN_KEY = 'DODAO_ACCESS_TOKEN_V1';
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
}

export enum TidbitShareSteps {
  SelectSocial = 'select-social',
  ReviewContents = 'review-contents',
  Preview = 'preview',
}

export enum LocalStorageKeys {
  GUIDE_SUBMISSION = 'GUIDE-SUBMISSION-V2',
  NEAR_PRE_REDIRECT_URL = 'NEAR-PRE-REDIRECT-URL',
}
