/**
 * Defaults and config definitions for the nightly auto-generation controls: the
 * mode presets (the Claude-usage checks each mode applies), the dropdown labels,
 * the run-window predicates/descriptions, and the entity descriptions.
 *
 * Pure data — imports only the types from `auto-gen-models.ts`, never the App
 * Settings runtime — so `appConfigDefinitions.ts` can import it to build the
 * dropdowns + help notes without an import cycle.
 */
import { AutoGenEntity, AutoGenMode, AutoGenModePreset, AutoGenUsageCaps, AutoGenWindow, WeeklyCapByDay } from '@/utils/auto-generation/auto-gen-models';

export const DEFAULT_AUTO_GEN_MODE = AutoGenMode.Low;
export const DEFAULT_AUTO_GEN_WINDOW = AutoGenWindow.NightShort;
export const DEFAULT_AUTO_GEN_ENTITY = AutoGenEntity.StocksAndEtfs;

/** Ordered `WeeklyCapByDay` keys — index i = i days since the weekly reset. */
export const WEEKLY_CAP_DAY_KEYS: (keyof WeeklyCapByDay)[] = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];

/**
 * Claude-usage safety caps — identical for EVERY mode (these are the values Low
 * used before modes existed). The day-curve and 5-hour ceiling are safety limits,
 * not the throughput lever, so raising the mode does not push the job closer to
 * the Claude limit; it just generates more within these same caps.
 */
export const AUTO_GEN_USAGE_CAPS: AutoGenUsageCaps = {
  maxFiveHourUtilizationPct: 90,
  weeklyCapByDayPct: { day1: 20, day2: 30, day3: 40, day4: 50, day5: 60, day6: 80, day7: 95 },
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
