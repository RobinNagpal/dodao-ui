import { InputType, PublishStatus, QuestionType, StepItemType, UserDiscordConnectType } from '../enums';

export interface ByteStepItem {
  // This is undefined for the old questions. The questions will have to be migrated
  type: StepItemType;
  uuid: string;
}

export interface QuestionChoice {
  content: string;
  key: string;
  order: number;
}

export interface ByteQuestion extends ByteStepItem {
  answerKeys: string[];
  choices: QuestionChoice[];
  content: string;
  explanation: string;
}

export interface UserInput extends ByteStepItem {
  label: string;
  required: boolean;
}

export type UserDiscordConnect = ByteStepItem;

export interface ByteStep {
  content: string;
  uuid: string;
  name: string;
  stepItems: (ByteQuestion | UserInput | UserDiscordConnect)[];
}

export interface ByteModel {
  id: string;
  content: string;
  created: string;
  name: string;
  publishStatus: PublishStatus;
  steps: ByteStep[];
  admins: string[];
  tags: string[];
  priority: number;
}

export type ByteWithoutSteps = Omit<ByteModel, 'steps'>;

export const isQuestion = (item: { type: string }) => item.type === QuestionType.MultipleChoice || item.type === QuestionType.SingleChoice;

export const isUserInput = (item: { type: string }) => item.type === InputType.PublicShortInput || item.type === InputType.PrivateShortInput;

export const isUserDiscordConnect = (item: { type: string }) => item.type === UserDiscordConnectType;
