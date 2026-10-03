/**
 * Dependency-free shipper for Grafana Cloud Logs (Loki).
 *
 * Why this exists: insights-ui runs on a Lightsail *container service*, which has no SSH and
 * no host filesystem, so a log agent (Grafana Alloy / Promtail) cannot be installed next to
 * it — and Lightsail container logs are not integrated with CloudWatch and keep only 3 days.
 * The app therefore has to push its own logs out. See docs/insights-ui/grafana-cloud-logging.md.
 *
 * Design constraints, all driven by the fact that this runs in-process on a single node that
 * also runs Puppeteer (see docs/insights-ui/crawler-blocking.md — CPU pressure there 502s the
 * whole site):
 *   - Entirely inert unless LOKI_URL + LOKI_USER_ID + LOKI_TOKEN are all set, so local dev
 *     and the Vercel deployment are unaffected.
 *   - Never blocks a request: callers enqueue and return; the HTTP push happens on a timer.
 *   - Bounded memory: a Loki outage drops the oldest lines instead of growing without limit.
 *   - Never throws and never recurses: a shipping failure is reported through the *original*
 *     console, which `serverLogger` hands over before it patches console.error.
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LokiEntry {
  level: LogLevel;
  /** Human-readable message. Ends up as `msg` in the JSON log line. */
  msg: string;
  /** Extra structured fields merged into the JSON log line (route, stack, digest, …). */
  fields?: Record<string, unknown>;
}

/** Lines per push request. Loki is happy with far more; this keeps each request small. */
const MAX_BATCH = 100;
/** Hard cap on buffered lines. Past this the oldest are dropped (and counted). */
const MAX_QUEUE = 1000;
const FLUSH_INTERVAL_MS = 2000;
const PUSH_TIMEOUT_MS = 5000;
/** Loki's own default line limit is 256 KB; cap well below it to keep ingest volume sane. */
const MAX_LINE_CHARS = 16000;

const ALL_LEVELS: readonly LogLevel[] = ['error', 'warn', 'info', 'debug'];
const DEFAULT_LEVELS: readonly LogLevel[] = ['error', 'warn'];

interface LokiConfig {
  url: string;
  userId: string;
  token: string;
  service: string;
  env: string;
  levels: Set<LogLevel>;
}

// `undefined` = not resolved yet, `null` = resolved and disabled.
let config: LokiConfig | null | undefined;

function isLogLevel(value: string): value is LogLevel {
  return (ALL_LEVELS as readonly string[]).includes(value);
}

function getConfig(): LokiConfig | null {
  if (config !== undefined) {
    return config;
  }

  const url = process.env.LOKI_URL?.trim();
  const userId = process.env.LOKI_USER_ID?.trim();
  const token = process.env.LOKI_TOKEN?.trim();
  if (!url || !userId || !token) {
    config = null;
    return config;
  }

  // Only error+warn by default. `console.log` is extremely chatty in this app (every request
  // logs several lines from the withErrorHandling* wrappers), so shipping `info` is opt-in.
  const levels = (process.env.LOKI_LOG_LEVELS || DEFAULT_LEVELS.join(','))
    .split(',')
    .map((level) => level.trim().toLowerCase())
    .filter(isLogLevel);

  config = {
    url,
    userId,
    token,
    service: process.env.LOKI_SERVICE_NAME || 'insights-ui',
    env: process.env.LOKI_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
    levels: new Set(levels.length > 0 ? levels : DEFAULT_LEVELS),
  };
  return config;
}

/** Whether log shipping is configured for this runtime. */
export function isLokiEnabled(): boolean {
  return getConfig() !== null;
}

/**
 * Masks credential-shaped substrings. Error stacks and request dumps routinely carry
 * connection strings and API keys, and a log line is a lot easier to leak than an env var —
 * `deployments/insights-ui/observability.tf` even contemplates a publicly shared dashboard.
 */
