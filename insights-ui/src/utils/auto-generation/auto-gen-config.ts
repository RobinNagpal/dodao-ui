/**
 * Defaults and config definitions for the nightly auto-generation controls: the
 * mode presets (the Claude-usage checks each mode applies), the dropdown labels,
 * the run-window predicates/descriptions, and the entity descriptions.
 *
 * Pure data — imports only the types from `auto-gen-models.ts`, never the App
 * Settings runtime — so `appConfigDefinitions.ts` can import it to build the
 * dropdowns + help notes without an import cycle.
 */
import { AutoGenEntity, AutoGenMode, AutoGenModePreset, AutoGenWindow, WeeklyCapByDay } from '@/utils/auto-generation/auto-gen-models';

export const DEFAULT_AUTO_GEN_MODE = AutoGenMode.Low;
export const DEFAULT_AUTO_GEN_WINDOW = AutoGenWindow.NightShort;
export const DEFAULT_AUTO_GEN_ENTITY = AutoGenEntity.StocksAndEtfs;

/** Ordered `WeeklyCapByDay` keys — index i = i days since the weekly reset. */
export const WEEKLY_CAP_DAY_KEYS: (keyof WeeklyCapByDay)[] = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];

/**
 * Low reproduces the previous hardcoded behavior exactly. Medium and High raise
 * the caps and batch size to generate more reports per night at higher spend.
 */
export const AUTO_GEN_MODE_PRESETS: Record<AutoGenMode, AutoGenModePreset> = {
  [AutoGenMode.Low]: {
    maxFiveHourUtilizationPct: 90,
    weeklyCapByDayPct: { day1: 20, day2: 30, day3: 40, day4: 50, day5: 60, day6: 70, day7: 80 },
    batchSize: 5,
  },
  [AutoGenMode.Medium]: {
    maxFiveHourUtilizationPct: 95,
    weeklyCapByDayPct: { day1: 40, day2: 50, day3: 60, day4: 70, day5: 80, day6: 90, day7: 95 },
    batchSize: 8,
  },
  [AutoGenMode.High]: {
    maxFiveHourUtilizationPct: 98,
    weeklyCapByDayPct: { day1: 70, day2: 80, day3: 90, day4: 95, day5: 98, day6: 100, day7: 100 },
    batchSize: 12,
  },
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
    description: 'Runs 24/7 — every 15 minutes, all day and night.',
    isWithinHourEt: () => true,
  },
};

export const AUTO_GEN_ENTITY_INFO: Record<AutoGenEntity, { label: string; description: string }> = {
  [AutoGenEntity.StocksOnly]: { label: 'Stocks only', description: 'Only stock reports are auto-generated. ETF auto-generation is paused.' },
  [AutoGenEntity.StocksAndEtfs]: { label: 'Stocks and ETFs', description: 'Both stock and ETF reports are auto-generated. This is the default.' },
  [AutoGenEntity.EtfsOnly]: { label: 'ETFs only', description: 'Only ETF reports are auto-generated. Stock auto-generation is paused.' },
};
