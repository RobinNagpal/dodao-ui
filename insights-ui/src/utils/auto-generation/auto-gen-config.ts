/**
 * Defaults and config definitions for the nightly auto-generation controls: the
 * mode presets (the Claude-usage checks each mode applies), the dropdown labels,
 * the run-window predicates/descriptions, and the entity descriptions.
 *
 * Pure data — imports only the types from `auto-gen-models.ts`, never the App
 * Settings runtime — so `appConfigDefinitions.ts` can import it to build the
 * dropdowns + help notes without an import cycle.
 */
import {
  AutoGenBudgetUtilizationStrategy,
  AutoGenEntity,
  AutoGenMode,
  AutoGenModePreset,
  AutoGenUsageCaps,
  AutoGenWindow,
  HoursLeftToPercentRemaining,
} from '@/utils/auto-generation/auto-gen-models';

export const DEFAULT_AUTO_GEN_MODE = AutoGenMode.Low;
export const DEFAULT_AUTO_GEN_WINDOW = AutoGenWindow.NightShort;
export const DEFAULT_AUTO_GEN_ENTITY = AutoGenEntity.StocksAndEtfs;
export const DEFAULT_AUTO_GEN_BUDGET_UTILIZATION = AutoGenBudgetUtilizationStrategy.Aggressive;

/**
 * `HoursLeftToPercentRemaining` keys, ordered ascending by hours-to-reset. A
 * reading falls into the FIRST key whose hour bound is ≥ the hours actually left
 * (anything beyond the last bound uses `'168h'`, the strictest bucket).
 */
export const HOURS_LEFT_BUCKET_KEYS: (keyof HoursLeftToPercentRemaining)[] = ['8h', '16h', '24h', '36h', '48h', '72h', '96h', '120h', '144h', '168h'];

/**
 * Claude-usage safety cap shared by EVERY mode — the 5-hour session ceiling. It is
 * a safety limit, not a throughput lever, so raising the mode does not push the job
 * closer to the Claude limit; it just generates more within this same cap. The
 * weekly budget guardrail is the utilization-strategy curve below.
 */
export const AUTO_GEN_USAGE_CAPS: AutoGenUsageCaps = {
  maxFiveHourUtilizationPct: 90,
};

/**
 * Per-strategy weekly-budget curves: the minimum % of the weekly Claude budget that
 * must still be UNUSED to allow a new batch, keyed by hours left until the weekly
 * reset. A batch is skipped when less than this % remains. Thresholds ease off as
 * the reset nears (fresh budget is close), so the job may spend closer to the limit
 * late in the week. Aggressive reserves the least (anchored to the previous
 * day6=80% / day7=95% usage caps); Conservative reserves the most.
 */
export const HOURS_LEFT_TO_PERCENT_REMAINING: Record<AutoGenBudgetUtilizationStrategy, HoursLeftToPercentRemaining> = {
  [AutoGenBudgetUtilizationStrategy.Aggressive]: {
    '168h': 80,
    '144h': 70,
    '120h': 60,
    '96h': 50,
    '72h': 40,
    '48h': 20,
    '36h': 12,
    '24h': 8,
    '16h': 5,
    '8h': 2,
  },
  [AutoGenBudgetUtilizationStrategy.Moderate]: { '168h': 84, '144h': 75, '120h': 66, '96h': 56, '72h': 46, '48h': 28, '36h': 18, '24h': 13, '16h': 8, '8h': 5 },
  [AutoGenBudgetUtilizationStrategy.Conservative]: {
    '168h': 88,
    '144h': 80,
    '120h': 72,
    '96h': 62,
    '72h': 52,
    '48h': 35,
    '36h': 25,
    '24h': 18,
    '16h': 12,
    '8h': 8,
  },
};

export const AUTO_GEN_BUDGET_UTILIZATION_LABELS: Record<AutoGenBudgetUtilizationStrategy, string> = {
  [AutoGenBudgetUtilizationStrategy.Aggressive]: 'Aggressive — spend the budget faster',
  [AutoGenBudgetUtilizationStrategy.Moderate]: 'Moderate — balanced',
  [AutoGenBudgetUtilizationStrategy.Conservative]: 'Conservative — keep more in reserve',
};

/**
 * The real consumption levers, per mode: how many reports each batch enqueues
 * (`batchSize`) and how frequently batches run (`minMinutesBetweenBatches`, the
 * cooldown after one batch finishes before the next may start). Low reproduces the
 * previous behavior (5 reports, ~15-min spacing); Medium and High generate more,
 * more often. All three still obey the shared `AUTO_GEN_USAGE_CAPS`.
 */
export const AUTO_GEN_MODE_PRESETS: Record<AutoGenMode, AutoGenModePreset> = {
  [AutoGenMode.Low]: { batchSize: 5, minMinutesBetweenBatches: 15 },
  [AutoGenMode.Medium]: { batchSize: 10, minMinutesBetweenBatches: 10 },
  [AutoGenMode.High]: { batchSize: 15, minMinutesBetweenBatches: 5 },
};

export const AUTO_GEN_MODE_LABELS: Record<AutoGenMode, string> = {
  [AutoGenMode.Low]: 'Low',
  [AutoGenMode.Medium]: 'Medium',
  [AutoGenMode.High]: 'High',
};

/**
 * Each window as a label, a human description (shown as the help note), and an
 * ET-hour predicate. The predicate takes the current hour in America/New_York
 * (0-23) and returns whether the job may run.
 */
export const AUTO_GEN_WINDOWS: Record<AutoGenWindow, { label: string; description: string; isWithinHourEt: (hourEt: number) => boolean }> = {
  [AutoGenWindow.NightShort]: {
    label: 'Night (short)',
    description: 'Runs 22:00–02:59 ET only. This is the default.',
    isWithinHourEt: (h) => h >= 22 || h < 3,
  },
  [AutoGenWindow.NightExtended]: {
    label: 'Night (extended)',
    description: 'Runs 19:00–05:59 ET (±3 hours around the short window).',
    isWithinHourEt: (h) => h >= 19 || h < 6,
  },
  [AutoGenWindow.DayAndNight]: {
    label: 'Day and night',
    description: 'Runs 24/7, all day and night. How often it actually enqueues within this window is set by the mode.',
    isWithinHourEt: () => true,
  },
};

export const AUTO_GEN_ENTITY_INFO: Record<AutoGenEntity, { label: string; description: string }> = {
  [AutoGenEntity.StocksOnly]: { label: 'Stocks only', description: 'Only stock reports are auto-generated. ETF auto-generation is paused.' },
  [AutoGenEntity.StocksAndEtfs]: { label: 'Stocks and ETFs', description: 'Both stock and ETF reports are auto-generated. This is the default.' },
  [AutoGenEntity.EtfsOnly]: { label: 'ETFs only', description: 'Only ETF reports are auto-generated. Stock auto-generation is paused.' },
};
