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

// Cost note: fetching from SSM decrypts every SecureString parameter, and each
// decryption is a billable AWS KMS request. A short TTL therefore turns steady
// app traffic into a steady stream of KMS calls (enough to exhaust the KMS free
// tier). Settings only change through the admin screen — which invalidates this
// cache on save and force-refreshes on view — so a long TTL is safe: its only
// cost is that a value edited directly in the AWS console (outside the admin
// screen) takes up to the TTL to be picked up.
const DEFAULT_CACHE_TTL_MS = 30 * 60_000;
// After a failed fetch, retry sooner than the full TTL so an outage recovers fast.
const ERROR_RETRY_TTL_MS = 60_000;
const defaults = bundledDefaults as Record<string, string>;

function getCacheTtlMs(): number {
  const raw = Number(process.env.APP_CONFIG_SSM_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_TTL_MS;
}

// Public-repo safeguard: a secret must NEVER carry a committed default value —
// `appConfigDefaults.json` is checked into a public repo, so a default there would
// leak the secret. Strip any that slip in and warn loudly. Secrets resolve from
// SSM or env only.
for (const def of APP_CONFIG_DEFINITIONS) {
  if (def.secret && def.key in defaults) {
    console.error(
      `[appConfig] SECURITY: secret "${def.key}" has a bundled default in appConfigDefaults.json — ignoring it. Remove that value from the committed file.`
    );
    delete defaults[def.key];
  }
}

interface SsmCacheState {
  /** Last successfully fetched values. Kept past expiry so a failed refresh can serve stale data. */
  values: Record<string, string> | null;
  /** Time after which the next read triggers a refresh. */
  expiresAt: number;
  /** In-flight fetch, shared so concurrent reads at expiry cost one SSM call, not one each. */
  inFlight: Promise<Record<string, string>> | null;
}

// The cache lives on globalThis because Next.js can instantiate this module in
// more than one bundle/module graph within the same server process — a plain
// module-level variable would mean one independent cache (and one SSM+KMS fetch
// stream) per copy.
const globalWithCache = globalThis as typeof globalThis & { __insightsUiSsmCache?: SsmCacheState };

function getSsmCache(): SsmCacheState {
  if (!globalWithCache.__insightsUiSsmCache) {
    globalWithCache.__insightsUiSsmCache = { values: null, expiresAt: 0, inFlight: null };
  }
  return globalWithCache.__insightsUiSsmCache;
}

async function getSsmValues(forceRefresh = false): Promise<Record<string, string>> {
  if (!isSsmConfigured()) return {};
  const cache = getSsmCache();
  if (!forceRefresh && cache.values && cache.expiresAt > Date.now()) return cache.values;
  if (cache.inFlight) return cache.inFlight;
  cache.inFlight = (async () => {
    try {
      const values = await fetchAllSsmParameters();
      cache.values = values;
      cache.expiresAt = Date.now() + getCacheTtlMs();
      return values;
    } catch (err) {
      // SSM misconfigured / IAM-denied / offline — never crash the app. Serve the
      // last-known-good values (or env + bundled defaults when there are none) and
      // retry on a short interval so we neither hammer SSM nor stay stale for long.
      console.error('[appConfig] Failed to read from SSM Parameter Store, using cached/env/default values instead:', err);
      cache.values = cache.values ?? {};
      cache.expiresAt = Date.now() + ERROR_RETRY_TTL_MS;
      return cache.values;
    } finally {
      cache.inFlight = null;
    }
  })();
  return cache.inFlight;
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
  /** Effective value. Always empty for secrets — their value is never sent to the client. */
  value: string;
  /** Whether a non-empty value is currently configured (used to show set/not-set for secrets). */
  isSet: boolean;
  /** Where the effective value came from. */
  source: AppConfigSource;
}

export interface AppSettingsForAdmin {
  /** Whether SSM is enabled — false means edits can't be saved and values come from env/defaults. */
  ssmConfigured: boolean;
  settings: ResolvedAppSetting[];
}

function resolveRaw(key: string, ssm: Record<string, string>): { value: string; source: AppConfigSource } {
  if (ssm[key] !== undefined) return { value: ssm[key], source: 'ssm' };
  if (process.env[key] !== undefined) return { value: process.env[key] as string, source: 'env' };
  return { value: defaults[key] ?? '', source: 'default' };
}

/**
 * Every managed setting with its resolved value and where that value came from.
 * Admin-facing: secret values are redacted (never leave the server) — only their
 * set/not-set state is reported.
 *
 * `forceRefresh` bypasses the (long-lived) SSM cache so the admin screen always
 * shows live values. Leave it off everywhere else — each refresh costs an SSM
 * call plus one KMS decrypt per secret.
 */
export async function getResolvedAppSettings(options?: { forceRefresh?: boolean }): Promise<ResolvedAppSetting[]> {
  const ssm = await getSsmValues(options?.forceRefresh ?? false);
  return APP_CONFIG_DEFINITIONS.map((def) => {
    const { value, source } = resolveRaw(def.key, ssm);
    const isSet = value.trim() !== '';
    return { ...def, value: def.secret ? '' : value, isSet, source };
  });
}

export interface UpdateAppSettingResult {
  success: boolean;
  message: string;
}

/** Persist a managed value to SSM. Requires SSM to be configured. */
export async function setAppConfigValue(key: string, value: string): Promise<UpdateAppSettingResult> {
  const def = APP_CONFIG_DEFINITIONS.find((d) => d.key === key);
  if (!def) {
    return { success: false, message: `Unknown setting: ${key}` };
  }
  if (value === '') {
    // SSM rejects empty values, and an empty secret would silently wipe a live key.
    return { success: false, message: 'Value cannot be empty.' };
  }
  if (def.options && !def.options.some((o) => o.value === value)) {
    return { success: false, message: `Invalid value for ${key}. Allowed: ${def.options.map((o) => o.value).join(', ')}` };
  }
  if (!isSsmConfigured()) {
    return {
      success: false,
      message:
        'SSM Parameter Store is not configured on this server, so settings cannot be saved. Set APP_CONFIG_SSM_ENABLED=true (and grant SSM permissions) to enable editing.',
    };
  }
  try {
    await putSsmParameter(key, value, def.secret ?? false);
    const cache = getSsmCache();
    cache.values = null; // force a fresh read on next access
    cache.expiresAt = 0;
    return { success: true, message: `Saved ${key}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to save ${key}: ${message}` };
  }
}

export { isSsmConfigured };
