import axios from 'axios';

/**
 * Helpers for posting alerts to a Discord webhook without tripping Discord's limits.
 *
 * - Embeds are truncated to Discord's documented limits so they are never rejected with a 400.
 * - A 429 pauses Discord delivery for `retry_after`; alerts raised while paused are counted (not posted)
 *   and the count is reported with the next alert that is posted.
 *
 * This only throttles the Discord delivery. Callers must still console.error the original error.
 */

export const DISCORD_LIMITS = {
  content: 2000,
  title: 256,
  description: 4096,
  fieldName: 256,
  fieldValue: 1024,
  footer: 2048,
  authorName: 256,
  fields: 25,
  embeds: 10,
  total: 6000,
} as const;

const TRUNCATED_SUFFIX = '…(truncated)';
const EMPTY_PLACEHOLDER = '----';
const DEFAULT_RETRY_AFTER_MS = 5_000;
const MAX_RETRY_AFTER_MS = 10 * 60_000;
const FAILURE_BODY_MAX = 300;

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  fields?: DiscordEmbedField[];
  footer?: { text: string; [key: string]: unknown };
  author?: { name: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  [key: string]: unknown;
}

export type DiscordPostResult = 'posted' | 'skipped' | 'rate_limited' | 'failed';

/** Truncates `value` to `max` characters (including the suffix). Empty/non-string values become a placeholder when `required`. */
export function truncateForDiscord(value: unknown, max: number, required = false): string {
  let text = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
  if (required && text.trim().length === 0) text = EMPTY_PLACEHOLDER;
  if (text.length <= max) return text;
  if (max <= TRUNCATED_SUFFIX.length) return text.slice(0, max);
  return text.slice(0, max - TRUNCATED_SUFFIX.length) + TRUNCATED_SUFFIX;
}

function embedLength(embed: DiscordEmbed): number {
  let total = (embed.title?.length ?? 0) + (embed.description?.length ?? 0);
  total += embed.footer?.text?.length ?? 0;
  total += embed.author?.name?.length ?? 0;
  for (const f of embed.fields ?? []) total += f.name.length + f.value.length;
  return total;
}

/** Returns a copy of the payload that fits within Discord's webhook/embed limits. */
export function sanitizeDiscordPayload(payload: DiscordWebhookPayload): DiscordWebhookPayload {
  const result: DiscordWebhookPayload = { ...payload };
  if (payload.content !== undefined) result.content = truncateForDiscord(payload.content, DISCORD_LIMITS.content);
  if (!payload.embeds) return result;

  const embeds: DiscordEmbed[] = payload.embeds.slice(0, DISCORD_LIMITS.embeds).map((embed) => {
    const e: DiscordEmbed = { ...embed };
    if (embed.title !== undefined) e.title = truncateForDiscord(embed.title, DISCORD_LIMITS.title);
    if (embed.description !== undefined) e.description = truncateForDiscord(embed.description, DISCORD_LIMITS.description);
    if (embed.footer) e.footer = { ...embed.footer, text: truncateForDiscord(embed.footer.text, DISCORD_LIMITS.footer, true) };
    if (embed.author) e.author = { ...embed.author, name: truncateForDiscord(embed.author.name, DISCORD_LIMITS.authorName, true) };
    if (embed.fields) {
      e.fields = embed.fields.slice(0, DISCORD_LIMITS.fields).map((f) => ({
        ...f,
        name: truncateForDiscord(f.name, DISCORD_LIMITS.fieldName, true),
        value: truncateForDiscord(f.value, DISCORD_LIMITS.fieldValue, true),
      }));
    }
    return e;
  });

  // Enforce the 6000-character total across all embeds by repeatedly shortening the longest text slot
  // (title, description, footer, author, field names and values).
  let overflow = embeds.reduce((sum, e) => sum + embedLength(e), 0) - DISCORD_LIMITS.total;
  const minLen = TRUNCATED_SUFFIX.length + 4;
  type Slot = { get: () => string; set: (v: string) => void };
  const slots: Slot[] = [];
  for (const e of embeds) {
    slots.push({ get: () => e.title ?? '', set: (v) => (e.title = v) });
    slots.push({ get: () => e.description ?? '', set: (v) => (e.description = v) });
    if (e.footer) slots.push({ get: () => e.footer!.text, set: (v) => (e.footer!.text = v) });
    if (e.author) slots.push({ get: () => e.author!.name, set: (v) => (e.author!.name = v) });
    for (const f of e.fields ?? []) {
      slots.push({ get: () => f.name, set: (v) => (f.name = v) });
      slots.push({ get: () => f.value, set: (v) => (f.value = v) });
    }
  }
  while (overflow > 0) {
    let target: Slot | null = null;
    let longest = minLen;
    for (const slot of slots) {
      const len = slot.get().length;
      if (len > longest) {
        longest = len;
        target = slot;
      }
    }
    if (!target) break; // nothing left that can be shortened
    const current = target.get();
    const base = current.endsWith(TRUNCATED_SUFFIX) ? current.slice(0, -TRUNCATED_SUFFIX.length) : current;
    const shortened = truncateForDiscord(base, Math.max(minLen, current.length - overflow));
    overflow -= current.length - shortened.length;
    target.set(shortened);
  }

  result.embeds = embeds;
  return result;
}

