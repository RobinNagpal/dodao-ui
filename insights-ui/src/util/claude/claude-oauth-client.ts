/**
 * Standalone, dependency-free client for calling the Anthropic Messages API
 * directly with a Claude **subscription OAuth token** (`sk-ant-oat...`) instead
 * of a metered `x-api-key`.
 *
 * OAuth tokens are not API keys — Anthropic only accepts them when the request
 * looks like it came from the Claude Code CLI:
 *   1. Auth via `Authorization: Bearer <token>` (NOT `x-api-key`).
 *   2. The `oauth-2025-04-20` beta flag (plus the other Claude Code betas).
 *   3. A system prompt whose FIRST block is the exact Claude Code identity
 *      string. Anything else is rejected.
 *   4. CLI-style `x-app` / `user-agent` / billing headers.
 *
 * This is the same header/identity "spoofing" the reference auth proxy does,
 * but we make the call directly here instead of proxying. It is intentionally
 * kept separate from the rest of the app (no shared client, no SDK) so it can
 * be tested in isolation before being wired into any workflow.
 */

import { getClaudeAccessToken, invalidateClaudeAccessToken } from '@/util/claude/claude-token-provider';

/** Anthropic rejects OAuth requests unless this is the first system block. */
export const CLAUDE_CODE_IDENTITY = "You are Claude Code, Anthropic's official CLI for Claude.";

/** Default Anthropic API host; also used for the OAuth usage endpoint. */
export const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-opus-4-7';
/** Claude Code version string sent in the CLI-spoofing headers. */
export const DEFAULT_CC_VERSION = '2.1.80';

/** Beta flags Claude Code sends; `oauth-2025-04-20` is the one that matters for OAuth. */
export const ANTHROPIC_BETA = 'oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14,prompt-caching-scope-2026-01-05';

/** Effort levels supported by `output_config.effort` on Opus-tier models. */
export type ClaudeEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface CallClaudeOAuthOptions {
  /** The user prompt to send. */
  prompt: string;
  /** Optional extra system instructions, appended AFTER the required identity block. */
  system?: string;
  /** Model id. Defaults to `claude-opus-4-7`. */
  model?: string;
  /** Response length cap. Defaults to 1024. */
  maxTokens?: number;
  /**
   * Explicit OAuth access token. When omitted, the token provider supplies one —
   * refreshing a long-lived refresh token as needed (see claude-token-provider).
   */
  oauthToken?: string;
  /** API base URL. Defaults to `ANTHROPIC_BASE_URL` env, else the real API. */
  baseUrl?: string;
  /** Optional `output_config.effort` (thinking/spend depth). Omit to leave it unset. */
  effort?: ClaudeEffort;
}

/**
 * Rate-limit / subscription-usage signal Anthropic returns on the OAuth
 * subscription path. `unifiedStatus` is the `anthropic-ratelimit-unified-status`
 * header (`allowed` | `allowed_warning` | `rejected`) that Claude Code itself
 * reads to know whether the account's usage limit has been hit; the rest give
 * the caller the reset time so it can tell the user when access returns.
 */
export interface ClaudeRateLimitInfo {
  /** `anthropic-ratelimit-unified-status`: `allowed` | `allowed_warning` | `rejected` | null. */
  unifiedStatus: string | null;
  /** `anthropic-ratelimit-unified-reset` (RFC3339 or unix seconds), when the limit resets. */
  resetsAt: string | null;
  /** `retry-after` header, in seconds, if present (set on 429s). */
  retryAfterSeconds: number | null;
}

export interface CallClaudeOAuthResult {
  /** Concatenated text of Claude's answer. */
  text: string;
  /** Model that actually served the request. */
  model: string;
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number };
  /** Subscription usage / rate-limit headers from the response. */
  rateLimit: ClaudeRateLimitInfo;
  /** Full parsed JSON body, for inspection during testing. */
  raw: unknown;
}

/**
 * Thrown when the Anthropic Messages API returns a non-2xx response. Carries the
 * HTTP `status` and any rate-limit headers so callers can distinguish a usage-limit
 * rejection (429) from other failures without string-matching the message.
 */
