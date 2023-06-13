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

export const UserDiscordConnectType = 'UserDiscordConnect';

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
