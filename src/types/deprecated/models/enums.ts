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

export enum GuideType {
  course = 'course',
  Onboarding = 'Onboarding',
  HowTo = 'How To',
  LevelUp = 'Level Up',
}

export enum GuideCategoryType {
  community = 'community',
  contentwriting = 'contentwriting',
  design = 'design',
  developer = 'developer',
  engineering = 'engineering',
  general = 'general',
  governance = 'governance',
  introduction = 'introduction',
  marketing = 'marketing',
  member = 'member',
  overview = 'overview',
  products = 'products',
  sales = 'sales',
  setup = 'setup',
}

export type StepItemType = InputType | QuestionType | typeof UserDiscordConnectType | string;
