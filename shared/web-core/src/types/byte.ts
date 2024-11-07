export interface Byte {
  admins: string[];
  byteStyle?: string;
  completionScreen?: CompletionScreen | null;
  content: string;
  created: string;
  id: string;
  name: string;
  postSubmissionStepContent?: string;
  priority: number;
  showIncorrectOnCompletion?: boolean;
  steps: ByteStep[];
  tags: string[];
  videoAspectRatio?: string | null;
  videoUrl?: string | null;
}

export interface CompletionScreen {
  content: string;
  imageUrl?: string | null;
  items: CompletionScreenItem[];
  name: string;
  uuid: string;
}

export interface CompletionScreenItem {
  label: string;
  link: string;
  uuid: string;
}

export interface ByteStep {
  content: string;
  displayMode?: string | null;
  imageUrl?: string | null;
  name: string;
  stepItems: Array<ByteStepItem>;
  uuid: string;
}

export type ByteStepItem = ByteQuestion | ByteUserInput | UserDiscordConnect;

export interface ByteQuestion {
  answerKeys: string[];
  choices: QuestionChoice[];
  content: string;
  explanation: string;
  type: string;
  uuid: string;
}

export interface ByteUserInput {
  label: string;
  required: boolean;
  type: string;
  uuid: string;
}

export interface UserDiscordConnect {
  type: string;
  uuid: string;
}

export interface QuestionChoice {
  content: string;
  key: string;
}
