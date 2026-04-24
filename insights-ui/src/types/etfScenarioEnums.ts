// Aliases into the shared scenario enum module so ETF-scenario callers keep
// compiling without changes. New code should import from `./scenarioEnums`
// directly.
import { ScenarioDirection, ScenarioPricedInBucket, ScenarioProbabilityBucket, ScenarioRole, ScenarioTimeframe } from './scenarioEnums';

export const EtfScenarioDirection = ScenarioDirection;
export type EtfScenarioDirection = ScenarioDirection;

export const EtfScenarioTimeframe = ScenarioTimeframe;
export type EtfScenarioTimeframe = ScenarioTimeframe;

export const EtfScenarioProbabilityBucket = ScenarioProbabilityBucket;
export type EtfScenarioProbabilityBucket = ScenarioProbabilityBucket;

export const EtfScenarioPricedInBucket = ScenarioPricedInBucket;
export type EtfScenarioPricedInBucket = ScenarioPricedInBucket;

export const EtfScenarioRole = ScenarioRole;
export type EtfScenarioRole = ScenarioRole;
