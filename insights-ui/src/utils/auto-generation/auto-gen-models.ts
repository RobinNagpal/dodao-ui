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
 * How aggressively auto-generation is allowed to spend the weekly Claude budget as
 * the weekly reset approaches. Each strategy selects one of the
 * `HOURS_LEFT_TO_PERCENT_REMAINING` curves: Aggressive reserves the least budget
 * (spends fastest), Conservative reserves the most. Default Aggressive.
 */
export enum AutoGenBudgetUtilizationStrategy {
  Aggressive = 'Aggressive',
  Moderate = 'Moderate',
  Conservative = 'Conservative',
}

/**
 * Minimum % of the weekly Claude budget that must still be UNUSED for a new batch
 * to be allowed, keyed by how many hours remain until the weekly reset. Each key is
 * an upper bound on hours-left: a reading falls into the SMALLEST key ≥ the hours
 * actually left (e.g. 30h left → the `'36h'` bucket). Thresholds shrink toward the
 * reset, so the job may spend closer to the limit as fresh budget nears. `'168h'`
 * is the start of the week (strictest), `'8h'` the final stretch (most permissive).
 */
export interface HoursLeftToPercentRemaining {
  '168h': number; // day 1  (144–168h left)
  '144h': number; // day 2
  '120h': number; // day 3
  '96h': number; // day 4
  '72h': number; // day 5
  '48h': number; // day 6, first half
  '36h': number; // day 6, second half
  '24h': number; // day 7, first third
  '16h': number; // day 7, middle third
  '8h': number; // day 7, final third
}

/**
 * Claude-usage safety caps. These are the SAME for every mode — they bound how
 * close to the Claude limit the job is ever allowed to run. Modes differ only in
 * throughput (how much they generate within these caps), not in the caps. The
 * weekly budget guardrail is the utilization-strategy curve, not a field here.
 */
export interface AutoGenUsageCaps {
  /** Skip if the shared 5-hour session utilization is at/above this %. */
  maxFiveHourUtilizationPct: number;
}

/**
 * Per-mode throughput levers — the knobs that actually drive Claude consumption.
 * The usage caps (above) are shared; a higher mode simply generates more, more
 * often, until it hits those shared caps.
 */
export interface AutoGenModePreset {
  /** How many requests to create per batch — the "number of reports" lever. */
  batchSize: number;
  /** Minimum minutes between one auto batch finishing and the next starting — the "frequency" lever. */
  minMinutesBetweenBatches: number;
}

export interface AutoGenGateResult {
  allowed: boolean;
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
  /** % of the weekly budget still unused (100 − weeklyPct); null when weekly usage is unknown. */
  remainingPct: number | null;
  /** Min remaining % required to pass — from the selected strategy's curve for the current hours-to-reset bucket. */
  requiredRemainingPct: number;
  /** Whole hours until the weekly reset; null when the reset time is unknown. */
  hoursToReset: number | null;
  /** The budget utilization strategy whose curve was applied. */
  strategy: AutoGenBudgetUtilizationStrategy;
}

export interface AutoEnqueueResult {
  /** How many new auto requests were created this run. */
  created: number;
  /** Short explanation of the outcome / which gate blocked. */
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
  /** Budget-gate observability — populated once the Claude usage gate runs (omitted on earlier short-circuits). */
  remainingPct?: number | null;
  requiredRemainingPct?: number;
  hoursToReset?: number | null;
  strategy?: AutoGenBudgetUtilizationStrategy;
}

/**
 * Result of one auto-generation tick — the single in-app entry point the cron
 * heartbeat calls. Each entity's job self-gates (entity / window / cooldown /
 * usage), so the tick always runs both and reports each outcome.
 */
export interface AutoGenTickResult {
  stock: AutoEnqueueResult;
  etf: AutoEnqueueResult;
}

/**
 * Per-entity view for the read-only auto-generation status endpoint. Mirrors the
 * gate chain the enqueue job walks, but never creates anything — it just reports
 * the state of each gate so an operator can see WHY a batch would or would not be
 * created right now.
 */
export interface AutoGenEntityStatus {
  /** Whether the selected entity includes this type (`AUTOMATED_GENERATION_ENTITY`). */
  entityEnabled: boolean;
  /** Open (NotStarted/InProgress) auto requests — a non-zero count blocks a new batch. */
  openAutoCount: number;
  /** `updatedAt` (ISO) of the most recent auto request, or null when none exists. */
  lastAutoAt: string | null;
  /** Whether the mode's frequency cooldown is still in effect since `lastAutoAt`. */
  cooldownActive: boolean;
  /** Whole minutes since the last auto batch, or null when there is none. */
  minutesSinceLastBatch: number | null;
  /** How many candidates the selection query returns right now (bounded by batch size). */
  candidateCount: number;
  /** True only when every gate passes AND at least one candidate exists. */
  wouldEnqueue: boolean;
  /**
   * The first gate that blocks this entity, matching the enqueue job's `reason`
   * strings (`entity-disabled` / `outside-window` / `batch-in-progress` /
   * `frequency-cooldown` / the usage-gate reason / `usage-unavailable` /
   * `no-candidates`), or `ok` when a batch would be created.
   */
  blockingReason: string;
}

/** One resolved App-Settings value with where it came from — for the status payload. */
export interface AutoGenResolvedSetting {
  key: string;
  value: string;
  source: 'ssm' | 'env' | 'default';
}

/**
 * Full read-only snapshot returned by `GET /cron/auto-gen-status`: the resolved
 * controls, the current run-window state, the shared Claude usage gate, and a
 * per-entity gate breakdown. Read-only — computing it never enqueues anything.
 */
export interface AutoGenerationStatus {
  /** Server clock (ISO UTC) the snapshot was computed at. */
  now: string;
  /** Current hour (0-23) in America/New_York — the value the window predicate is checked against. */
  currentEtHour: number;
  /** Master switch (`AUTOMATED_GENERATION_ENABLED`). When false, the tick short-circuits both entities. */
  masterEnabled: boolean;
  entity: AutoGenEntity;
  window: { value: AutoGenWindow; isWithinWindow: boolean };
  mode: { value: AutoGenMode; batchSize: number; minMinutesBetweenBatches: number };
  budgetStrategy: AutoGenBudgetUtilizationStrategy;
  /**
   * The shared Claude usage gate result, or `null` with an `error` message when
   * the usage endpoint could not be reached (the same failure that makes the real
   * job create nothing and report `usage-unavailable`).
   */
  gate: AutoGenGateResult | null;
  usageError: string | null;
  /** Resolved values of the auto-generation settings with their source (ssm/env/default). */
  settings: AutoGenResolvedSetting[];
  stock: AutoGenEntityStatus;
  etf: AutoGenEntityStatus;
}