interface DiscordRateLimitState {
  pausedUntil: number;
  skipped: number;
}

const STATE_KEY = '__dodaoDiscordWebhookRateLimit';

function getState(): DiscordRateLimitState {
  const g = globalThis as unknown as Record<string, DiscordRateLimitState | undefined>;
  if (!g[STATE_KEY]) g[STATE_KEY] = { pausedUntil: 0, skipped: 0 };
  return g[STATE_KEY] as DiscordRateLimitState;
}

/** For tests: resets the module-level pause/skip counters. */
export function resetDiscordRateLimitState(): void {
  const state = getState();
  state.pausedUntil = 0;
  state.skipped = 0;
}

function parseRetryAfterMs(err: any): number {
  const body = err?.response?.data;
  let seconds = Number(body?.retry_after);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    const header = err?.response?.headers?.['retry-after'] ?? err?.response?.headers?.['x-ratelimit-reset-after'];
    seconds = Number(header);
  }
  if (!Number.isFinite(seconds) || seconds <= 0) return DEFAULT_RETRY_AFTER_MS;
  return Math.min(Math.ceil(seconds * 1000), MAX_RETRY_AFTER_MS);
}

function conciseFailure(err: any): string {
  const status = err?.response?.status;
  if (status !== undefined) {
    const body = err.response.data;
    const bodyText = typeof body === 'string' ? body : JSON.stringify(body ?? null);
    return `status=${status} body=${truncateForDiscord(bodyText, FAILURE_BODY_MAX)}`;
  }
  const code = err?.code ? `code=${err.code} ` : '';
  return `${code}error=${truncateForDiscord(err?.message ?? String(err), FAILURE_BODY_MAX)}`;
}

/**
 * Posts a payload to a Discord webhook, respecting Discord's limits and rate limits.
 * Never throws; failures are reported as a single concise console.warn line.
 */
export async function postToDiscordWebhook(webhookUrl: string | undefined, payload: DiscordWebhookPayload): Promise<DiscordPostResult> {
  if (!webhookUrl) {
    console.warn('[errorLogger] Discord webhook URL not configured; skipping Discord post');
    return 'failed';
  }

  const state = getState();
  if (Date.now() < state.pausedUntil) {
    state.skipped += 1;
    return 'skipped';
  }

  const skipped = state.skipped;
  state.skipped = 0;
  const data = sanitizeDiscordPayload(
    skipped > 0
      ? {
          ...payload,
          content: `${payload.content ?? ''}\n⚠️ ${skipped} alert(s) were not posted to Discord while rate-limited (see Grafana Loki)`.trim(),
        }
      : payload
  );

  try {
    await axios.post(webhookUrl, data);
    return 'posted';
  } catch (err: any) {
    if (err?.response?.status === 429) {
      // This alert (and any carried-over count) was not delivered; report it with the next post.
      state.skipped += skipped + 1;
      const retryAfterMs = parseRetryAfterMs(err);
      const alreadyPaused = Date.now() < state.pausedUntil;
      state.pausedUntil = Math.max(state.pausedUntil, Date.now() + retryAfterMs);
      if (!alreadyPaused) {
        console.warn(`[errorLogger] Discord rate-limited; pausing alerts for ${(retryAfterMs / 1000).toFixed(1)}s`);
      }
      return 'rate_limited';
    }
    // Restore the carried-over count so it is reported with the next successful post.
    state.skipped += skipped;
    console.warn(`[errorLogger] Failed to post to Discord webhook: ${conciseFailure(err)}`);
    return 'failed';
  }
}
