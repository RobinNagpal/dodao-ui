import { APP_CONFIG_DEFINITIONS, AppConfigDefinition } from './appConfigDefinitions';
import bundledDefaults from './appConfigDefaults.json';
import { fetchAllSsmParameters, isSsmConfigured, putSsmParameter } from './ssmParameterStore';

/**
 * Runtime application config.
 *
 * Resolution order for every managed key: SSM Parameter Store (when configured)
 * → legacy `process.env` var → bundled default in `appConfigDefaults.json`. The
 * env step is a migration convenience so existing deployments keep working until
 * their values are moved into SSM; once a key lives in SSM you can delete its env
 * var. If SSM is unconfigured or unreachable the app still runs on defaults — it
 * never fails.
 */

const CACHE_TTL_MS = 60_000;
const defaults = bundledDefaults as Record<string, string>;

let ssmCache: { values: Record<string, string>; expiresAt: number } | null = null;

async function getSsmValues(): Promise<Record<string, string>> {
  if (!isSsmConfigured()) return {};
  if (ssmCache && ssmCache.expiresAt > Date.now()) return ssmCache.values;
  try {
    const values = await fetchAllSsmParameters();
    ssmCache = { values, expiresAt: Date.now() + CACHE_TTL_MS };
    return values;
  } catch (err) {
    // SSM misconfigured / IAM-denied / offline — never crash the app. Fall back
    // to env + bundled defaults, and cache the empty result briefly so we don't
    // hammer SSM on every request while it is broken.
    console.error('[appConfig] Failed to read from SSM Parameter Store, using env/defaults instead:', err);
    ssmCache = { values: {}, expiresAt: Date.now() + CACHE_TTL_MS };
    return {};
  }
}

/** Resolve a managed config value, or `undefined` if the key is unknown everywhere. */
export async function getAppConfigValue(key: string): Promise<string | undefined> {
  const ssm = await getSsmValues();
  return ssm[key] ?? process.env[key] ?? defaults[key];
}

/** Resolve a managed config value as a boolean (`'true'` → true, everything else → false). */
export async function getAppConfigBoolean(key: string): Promise<boolean> {
  return (await getAppConfigValue(key)) === 'true';
}

export type AppConfigSource = 'ssm' | 'env' | 'default';

export interface ResolvedAppSetting extends AppConfigDefinition {
  value: string;
  /** Where the effective value came from. */
  source: AppConfigSource;
}

export interface AppSettingsForAdmin {
  /** Whether SSM is enabled — false means edits can't be saved and values come from env/defaults. */
  ssmConfigured: boolean;
  settings: ResolvedAppSetting[];
}

/** Every managed setting with its resolved value and where that value came from. */
export async function getResolvedAppSettings(): Promise<ResolvedAppSetting[]> {
  const ssm = await getSsmValues();
  return APP_CONFIG_DEFINITIONS.map((def) => {
    if (ssm[def.key] !== undefined) return { ...def, value: ssm[def.key], source: 'ssm' };
    if (process.env[def.key] !== undefined) return { ...def, value: process.env[def.key] as string, source: 'env' };
    return { ...def, value: defaults[def.key] ?? '', source: 'default' };
  });
}

export interface UpdateAppSettingResult {
  success: boolean;
  message: string;
}

/** Persist a managed value to SSM. Requires SSM to be configured. */
export async function setAppConfigValue(key: string, value: string): Promise<UpdateAppSettingResult> {
  if (!APP_CONFIG_DEFINITIONS.some((d) => d.key === key)) {
    return { success: false, message: `Unknown setting: ${key}` };
  }
  if (!isSsmConfigured()) {
    return {
      success: false,
      message:
        'SSM Parameter Store is not configured on this server, so settings cannot be saved. Set APP_CONFIG_SSM_ENABLED=true (and grant SSM permissions) to enable editing.',
    };
  }
  try {
    await putSsmParameter(key, value);
    ssmCache = null; // force a fresh read on next access
    return { success: true, message: `Saved ${key}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to save ${key}: ${message}` };
  }
}

export { isSsmConfigured };
