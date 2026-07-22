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
import { ClaudeModel, GeminiModel, LLMProvider } from '@/types/llmConstants';
import {
  AUTO_GEN_BUDGET_UTILIZATION_LABELS,
  AUTO_GEN_ENTITY_INFO,
  AUTO_GEN_MODE_LABELS,
  AUTO_GEN_MODE_PRESETS,
  AUTO_GEN_WINDOWS,
  HOURS_LEFT_TO_PERCENT_REMAINING,
} from '@/utils/auto-generation/auto-gen-config';
import { AutoGenBudgetUtilizationStrategy, AutoGenEntity, AutoGenMode, AutoGenWindow } from '@/utils/auto-generation/auto-gen-models';

export type AppConfigValueType = 'boolean' | 'string';

/** Ids of the groups the admin App Settings screen renders settings under, in display order. */
export type AppConfigGroupId = 'claude-auth' | 'llm-defaults' | 'provider-keys' | 'report-generation' | 'auto-generation' | 'claude-endpoints';

/** One choice for a setting that has a fixed set of allowed values (rendered as a dropdown). */
export interface AppConfigOption {
  value: string;
  label: string;
  /**
   * Optional note shown under the dropdown when THIS option is the current
   * selection — e.g. the config the value applies, as JSON or prose. Generic:
   * any option on any dropdown setting can carry one.
   */
  helpNote?: string;
}

export interface AppConfigDefinition {
  /** Env-var-style key. Also the SSM parameter name (under the configured prefix). */
  key: string;
  /** Human label for the admin screen. */
  label: string;
  /** What the setting does and the effect of each value. */
  description: string;
  type: AppConfigValueType;
  /** Which section of the App Settings screen this setting belongs to. */
  group: AppConfigGroupId;
  /**
   * When true the value is a secret: stored as an SSM `SecureString` and never
   * returned to the admin UI (shown as set/not-set, edited write-only). Reads on
   * the server still get the real decrypted value.
   */
  secret?: boolean;
  /** Fixed set of allowed values. When present the admin UI shows a dropdown and writes are validated against it. */
  options?: AppConfigOption[];
}

/** A group heading rendered on the App Settings screen. */
export interface AppConfigGroup {
  id: AppConfigGroupId;
  label: string;
  description: string;
}

/**
 * The App Settings groups, in the order they appear on screen. Claude
 * subscription credentials come first (they rotate most often); the low-level
 * Claude endpoints/headers come last (they rarely change).
 */
export const APP_CONFIG_GROUPS: AppConfigGroup[] = [
  {
    id: 'claude-auth',
    label: 'Claude Subscription Auth',
    description: 'Credentials for the Claude subscription OAuth flow. These rotate most often, so they live at the top.',
  },
  {
    id: 'llm-defaults',
    label: 'Default LLM Provider & Models',
    description: 'Fallback provider and models used when a report request does not specify one. A per-run selection in the report UI always overrides these.',
  },
  {
    id: 'provider-keys',
    label: 'Provider API Keys',
    description: 'API keys for the model providers.',
  },
  {
    id: 'report-generation',
    label: 'Report Generation Behavior',
    description: 'Toggles and endpoints that control how stock, ETF, and tariff report generation runs.',
  },
  {
    id: 'auto-generation',
    label: 'Automated Report Generation',
    description:
      'Controls for the nightly Claude auto-generation job: the master on/off switch, how aggressively it spends the Claude budget, when it runs, and which report types it generates.',
  },
  {
    id: 'claude-endpoints',
    label: 'Claude Endpoints & Headers',
    description: 'Low-level Claude API endpoints and request headers. Rarely change — only when a host or protocol moves.',
  },
];

