import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';

export type StepItemResponse = string[] | string | UserDiscordInfoInput;

export type StepItemResponseMap = Record<string, StepItemResponse>;

export type StepResponse = { isCompleted: boolean; isTouched: boolean; itemResponsesMap: StepItemResponseMap };

export type ByteResponsesMap = Record<string, StepResponse>;

// Add GuideSubmissionsQuery_guideSubmissions_result for bytes

export interface TempByteSubmission {
  isPristine: boolean;
  isSubmitted: boolean;
  stepResponsesMap: ByteResponsesMap;
}