export class ClaudeOAuthApiError extends Error {
  readonly status: number;
  readonly rateLimit: ClaudeRateLimitInfo;
  readonly body: string;

  constructor(status: number, statusText: string, body: string, rateLimit: ClaudeRateLimitInfo) {
    super(`Anthropic API error ${status} ${statusText}: ${body}`);
    this.name = 'ClaudeOAuthApiError';
    this.status = status;
    this.rateLimit = rateLimit;
    this.body = body;
  }
}

/** Reads the subscription usage / rate-limit headers Anthropic returns on OAuth requests. */
function parseRateLimitHeaders(headers: Headers): ClaudeRateLimitInfo {
  const retryAfterRaw = headers.get('retry-after');
  const retryAfterSeconds = retryAfterRaw !== null && retryAfterRaw.trim() !== '' ? Number(retryAfterRaw) : null;

  return {
    unifiedStatus: headers.get('anthropic-ratelimit-unified-status'),
    resetsAt: headers.get('anthropic-ratelimit-unified-reset'),
    retryAfterSeconds: retryAfterSeconds !== null && Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
  };
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  model: string;
  stop_reason: string | null;
  content: AnthropicTextBlock[];
  usage: { input_tokens: number; output_tokens: number };
}

/**
 * Calls `POST /v1/messages` with Claude Code OAuth spoofing and returns the
 * assistant's text plus token usage. Throws on a non-2xx response with the
 * upstream error body included.
 */
export async function callClaudeWithOAuth(options: CallClaudeOAuthOptions): Promise<CallClaudeOAuthResult> {
  const prompt = options.prompt?.trim();
  if (!prompt) {
    throw new Error('callClaudeWithOAuth requires a non-empty prompt.');
  }

  const model = options.model ?? DEFAULT_MODEL;
  const baseUrl = (options.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  const ccVersion = process.env.CLAUDE_CODE_VERSION ?? DEFAULT_CC_VERSION;

  // Identity block MUST come first; any caller-supplied system prompt follows it.
  const system: AnthropicTextBlock[] = [{ type: 'text', text: CLAUDE_CODE_IDENTITY }];
  if (options.system?.trim()) {
    system.push({ type: 'text', text: options.system.trim() });
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: options.maxTokens ?? 1024,
    system,
    messages: [{ role: 'user', content: prompt }],
  };

  // Effort is GA on Opus-tier models and is what Claude Code itself sends.
  // Only include it when asked so simple calls stay minimal.
  if (options.effort) {
    body.output_config = { effort: options.effort };
  }

  const sendWithToken = (token: string): Promise<Response> =>
    fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': ANTHROPIC_BETA,
        authorization: `Bearer ${token}`,
        'x-app': 'cli',
        'user-agent': `claude-cli/${ccVersion} (external, cli)`,
        'x-anthropic-billing-header': `cc_version=${ccVersion}.${model}; cc_entrypoint=cli;`,
      },
      body: JSON.stringify(body),
    });

  // When the caller supplies an explicit token we use it verbatim (no refresh).
  // Otherwise the provider hands us a fresh access token and can re-mint one on a 401.
  const usingProvider = !options.oauthToken;
  let response = await sendWithToken(options.oauthToken ?? (await getClaudeAccessToken()));

  // A managed access token can expire between mint and use; force one refresh + retry on 401.
  if (response.status === 401 && usingProvider) {
    invalidateClaudeAccessToken();
    response = await sendWithToken(await getClaudeAccessToken(true));
  }

  const responseText = await response.text();
  const rateLimit = parseRateLimitHeaders(response.headers);
  if (!response.ok) {
    throw new ClaudeOAuthApiError(response.status, response.statusText, responseText, rateLimit);
  }

  const json = JSON.parse(responseText) as AnthropicMessageResponse;

  const text = (json.content ?? [])
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('')
    .trim();

  return {
    text,
    model: json.model,
    stopReason: json.stop_reason ?? null,
    usage: {
      inputTokens: json.usage?.input_tokens ?? 0,
      outputTokens: json.usage?.output_tokens ?? 0,
    },
    rateLimit,
    raw: json,
  };
}