const REDACTIONS: ReadonlyArray<readonly [RegExp, string]> = [
  // Credentials embedded in any URL: postgresql://user:pw@host → postgresql://user:***@host
  [/(\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+):[^\s@/]+@/gi, '$1:***@'],
  // Anthropic keys / OAuth tokens: sk-ant-oat01-…, sk-ant-ort01-…
  [/\b(sk-ant-[a-z0-9]+-)[A-Za-z0-9_-]{8,}/gi, '$1***'],
  // Stripe secret/restricted/publishable keys and webhook secrets.
  [/\b((?:sk|rk|pk)_(?:live|test)_)[A-Za-z0-9]{8,}/g, '$1***'],
  [/\bwhsec_[A-Za-z0-9]{8,}/g, 'whsec_***'],
  // AWS access key IDs.
  [/\b(AKIA|ASIA)[0-9A-Z]{12,}/g, '$1***'],
  // JWTs / NextAuth session tokens — keep the header, drop payload + signature.
  [/\b(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '$1.***.***'],
  // `"authorization": "…"`, `api_key=…`, `secret: …` and friends.
  [/\b(authorization|api[-_]?key|secret|token|password)(["']?\s*[:=]\s*["']?)[^\s"',}]{8,}/gi, '$1$2***'],
];

export function redactSecrets(value: string): string {
  let redacted = value;
  for (const [pattern, replacement] of REDACTIONS) {
    redacted = redacted.replace(pattern, replacement);
  }
  return redacted;
}

interface QueuedEntry {
  level: LogLevel;
  /** Unix epoch nanoseconds, as a string — Loki returns 400 for a numeric timestamp. */
  ts: string;
  line: string;
}

const queue: QueuedEntry[] = [];
let droppedLines = 0;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;

// Loki de-duplicates identical (timestamp, line) pairs within a stream, so two identical
// messages in the same millisecond would collapse into one. Nanosecond precision isn't
// available from Date.now(), so synthesise a strictly increasing sub-millisecond counter.
let lastMs = 0;
let subMsSeq = 0;

function nextTimestampNs(): string {
  const ms = Date.now();
  if (ms === lastMs) {
    subMsSeq = Math.min(subMsSeq + 1, 999999);
  } else {
    lastMs = ms;
    subMsSeq = 0;
  }
  return `${ms}${String(subMsSeq).padStart(6, '0')}`;
}

let reportShipperFailure: (message: string) => void = (message) => console.error(message);

/**
 * Hands the shipper a pristine `console.error`. `serverLogger` calls this *before* patching
 * console, so a failed push can never be re-queued as a new error line (infinite loop).
 */
export function setShipperErrorReporter(reporter: (message: string) => void): void {
  reportShipperFailure = reporter;
}

function buildLine(entry: LokiEntry): string {
  let line: string;
  try {
    line = JSON.stringify({ level: entry.level, msg: entry.msg, ...entry.fields });
  } catch {
    // Circular or otherwise unserialisable `fields` — keep the message rather than losing the line.
    line = JSON.stringify({ level: entry.level, msg: entry.msg, fieldsError: 'unserializable' });
  }
  return redactSecrets(line).slice(0, MAX_LINE_CHARS);
}

/** Queue one log line. Cheap, synchronous, never throws. */
export function shipToLoki(entry: LokiEntry): void {
  const cfg = getConfig();
  if (!cfg || !cfg.levels.has(entry.level)) {
    return;
  }

  if (queue.length >= MAX_QUEUE) {
    queue.shift();
    droppedLines++;
  }
  queue.push({ level: entry.level, ts: nextTimestampNs(), line: buildLine(entry) });

  if (queue.length >= MAX_BATCH) {
    void flushLoki();
  } else {
    scheduleFlush();
  }
}

function scheduleFlush(): void {
  if (flushTimer) {
    return;
  }
  const timer = setTimeout(() => {
    flushTimer = null;
    void flushLoki();
  }, FLUSH_INTERVAL_MS);
  // Never hold the Node process open just to flush logs.
  (timer as unknown as { unref?: () => void }).unref?.();
  flushTimer = timer;
}

/**
 * Push the buffered lines. Safe to call concurrently — overlapping calls await the in-flight
 * request instead of interleaving pushes (which would scramble per-stream ordering).
 */
export async function flushLoki(): Promise<void> {
  if (inFlight) {
    return inFlight;
  }
  const cfg = getConfig();
  if (!cfg || queue.length === 0) {
    return;
  }

  inFlight = pushBatch(cfg).finally(() => {
    inFlight = null;
    if (queue.length > 0) {
      scheduleFlush();
    }
  });
  return inFlight;
}

async function pushBatch(cfg: LokiConfig): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const batch = queue.splice(0, MAX_BATCH);
  if (droppedLines > 0) {
    batch.push({
      level: 'warn',
      ts: nextTimestampNs(),
      line: JSON.stringify({ level: 'warn', msg: `Log shipper dropped ${droppedLines} lines (buffer full)`, source: 'loki-shipper' }),
    });
    droppedLines = 0;
  }

  // One stream per level. Loki labels must stay low-cardinality (a label per route or ticker
  // would explode the index), so everything else lives inside the JSON line and is queried
  // with `| json` instead.
  const byLevel = new Map<LogLevel, [string, string][]>();
  for (const entry of batch) {
    const values = byLevel.get(entry.level);
    if (values) {
      values.push([entry.ts, entry.line]);
    } else {
      byLevel.set(entry.level, [[entry.ts, entry.line]]);
    }
  }

  const body = JSON.stringify({
    streams: Array.from(byLevel.entries()).map(([level, values]) => ({
      stream: { service: cfg.service, env: cfg.env, level },
      values,
    })),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUSH_TIMEOUT_MS);
  try {
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${cfg.userId}:${cfg.token}`).toString('base64')}`,
      },
      body,
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      reportShipperFailure(`[lokiClient] push failed: ${res.status} ${res.statusText} ${detail.slice(0, 300)}`);
    }
  } catch (e) {
    reportShipperFailure(`[lokiClient] push errored: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    clearTimeout(timeout);
  }
}