export const APP_CONFIG_DEFINITIONS: AppConfigDefinition[] = [
  {
    key: 'USE_LAMBDA_FOR_LLM_RESPONSE',
    label: 'Use Lambda for LLM response (stock & ETF reports)',
    description:
      'OFF (default): run the report LLM call in-process in the background on this server. ON: offload the call to the AWS Lambda (the original behavior).',
    type: 'boolean',
    group: 'report-generation',
  },
  {
    key: 'GENERATE_TARIFF_SECTIONS_SYNCHRONOUSLY',
    label: 'Generate tariff sections synchronously',
    description:
      'OFF (default): generate each tariff section in the background and return immediately. ON: the request waits for the full LLM generation (old synchronous behavior).',
    type: 'boolean',
    group: 'report-generation',
  },
  {
    key: 'LAMBDA_URL_LLM_CALL_WITH_CALLBACK',
    label: 'LLM-call Lambda URL (callback path)',
    description: 'Base URL of the AWS Lambda that runs an LLM call and posts the result back via callback. Used only when the Lambda path is enabled.',
    type: 'string',
    group: 'report-generation',
  },
  {
    key: 'ANTHROPIC_BASE_URL',
    label: 'Anthropic API base URL',
    description: 'Base URL for the Claude Messages / usage API (Claude provider). Defaults to the real Anthropic API; override only to point at a proxy.',
    type: 'string',
    group: 'claude-endpoints',
  },
  {
    key: 'ANTHROPIC_OAUTH_TOKEN_URL',
    label: 'Anthropic OAuth token endpoint',
    description: 'Endpoint used to exchange the Claude subscription refresh token for a short-lived access token. Change only if the OAuth host moves.',
    type: 'string',
    group: 'claude-endpoints',
  },
  {
    key: 'CLAUDE_CODE_VERSION',
    label: 'Claude Code version header',
    description: 'Value sent as the claude-cli user-agent version on Claude subscription OAuth calls.',
    type: 'string',
    group: 'claude-endpoints',
  },
  {
    key: 'LLM_DEFAULT_PROVIDER',
    label: 'Default LLM provider',
    description: 'Fallback provider for report generation when a request does not specify one. A per-run selection in the report UI always overrides this.',
    type: 'string',
    group: 'llm-defaults',
    options: [
      { value: LLMProvider.GEMINI, label: 'Gemini' },
      { value: LLMProvider.GEMINI_WITH_GROUNDING, label: 'Gemini (with grounding)' },
      { value: LLMProvider.CLAUDE, label: 'Claude' },
    ],
  },
  {
    key: 'LLM_DEFAULT_GEMINI_MODEL',
    label: 'Default Gemini model',
    description: 'Fallback Gemini model for report generation when none is specified. A per-run model selection overrides this.',
    type: 'string',
    group: 'llm-defaults',
    options: [
      { value: GeminiModel.GEMINI_2_5_PRO, label: 'gemini-2.5-pro' },
      { value: GeminiModel.GEMINI_3_1_PRO_PREVIEW, label: 'gemini-3.1-pro-preview' },
    ],
  },
  {
    key: 'LLM_DEFAULT_CLAUDE_MODEL',
    label: 'Default Claude model',
    description: 'Fallback Claude model used when the Claude provider runs without an explicit model. A per-run model selection overrides this.',
    type: 'string',
    group: 'llm-defaults',
    options: [
      { value: ClaudeModel.CLAUDE_OPUS_4_8, label: 'Claude Opus 4.8' },
      { value: ClaudeModel.CLAUDE_OPUS_4_7, label: 'Claude Opus 4.7' },
      { value: ClaudeModel.CLAUDE_SONNET_4_6, label: 'Claude Sonnet 4.6' },
      { value: ClaudeModel.CLAUDE_HAIKU_4_5, label: 'Claude Haiku 4.5' },
    ],
  },
  {
    key: 'AUTOMATED_GENERATION_ENABLED',
    label: 'Enable automated generation',
    description:
      'Master on/off switch for the nightly auto-generation job. When OFF, no stock or ETF reports are auto-generated regardless of the mode, window, or entity below. When ON, the job runs subject to those controls and the Claude usage caps.',
    type: 'boolean',
    group: 'auto-generation',
  },
  {
    key: 'AUTOMATED_GENERATION_MODE',
    label: 'Automated generation mode',
    description:
      'How much the nightly auto-generation produces. Each mode sets the batch size (reports per run) and the cooldown between batches (how often it runs) — the two levers that actually drive Claude consumption. Low keeps the previous behavior; Medium and High generate more, more often. The Claude usage safety caps (5-hour + weekly) are the same for every mode. The selected mode’s exact config is shown below.',
    type: 'string',
    group: 'auto-generation',
    options: Object.values(AutoGenMode).map((mode) => ({
      value: mode,
      label: AUTO_GEN_MODE_LABELS[mode],
      helpNote: JSON.stringify(AUTO_GEN_MODE_PRESETS[mode], null, 2),
    })),
  },
  {
    key: 'AUTOMATED_GENERATION_BUDGET_UTILIZATION',
    label: 'Weekly budget utilization',
    description:
      'How aggressively auto-generation spends the weekly Claude budget as the weekly reset approaches. Each strategy is a curve of “minimum % of the weekly budget that must still remain”, keyed by hours left until the reset — a new batch is skipped when less than that % remains. Counting toward the reset makes it tighten/ease exactly as fresh budget nears. Aggressive reserves the least (spends fastest); Conservative reserves the most. The 5-hour safety ceiling is the same for every strategy. The selected strategy’s exact curve is shown below.',
    type: 'string',
    group: 'auto-generation',
    options: Object.values(AutoGenBudgetUtilizationStrategy).map((strategy) => ({
      value: strategy,
      label: AUTO_GEN_BUDGET_UTILIZATION_LABELS[strategy],
      helpNote: JSON.stringify(HOURS_LEFT_TO_PERCENT_REMAINING[strategy], null, 2),
    })),
  },
  {
    key: 'AUTOMATED_GENERATION_OPUS_MODEL',
    label: 'Auto-gen Opus model',
    description:
      'The nightly job picks its Claude model automatically: Opus and Sonnet have SEPARATE weekly subscription budgets, so each batch is routed to whichever family has more of its weekly budget still remaining (tapping both pools and self-balancing them). This setting only chooses WHICH Opus model is used when a batch is routed to Opus. Provider is always Claude (subscription OAuth).',
    type: 'string',
    group: 'auto-generation',
    options: [
      { value: ClaudeModel.CLAUDE_OPUS_4_8, label: 'Claude Opus 4.8' },
      { value: ClaudeModel.CLAUDE_OPUS_4_7, label: 'Claude Opus 4.7' },
    ],
  },
  {
    key: 'AUTOMATED_GENERATION_SONNET_MODEL',
    label: 'Auto-gen Sonnet model',
    description:
      'Which Sonnet model the auto-generation balancer uses when a batch is routed to the Sonnet family. See the Opus model setting above for how the family is chosen (whichever of Opus / Sonnet has more of its separate weekly budget remaining).',
    type: 'string',
    group: 'auto-generation',
    options: [{ value: ClaudeModel.CLAUDE_SONNET_4_6, label: 'Claude Sonnet 4.6' }],
  },
  {
    key: 'AUTOMATED_GENERATION_WINDOW',
    label: 'Automated generation window',
    description:
      'When the nightly job is allowed to run. The window is enforced in code against the current Eastern time, so it can be changed here without redeploying.',
    type: 'string',
    group: 'auto-generation',
    options: Object.values(AutoGenWindow).map((window) => ({
      value: window,
      label: AUTO_GEN_WINDOWS[window].label,
      helpNote: AUTO_GEN_WINDOWS[window].description,
    })),
  },
  {
    key: 'AUTOMATED_GENERATION_ENTITY',
    label: 'Automated generation entity',
    description: 'Which report types the nightly job generates — stocks, ETFs, or both.',
    type: 'string',
    group: 'auto-generation',
    options: Object.values(AutoGenEntity).map((entity) => ({
      value: entity,
      label: AUTO_GEN_ENTITY_INFO[entity].label,
      helpNote: AUTO_GEN_ENTITY_INFO[entity].description,
    })),
  },
  {
    key: 'GOOGLE_API_KEY',
    label: 'Google / Gemini API key',
    description: 'API key for the Gemini provider — report generation and grounded (Google Search) responses.',
    type: 'string',
    group: 'provider-keys',
    secret: true,
  },
  {
    key: 'ANTHROPIC_OAUTH_REFRESH_TOKEN',
    label: 'Claude OAuth refresh token',
    description: 'Long-lived Claude subscription refresh token (sk-ant-ort…). Exchanged on demand for short-lived access tokens; rotations persist to S3.',
    type: 'string',
    group: 'claude-auth',
    secret: true,
  },
  {
    key: 'ANTHROPIC_OAUTH_TOKEN',
    label: 'Claude OAuth static access token (fallback)',
    description: 'Static Claude access token (sk-ant-oat…) used only if the refresh flow fails. Short-lived — for bootstrap / dev.',
    type: 'string',
    group: 'claude-auth',
    secret: true,
  },
];

export const APP_CONFIG_KEYS: string[] = APP_CONFIG_DEFINITIONS.map((d) => d.key);
