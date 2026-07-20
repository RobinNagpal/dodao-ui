import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import {
  AUTO_GEN_MODE_PRESETS,
  AUTO_GEN_WINDOWS,
  AutoGenEntity,
  AutoGenMode,
  AutoGenModePreset,
  AutoGenWindow,
  DEFAULT_AUTO_GEN_ENTITY,
  DEFAULT_AUTO_GEN_MODE,
  DEFAULT_AUTO_GEN_WINDOW,
} from '@/utils/analysis-reports/auto-gen-modes';

/**
 * App-Settings-backed resolvers for the nightly auto-generation controls. These
 * read the admin-selected values from SSM (via `getAppConfigValue`) and fall back
 * to the defaults. Kept separate from `auto-gen-modes.ts` so the pure definitions
 * can be imported by `appConfigDefinitions.ts` without a circular dependency.
 */

export const AUTO_GEN_MODE_KEY = 'AUTOMATED_GENERATION_MODE';
export const AUTO_GEN_WINDOW_KEY = 'AUTOMATED_GENERATION_WINDOW';
export const AUTO_GEN_ENTITY_KEY = 'AUTOMATED_GENERATION_ENTITY';

/** Returns `value` if it's one of `allowed`, otherwise `fallback`. */
function coerce<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export async function getAutoGenMode(): Promise<AutoGenMode> {
  return coerce(await getAppConfigValue(AUTO_GEN_MODE_KEY), Object.values(AutoGenMode), DEFAULT_AUTO_GEN_MODE);
}

export async function getAutoGenModePreset(): Promise<AutoGenModePreset> {
  return AUTO_GEN_MODE_PRESETS[await getAutoGenMode()];
}

export async function getAutoGenWindow(): Promise<AutoGenWindow> {
  return coerce(await getAppConfigValue(AUTO_GEN_WINDOW_KEY), Object.values(AutoGenWindow), DEFAULT_AUTO_GEN_WINDOW);
}

export async function getAutoGenEntity(): Promise<AutoGenEntity> {
  return coerce(await getAppConfigValue(AUTO_GEN_ENTITY_KEY), Object.values(AutoGenEntity), DEFAULT_AUTO_GEN_ENTITY);
}

/** Current hour (0-23) in America/New_York, DST-aware. */
export function currentEtHour(now: Date): number {
  const formatted = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now);
  const hour = parseInt(formatted, 10);
  return hour === 24 ? 0 : hour; // some runtimes format midnight as "24"
}

/** Whether the nightly job may run right now, per the selected window. */
export async function isWithinAutoGenWindow(now: Date): Promise<boolean> {
  const window = await getAutoGenWindow();
  return AUTO_GEN_WINDOWS[window].isWithinHourEt(currentEtHour(now));
}

export async function isStockAutoGenEnabled(): Promise<boolean> {
  const entity = await getAutoGenEntity();
  return entity === AutoGenEntity.StocksOnly || entity === AutoGenEntity.StocksAndEtfs;
}

export async function isEtfAutoGenEnabled(): Promise<boolean> {
  const entity = await getAutoGenEntity();
  return entity === AutoGenEntity.EtfsOnly || entity === AutoGenEntity.StocksAndEtfs;
}
