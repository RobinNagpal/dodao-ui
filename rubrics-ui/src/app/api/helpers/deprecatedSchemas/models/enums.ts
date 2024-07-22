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

export enum VisibilityEnum {
  Public = 'Public',
  Hidden = 'Hidden',
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

export type StepItemType = InputType | QuestionType | typeof UserDiscordConnectType | string;
