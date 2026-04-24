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

// How much of the scenario is already reflected in current ETF prices.
// Pairs with probabilityPercentage to signal remaining edge: a 50%-probability
// scenario that is FULLY_PRICED_IN has no actionable edge; a 20%-probability
// scenario that is NOT_PRICED_IN can still be a strong trade.
export const EtfScenarioPricedInBucket = {
  NOT_PRICED_IN: 'NOT_PRICED_IN',
  PARTIALLY_PRICED_IN: 'PARTIALLY_PRICED_IN',
  MOSTLY_PRICED_IN: 'MOSTLY_PRICED_IN',
  FULLY_PRICED_IN: 'FULLY_PRICED_IN',
  OVER_PRICED_IN: 'OVER_PRICED_IN',
} as const;
export type EtfScenarioPricedInBucket = (typeof EtfScenarioPricedInBucket)[keyof typeof EtfScenarioPricedInBucket];

export const EtfScenarioRole = {
  WINNER: 'WINNER',
  LOSER: 'LOSER',
  MOST_EXPOSED: 'MOST_EXPOSED',
} as const;
export type EtfScenarioRole = (typeof EtfScenarioRole)[keyof typeof EtfScenarioRole];
