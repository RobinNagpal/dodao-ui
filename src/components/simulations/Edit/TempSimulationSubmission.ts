import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';

export type StepItemResponse = string[] | string | UserDiscordInfoInput;

export type StepResponse = { isCompleted: boolean; isTouched: boolean };

export type SimulationResponsesMap = Record<string, StepResponse>;

// Add GuideSubmissionsQuery_guideSubmissions_result for simulations

export interface TempSimulationSubmission {
  isPristine: boolean;
  isSubmitted: boolean;
  stepResponsesMap: SimulationResponsesMap;
}
