import { getDefaultClaudeModel } from '@/types/llmConstants';
import { ClaudeOAuthApiError, callClaudeWithOAuth } from '@/util/claude/claude-oauth-client';

/**
 * Pre-flight check for the Claude **subscription** usage limit, so report
 * generation can fail fast with a clear message instead of erroring partway
 * through when the account's limit is already exhausted.
 *
 * There is no cheap dedicated "usage" endpoint for a subscription OAuth token —
 * the mechanism Claude Code itself uses is the rate-limit headers Anthropic
 * returns on any Messages request:
 *   - `anthropic-ratelimit-unified-status: rejected` means the limit is hit, and
 *   - once the limit is exhausted even a tiny request returns HTTP 429.
 * So we send a minimal 1-token probe and inspect the response. The probe is
 * negligible next to a real report call (a single 32k-token, high-effort
 * generation), and its result is cached briefly so the many sequential section
 * calls in one generation run don't each re-probe.
 */

/** How long an "allowed" result is trusted before we probe again. */
const ALLOWED_CACHE_TTL_MS = 60_000;

export interface ClaudeUsageLimitStatus {
  /** True when the subscription usage limit is exhausted (probe rejected or 429). */
  exceeded: boolean;
  /** Raw `anthropic-ratelimit-unified-status` value, when available. */
  unifiedStatus: string | null;
  /** When the limit resets, if Anthropic reported it. */
  resetsAt: string | null;
  /** Seconds to wait before retrying, from the `retry-after` header on a 429. */
  retryAfterSeconds: number | null;
}

/** Thrown by {@link assertClaudeUsageLimitNotExceeded} when the limit is exhausted. */
export class ClaudeUsageLimitExceededError extends Error {
  readonly resetsAt: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(status: ClaudeUsageLimitStatus) {
    const resetHint = status.resetsAt
      ? ` It resets at ${status.resetsAt}.`
      : status.retryAfterSeconds
      ? ` Try again in about ${status.retryAfterSeconds}s.`
      : '';
    super(`Claude subscription usage limit reached; cannot generate reports right now.${resetHint}`);
    this.name = 'ClaudeUsageLimitExceededError';
    this.resetsAt = status.resetsAt;
    this.retryAfterSeconds = status.retryAfterSeconds;
  }
}

export interface CheckClaudeUsageLimitOptions {
  /** Model to probe with. Defaults to `getDefaultClaudeModel()`. */
  model?: string;
  /** OAuth token override; defaults to `ANTHROPIC_OAUTH_TOKEN`. */
  oauthToken?: string;
  /** Skip the short-lived "allowed" cache and always probe. */
  force?: boolean;
}

let allowedCacheExpiresAt = 0;

/**
 * Probes Claude and reports whether the subscription usage limit is exhausted.
 * Returns `exceeded: true` on an `anthropic-ratelimit-unified-status: rejected`
 * header or an HTTP 429. Non-limit API errors (bad token, connectivity) are
 * re-thrown so real misconfiguration surfaces rather than silently passing.
 */
export async function checkClaudeUsageLimit(options: CheckClaudeUsageLimitOptions = {}): Promise<ClaudeUsageLimitStatus> {
  if (!options.force && Date.now() < allowedCacheExpiresAt) {
    return { exceeded: false, unifiedStatus: 'allowed', resetsAt: null, retryAfterSeconds: null };
  }

  try {
    const { rateLimit } = await callClaudeWithOAuth({
      prompt: 'ping',
      model: options.model ?? getDefaultClaudeModel(),
      maxTokens: 1,
      oauthToken: options.oauthToken,
    });

    const exceeded = rateLimit.unifiedStatus === 'rejected';
    if (!exceeded) {
      allowedCacheExpiresAt = Date.now() + ALLOWED_CACHE_TTL_MS;
    }
    return {
      exceeded,
      unifiedStatus: rateLimit.unifiedStatus,
      resetsAt: rateLimit.resetsAt,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  } catch (err) {
    if (err instanceof ClaudeOAuthApiError && err.status === 429) {
      return {
        exceeded: true,
        unifiedStatus: err.rateLimit.unifiedStatus ?? 'rejected',
        resetsAt: err.rateLimit.resetsAt,
        retryAfterSeconds: err.rateLimit.retryAfterSeconds,
      };
    }
    // Not a usage-limit signal (e.g. auth/connectivity) — let the caller see it.
    throw err;
  }
}

/**
 * Throws {@link ClaudeUsageLimitExceededError} if the Claude subscription usage
 * limit is exhausted. Call this before kicking off Claude report generation.
 */
export async function assertClaudeUsageLimitNotExceeded(options: CheckClaudeUsageLimitOptions = {}): Promise<void> {
  const status = await checkClaudeUsageLimit(options);
  if (status.exceeded) {
    throw new ClaudeUsageLimitExceededError(status);
  }
}
