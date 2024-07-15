import { PublishStatus, StepItemType } from './enums';

// These don't follow the naming convention as we used the type in url
export enum GuideType {
  Course = 'course',
  Onboarding = 'onboarding',
  HowTo = 'how-to',
  LevelUp = 'level-up',
}

export enum GuideSource {
  Database = 'Database',
  Git = 'Git',
  Academy = 'Academy',
}

export const GuideTypesArray = [GuideType.Course, GuideType.Onboarding, GuideType.HowTo, GuideType.LevelUp];

export interface GuideStepItem {
  // This is undefined for the old questions. The questions will have to be migrated
  type: StepItemType;
  order: number;
  uuid: string;
}

export interface QuestionChoice {
  content: string;
  key: string;
  order: number;
}

export interface GuideQuestion extends GuideStepItem {
  answerKeys: string[];
  choices: QuestionChoice[];
  content: string;
  explanation?: string;
}

export interface UserInput extends GuideStepItem {
  label: string;
  required: boolean;
}

export type UserDiscordConnect = GuideStepItem;

export interface GuideStep {
  content: string;
  created: number;
  id?: string;
  name: string;
  order: number;
  stepItems: (GuideQuestion | UserInput | UserDiscordConnect)[];
  uuid: string;
}

export interface GuideIntegrations {
  discordRoleIds: string[];
  // number of answers that should be correct in order to get discord score
  discordRolePassingCount?: number | null;
  discordWebhook?: string | null;
  projectGalaxyCredentialId?: string | null;
  projectGalaxyOatMintUrl?: string | null;
  projectGalaxyOatPassingCount?: number | null;
}

export interface GuideModel {
  id: string;
  authors: string[];
  categories: string[];
  content: string;
  created: number;
  createdAt: Date;
  guideIntegrations: GuideIntegrations;
  guideType: GuideType;
  guideSource: GuideSource;
  link: string;
  name: string;
  postSubmissionStepContent?: string;
  previousId: string | null;
  publishStatus: PublishStatus;
  socialShareImage?: string;
  steps: GuideStep[];
  thumbnail?: string;
  timestamp?: number;
  uuid: string;
  version: number;
}

export interface GudieInBundleModel extends GuideModel {
  order: number;
}

export type GuideWithoutSteps = Omit<GuideModel, 'steps'>;
