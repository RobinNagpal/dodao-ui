type GuideIntegrationFragment = {
  discordRoleIds?: Array<string> | null;
  discordRolePassingCount?: number | null;
  discordWebhook?: string | null;
  projectGalaxyCredentialId?: string | null;
  projectGalaxyOatMintUrl?: string | null;
  projectGalaxyOatPassingCount?: number | null;
};

export interface ChoiceError {
  content?: boolean;
}

export interface QuestionError {
  content?: boolean;
  choices?: Record<string, ChoiceError>;
  answerKeys?: boolean;
  explanation?: boolean;
}

export interface UserInputError {
  label?: boolean;
}

export interface StepError {
  name?: boolean;
  content?: boolean;
  stepItems?: Record<string, QuestionError | UserInputError>;
}

export type KeyOfGuideIntegration = keyof GuideIntegrationFragment;

export interface GuideError {
  name?: boolean;
  content?: boolean;
  priority?: boolean;
  thumbnail?: boolean;
  steps?: Record<string, StepError>;
  guideIntegrations?: Partial<Record<KeyOfGuideIntegration, boolean | undefined>>;
}

export interface GuideSubmissionError {
  steps?: Record<string, StepError>;
}

export interface ByteSubmissionError {
  steps?: Record<string, StepError>;
}

export interface GuideCourseError {
  name?: boolean;
  excerpt?: boolean;
  content?: boolean;
  bundleGuides?: { [key: string]: boolean };
}

export interface TaskError {
  title?: boolean;
  excerpt?: boolean;
  details?: boolean;
  items?: Record<string, QuestionError | UserInputError>;
}

export interface ByteCollectionCategoryError {
  name?: boolean;
  excerpt?: boolean;
  byteCollections?: boolean;
  priority?: boolean;
  archive?: boolean;
}

export interface TidbitsHomepageError {
  heading?: boolean;
  shortDescription?: boolean;
}
