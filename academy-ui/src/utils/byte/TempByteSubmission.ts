import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';

export type ByteStepItemResponse = string[] | string | UserDiscordInfoInput;

export type ByteStepItemResponseMap = Record<string, ByteStepItemResponse>;

export type ByteStepResponse = { isCompleted: boolean; isTouched: boolean; itemResponsesMap: ByteStepItemResponseMap };

export type ByteStepResponsesMap = Record<string, ByteStepResponse>;

// Add GuideSubmissionsQuery_guideSubmissions_result for bytes

export interface TempByteSubmission {
  isPristine: boolean;
  isSubmitted: boolean;
  stepResponsesMap: ByteStepResponsesMap;
}
