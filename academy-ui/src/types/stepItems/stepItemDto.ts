import { InputType, QuestionType } from '@dodao/web-core/types/deprecated/models/enums';

export interface QuestionChoice {
  content: string;
  key: string;
}

export interface Question {
  content: string;
  answerKeys: Array<string>;
  type: QuestionType;
  uuid: string;
  explanation: string;
  choices: Array<QuestionChoice>;
  order?: number;
}

export interface UserInput {
  label: string;
  required: boolean;
  type: InputType;
  uuid: string;
  order?: number;
}

export interface UserDiscordConnect {
  type: string;
  uuid: string;
}

export type ByteStepItem = Question | UserInput | UserDiscordConnect;
