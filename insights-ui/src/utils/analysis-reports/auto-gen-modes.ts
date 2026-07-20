/**
 * Pure definitions for the nightly auto-generation settings (mode / window /
 * entity). No dependency on the App Settings runtime, so this can be imported
 * both by `appConfigDefinitions.ts` (to build the dropdowns + help notes) and by
 * the auto-generation runtime code. The App-Settings-backed resolvers that read
 * the selected values live in `auto-gen-config.ts`.
 */

/** How aggressively the nightly job consumes the Claude usage budget. */
export enum AutoGenMode {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
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

export const DEFAULT_AUTO_GEN_MODE = AutoGenMode.LOW;
export const DEFAULT_AUTO_GEN_WINDOW = AutoGenWindow.NightShort;
export const DEFAULT_AUTO_GEN_ENTITY = AutoGenEntity.StocksAndEtfs;

/** The Claude-usage checks a given mode applies. */
export interface AutoGenModePreset {
  /** Skip if the shared 5-hour session utilization is at/above this %. */
  maxFiveHourUtilizationPct: number;
  /** Cumulative % of the weekly budget allowed by day-since-weekly-reset (index 0 = reset day). */
  weeklyCapByDayPct: number[];
  /** How many requests to create per batch. */
  batchSize: number;
}

/**
 * LOW reproduces the previous hardcoded behavior exactly. MEDIUM and HIGH raise
 * the caps and batch size to generate more reports per night at higher spend.
 */
export const AUTO_GEN_MODE_PRESETS: Record<AutoGenMode, AutoGenModePreset> = {
  [AutoGenMode.LOW]: { maxFiveHourUtilizationPct: 90, weeklyCapByDayPct: [20, 30, 40, 50, 60, 70, 80], batchSize: 5 },
  [AutoGenMode.MEDIUM]: { maxFiveHourUtilizationPct: 95, weeklyCapByDayPct: [40, 50, 60, 70, 80, 90, 95], batchSize: 8 },
  [AutoGenMode.HIGH]: { maxFiveHourUtilizationPct: 98, weeklyCapByDayPct: [70, 80, 90, 95, 98, 100, 100], batchSize: 12 },
};

export const AUTO_GEN_MODE_LABELS: Record<AutoGenMode, string> = {
  [AutoGenMode.LOW]: 'Low (current)',
  [AutoGenMode.MEDIUM]: 'Medium',
  [AutoGenMode.HIGH]: 'High',
};

/**
 * Each window as a label, a human description (shown as the help note), and an
 * ET-hour predicate. The predicate takes the current hour in America/New_York
 * (0-23) and returns whether the job may run.
 */
export const AUTO_GEN_WINDOWS: Record<AutoGenWindow, { label: string; description: string; isWithinHourEt: (hourEt: number) => boolean }> = {
  [AutoGenWindow.NightShort]: {
    label: 'Night (short)',
    description: 'Runs 22:00–02:59 ET only. Current default.',
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
  [AutoGenEntity.StocksAndEtfs]: { label: 'Stocks and ETFs', description: 'Both stock and ETF reports are auto-generated. Current default.' },
  [AutoGenEntity.EtfsOnly]: { label: 'ETFs only', description: 'Only ETF reports are auto-generated. Stock auto-generation is paused.' },
};
