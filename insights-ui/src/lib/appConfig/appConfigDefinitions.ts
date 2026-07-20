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
 *
 * SECRETS: set `secret: true`. Secret values are stored as SSM `SecureString`,
 * redacted from the admin UI (write-only), and MUST NOT have a default in
 * `appConfigDefaults.json` — that file is committed to a public repo. Secrets
 * resolve from SSM or env only.
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
  /**
   * When true the value is a secret: stored as an SSM `SecureString` and never
   * returned to the admin UI (shown as set/not-set, edited write-only). Reads on
   * the server still get the real decrypted value.
   */
  secret?: boolean;
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
  {
    key: 'LAMBDA_URL_LLM_CALL_WITH_CALLBACK',
    label: 'LLM-call Lambda URL (callback path)',
    description: 'Base URL of the AWS Lambda that runs an LLM call and posts the result back via callback. Used only when the Lambda path is enabled.',
    type: 'string',
  },
  {
    key: 'ANTHROPIC_BASE_URL',
    label: 'Anthropic API base URL',
    description: 'Base URL for the Claude Messages / usage API (Claude provider). Defaults to the real Anthropic API; override only to point at a proxy.',
    type: 'string',
  },
  {
    key: 'ANTHROPIC_OAUTH_TOKEN_URL',
    label: 'Anthropic OAuth token endpoint',
    description: 'Endpoint used to exchange the Claude subscription refresh token for a short-lived access token. Change only if the OAuth host moves.',
    type: 'string',
  },
  {
    key: 'CLAUDE_CODE_VERSION',
    label: 'Claude Code version header',
    description: 'Value sent as the claude-cli user-agent version on Claude subscription OAuth calls.',
    type: 'string',
  },
  {
    key: 'GOOGLE_API_KEY',
    label: 'Google / Gemini API key',
    description: 'API key for the Gemini provider — report generation and grounded (Google Search) responses.',
    type: 'string',
    secret: true,
  },
  {
    key: 'ANTHROPIC_OAUTH_REFRESH_TOKEN',
    label: 'Claude OAuth refresh token',
    description: 'Long-lived Claude subscription refresh token (sk-ant-ort…). Exchanged on demand for short-lived access tokens; rotations persist to S3.',
    type: 'string',
    secret: true,
  },
  {
    key: 'ANTHROPIC_OAUTH_TOKEN',
    label: 'Claude OAuth static access token (fallback)',
    description: 'Static Claude access token (sk-ant-oat…) used only if the refresh flow fails. Short-lived — for bootstrap / dev.',
    type: 'string',
    secret: true,
  },
];

export const APP_CONFIG_KEYS: string[] = APP_CONFIG_DEFINITIONS.map((d) => d.key);
