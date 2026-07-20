/**
 * Registry of application settings that can be managed at runtime from the admin
 * "App Settings" screen instead of being baked into environment variables. This
 * is the single source of truth for WHICH keys exist and how the admin UI renders
 * them. The values themselves live in AWS SSM Parameter Store (when configured)
 * and fall back to `appConfigDefaults.json` — see `appConfig.ts`.
 *
 * To manage a new value: add its key + metadata here, add a default in
 * `appConfigDefaults.json`, then read it in code via `getAppConfigValue` /
 * `getAppConfigBoolean` instead of `process.env`.
 */
export type AppConfigValueType = 'boolean' | 'string';

export interface AppConfigDefinition {
  /** Env-var-style key. Also the SSM parameter name (under the configured prefix). */
  key: string;
  /** Human label for the admin screen. */
  label: string;
  /** What the setting does and the effect of each value. */
  description: string;
  type: AppConfigValueType;
}

export const APP_CONFIG_DEFINITIONS: AppConfigDefinition[] = [
  {
    key: 'USE_LAMBDA_FOR_LLM_RESPONSE',
    label: 'Use Lambda for LLM response (stock & ETF reports)',
    description:
      'OFF (default): run the report LLM call in-process in the background on this server. ON: offload the call to the AWS Lambda (the original behavior).',
    type: 'boolean',
  },
  {
    key: 'GENERATE_TARIFF_SECTIONS_SYNCHRONOUSLY',
    label: 'Generate tariff sections synchronously',
    description:
      'OFF (default): generate each tariff section in the background and return immediately. ON: the request waits for the full LLM generation (old synchronous behavior).',
    type: 'boolean',
  },
];

export const APP_CONFIG_KEYS: string[] = APP_CONFIG_DEFINITIONS.map((d) => d.key);
