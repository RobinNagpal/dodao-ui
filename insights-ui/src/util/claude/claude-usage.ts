import { ANTHROPIC_BETA, DEFAULT_BASE_URL, DEFAULT_CC_VERSION } from '@/util/claude/claude-oauth-client';

/**
 * Reads the Claude **subscription** usage from Anthropic's OAuth usage endpoint
 * (`GET /api/oauth/usage`) — the same source Claude Code's `/usage` command
 * reads. Unlike the coarse `anthropic-ratelimit-unified-status` header (a
 * traffic light), this returns the exact numeric utilization (%) and reset time
 * for each limit window, and it costs zero message quota (a plain GET).
 *
 * Windows returned (see {@link ClaudeSubscriptionUsage}):
 *   - 5-hour rolling session — shared budget across all models (Opus, Sonnet).
 *   - weekly "all" — the combined weekly limit.
 *   - weekly per-model (Opus / Sonnet) — separate weekly limits, when the plan
 *     scopes them (null otherwise).
 */

const USAGE_PATH = '/api/oauth/usage';

export interface ClaudeUsageWindow {
  /** Percent of the window consumed (0–100), or null if the plan doesn't expose it. */
  utilizationPct: number | null;
  /** ISO timestamp when this window resets, if known. */
  resetsAt: string | null;
  /** `normal` | `warning` | `rejected` (as reported in the `limits` array), if known. */
  severity: string | null;
  /** Whether this window is the one currently rate-limiting the account. */
  isActive: boolean;
}

export interface ClaudeSubscriptionUsage {
  /** Rolling 5-hour session window — shared across Opus and Sonnet. */
  fiveHour: ClaudeUsageWindow;
  /** Combined weekly window (all models). */
  weeklyAll: ClaudeUsageWindow;
  /** Per-model weekly window for Opus, or null if the plan doesn't scope it. */
  weeklyOpus: ClaudeUsageWindow | null;
  /** Per-model weekly window for Sonnet, or null if the plan doesn't scope it. */
  weeklySonnet: ClaudeUsageWindow | null;
  /** Full parsed body, for inspection / future fields. */
  raw: unknown;
}

interface UsageWindowJson {
  utilization: number | null;
  resets_at: string | null;
}

interface UsageLimitJson {
  kind: string;
  group: string;
  percent: number | null;
  severity: string | null;
  resets_at: string | null;
  is_active: boolean;
  scope?: { model?: { id: string | null; display_name: string | null } | null } | null;
}

interface UsageResponseJson {
  five_hour?: UsageWindowJson | null;
  seven_day?: UsageWindowJson | null;
  seven_day_opus?: UsageWindowJson | null;
  seven_day_sonnet?: UsageWindowJson | null;
  limits?: UsageLimitJson[] | null;
}

/** Merges the top-level window object with its matching `limits[]` entry (for severity / is_active). */
function toWindow(window: UsageWindowJson | null | undefined, limit: UsageLimitJson | undefined): ClaudeUsageWindow {
  return {
    utilizationPct: window?.utilization ?? limit?.percent ?? null,
    resetsAt: window?.resets_at ?? limit?.resets_at ?? null,
    severity: limit?.severity ?? null,
    isActive: limit?.is_active ?? false,
  };
}

/** Builds a per-model weekly window from either the typed field or a `weekly_scoped` limit; null if neither exists. */
function toScopedWeekly(window: UsageWindowJson | null | undefined, limit: UsageLimitJson | undefined): ClaudeUsageWindow | null {
  if (!window && !limit) return null;
  return toWindow(window, limit);
}

export interface GetClaudeUsageOptions {
  /** OAuth token override; defaults to `ANTHROPIC_OAUTH_TOKEN`. */
  oauthToken?: string;
  /** API base URL; defaults to `ANTHROPIC_BASE_URL` env, else the real API. */
  baseUrl?: string;
}

/**
 * Fetches the current subscription usage. Throws if the OAuth token is missing
 * or the endpoint returns a non-2xx response.
 */
export async function getClaudeSubscriptionUsage(options: GetClaudeUsageOptions = {}): Promise<ClaudeSubscriptionUsage> {
  const oauthToken = options.oauthToken ?? process.env.ANTHROPIC_OAUTH_TOKEN;
  if (!oauthToken) {
    throw new Error('ANTHROPIC_OAUTH_TOKEN is not set. Export your Claude subscription OAuth token (sk-ant-oat...) before reading usage.');
  }

  const baseUrl = (options.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  const ccVersion = process.env.CLAUDE_CODE_VERSION ?? DEFAULT_CC_VERSION;

  const response = await fetch(`${baseUrl}${USAGE_PATH}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-beta': ANTHROPIC_BETA,
      authorization: `Bearer ${oauthToken}`,
      'x-app': 'cli',
      'user-agent': `claude-cli/${ccVersion} (external, cli)`,
    },
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Anthropic usage endpoint error ${response.status} ${response.statusText}: ${responseText}`);
  }

  const json = JSON.parse(responseText) as UsageResponseJson;
  const limits = json.limits ?? [];
  const limitOfKind = (kind: string): UsageLimitJson | undefined => limits.find((l) => l.kind === kind);
  const weeklyScopedFor = (modelName: string): UsageLimitJson | undefined =>
    limits.find((l) => l.kind === 'weekly_scoped' && (l.scope?.model?.display_name ?? '').toLowerCase() === modelName);

  return {
    fiveHour: toWindow(json.five_hour, limitOfKind('session')),
    weeklyAll: toWindow(json.seven_day, limitOfKind('weekly_all')),
    weeklyOpus: toScopedWeekly(json.seven_day_opus, weeklyScopedFor('opus')),
    weeklySonnet: toScopedWeekly(json.seven_day_sonnet, weeklyScopedFor('sonnet')),
    raw: json,
  };
}
