// ETF Scenario enums kept on the TypeScript side only.
// The database persists these as plain TEXT columns so that adding / removing
// values does not require a schema migration; zod and callers still get a
// strict string-literal union via `z.nativeEnum(<const object>)`.

export const EtfScenarioDirection = {
  UPSIDE: 'UPSIDE',
  DOWNSIDE: 'DOWNSIDE',
} as const;
export type EtfScenarioDirection = (typeof EtfScenarioDirection)[keyof typeof EtfScenarioDirection];

export const EtfScenarioTimeframe = {
  FUTURE: 'FUTURE',
  IN_PROGRESS: 'IN_PROGRESS',
  PAST: 'PAST',
} as const;
export type EtfScenarioTimeframe = (typeof EtfScenarioTimeframe)[keyof typeof EtfScenarioTimeframe];

export const EtfScenarioProbabilityBucket = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type EtfScenarioProbabilityBucket = (typeof EtfScenarioProbabilityBucket)[keyof typeof EtfScenarioProbabilityBucket];

export const EtfScenarioRole = {
  WINNER: 'WINNER',
  LOSER: 'LOSER',
  MOST_EXPOSED: 'MOST_EXPOSED',
} as const;
export type EtfScenarioRole = (typeof EtfScenarioRole)[keyof typeof EtfScenarioRole];
