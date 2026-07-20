/**
 * Types and interfaces for the nightly Claude auto-generation controls
 * (mode / window / entity). Pure — no imports — so it can be referenced anywhere
 * (including the App Settings definitions) without risking an import cycle.
 *
 * The concrete values (presets, labels, window predicates, defaults) live in
 * `auto-gen-config.ts`; the App-Settings-backed resolvers and gate logic live in
 * `auto-gen-utils.ts`.
 */

/** How aggressively the nightly job consumes the Claude usage budget. */
export enum AutoGenMode {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

/** When the nightly job is allowed to run (enforced in code against ET time). */
export enum AutoGenWindow {
  NightShort = 'NightShort',
  NightExtended = 'NightExtended',
  DayAndNight = 'DayAndNight',
}

/** Which report types the nightly job generates. */
export enum AutoGenEntity {
  StocksOnly = 'StocksOnly',
  StocksAndEtfs = 'StocksAndEtfs',
  EtfsOnly = 'EtfsOnly',
}

/**
 * Cumulative % of the weekly Claude budget allowed by day-since-weekly-reset.
 * `day1` is the reset day; `day7` is the last day before the next reset.
 */
export interface WeeklyCapByDay {
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
  day6: number;
  day7: number;
}

/** The Claude-usage checks a given mode applies. */
export interface AutoGenModePreset {
  /** Skip if the shared 5-hour session utilization is at/above this %. */
  maxFiveHourUtilizationPct: number;
  /** Cumulative % of the weekly budget allowed, keyed by day-since-weekly-reset. */
  weeklyCapByDayPct: WeeklyCapByDay;
  /** How many requests to create per batch. */
  batchSize: number;
}

export interface AutoGenGateResult {
  allowed: boolean;
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
  weeklyCapPct: number | null;
}

export interface AutoEnqueueResult {
  /** How many new auto requests were created this run. */
  created: number;
  /** Short explanation of the outcome / which gate blocked. */
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
}
