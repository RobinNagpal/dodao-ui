// Scenario enums shared between ETF and Stock scenario features.
// The database persists these as plain TEXT columns so that adding / removing
// values does not require a schema migration; zod and callers still get a
// strict string-literal union via `z.nativeEnum(<const object>)`.

export const ScenarioDirection = {
  UPSIDE: 'UPSIDE',
  DOWNSIDE: 'DOWNSIDE',
} as const;
export type ScenarioDirection = (typeof ScenarioDirection)[keyof typeof ScenarioDirection];

export const ScenarioTimeframe = {
  FUTURE: 'FUTURE',
  IN_PROGRESS: 'IN_PROGRESS',
  PAST: 'PAST',
} as const;
export type ScenarioTimeframe = (typeof ScenarioTimeframe)[keyof typeof ScenarioTimeframe];

export const ScenarioProbabilityBucket = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type ScenarioProbabilityBucket = (typeof ScenarioProbabilityBucket)[keyof typeof ScenarioProbabilityBucket];

// How much of the scenario is already reflected in current prices. Pairs with
// probabilityPercentage to signal remaining edge: a 50%-probability scenario
// that is FULLY_PRICED_IN has no actionable edge; a 20%-probability scenario
// that is NOT_PRICED_IN can still be a strong trade.
export const ScenarioPricedInBucket = {
  NOT_PRICED_IN: 'NOT_PRICED_IN',
  PARTIALLY_PRICED_IN: 'PARTIALLY_PRICED_IN',
  MOSTLY_PRICED_IN: 'MOSTLY_PRICED_IN',
  FULLY_PRICED_IN: 'FULLY_PRICED_IN',
  OVER_PRICED_IN: 'OVER_PRICED_IN',
} as const;
export type ScenarioPricedInBucket = (typeof ScenarioPricedInBucket)[keyof typeof ScenarioPricedInBucket];

// TEN_BAGGER is stock-only — names with plausible 5–10x potential under the
// scenario, sourced from the value-chain layers in the detailed analysis.
// ETF scenarios never use this role (ETF holdings are pre-diversified, so a
// per-name 10x call would be misleading). Spelled out (`TEN_BAGGER`) rather
// than abbreviated (`BAGGER`) so the stored DB string is self-describing
// when read directly out of the column.
export const ScenarioRole = {
  WINNER: 'WINNER',
  LOSER: 'LOSER',
  TEN_BAGGER: 'TEN_BAGGER',
} as const;
export type ScenarioRole = (typeof ScenarioRole)[keyof typeof ScenarioRole];
