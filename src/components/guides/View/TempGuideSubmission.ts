import { UserDiscordInfoInput, GuideSubmissionResult } from '@/graphql/generated/generated-types';

export type StepItemResponse = string[] | string | UserDiscordInfoInput;

export type StepItemResponseMap = Record<string, StepItemResponse>;

export type StepResponse = { isCompleted: boolean; isTouched: boolean; itemResponsesMap: StepItemResponseMap };

export type GuideResponsesMap = Record<string, StepResponse>;

export interface TempGuideSubmission {
  isPristine: boolean;
  isSubmitted: boolean;
  stepResponsesMap: GuideResponsesMap;
  submissionResult?: GuideSubmissionResult;
  galaxyCredentialsUpdated?: boolean;
}
