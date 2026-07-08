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

/** Anthropic rejects OAuth requests unless this is the first system block. */
export const CLAUDE_CODE_IDENTITY = "You are Claude Code, Anthropic's official CLI for Claude.";

const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-opus-4-7';
const DEFAULT_CC_VERSION = '2.1.80';

/** Beta flags Claude Code sends; `oauth-2025-04-20` is the one that matters for OAuth. */
const ANTHROPIC_BETA = 'oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14,prompt-caching-scope-2026-01-05';

/** Effort levels supported by `output_config.effort` on Opus-tier models. */
export type ClaudeEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface CallClaudeOAuthOptions {
  /** The user prompt to send. */
  prompt: string;
  /** Optional extra system instructions, appended AFTER the required identity block. */
  system?: string;
  /** Model id. Defaults to `LLM_MODEL` env, else `claude-opus-4-7`. */
  model?: string;
  /** Response length cap. Defaults to 1024. */
  maxTokens?: number;
  /** OAuth token. Defaults to the `ANTHROPIC_OAUTH_TOKEN` env var. */
  oauthToken?: string;
  /** API base URL. Defaults to `ANTHROPIC_BASE_URL` env, else the real API. */
  baseUrl?: string;
  /** Optional `output_config.effort` (thinking/spend depth). Omit to leave it unset. */
  effort?: ClaudeEffort;
}

export interface CallClaudeOAuthResult {
  /** Concatenated text of Claude's answer. */
  text: string;
  /** Model that actually served the request. */
  model: string;
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number };
  /** Full parsed JSON body, for inspection during testing. */
  raw: unknown;
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
  const oauthToken = options.oauthToken ?? process.env.ANTHROPIC_OAUTH_TOKEN;
  if (!oauthToken) {
    throw new Error('ANTHROPIC_OAUTH_TOKEN is not set. Export your Claude subscription OAuth token (sk-ant-oat...) before calling.');
  }

  const prompt = options.prompt?.trim();
  if (!prompt) {
    throw new Error('callClaudeWithOAuth requires a non-empty prompt.');
  }

  const model = options.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL;
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

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-beta': ANTHROPIC_BETA,
      authorization: `Bearer ${oauthToken}`,
      'x-app': 'cli',
      'user-agent': `claude-cli/${ccVersion} (external, cli)`,
      'x-anthropic-billing-header': `cc_version=${ccVersion}.${model}; cc_entrypoint=cli;`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status} ${response.statusText}: ${responseText}`);
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
    raw: json,
  };
}
