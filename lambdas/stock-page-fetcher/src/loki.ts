/**
 * Ships this Lambda's warn/error lines to the same Grafana Cloud Loki stack as
 * insights-ui, under their own labels:
 *
 *   {service="stock-page-fetcher", platform="lambda", env="production", level="error|warn"}
 *
 * Lines are buffered during an invocation and pushed in one request by
 * `flushLoki()`, which the handler awaits before returning (a frozen Lambda
 * cannot finish a background push). Invocations that log nothing push nothing.
 * Everything is also written to stdout, so CloudWatch keeps a copy.
 *
 * Inert unless LOKI_URL, LOKI_USER_ID and LOKI_TOKEN are set. A failed push is
 * written to CloudWatch and never fails the invocation.
 */

type Level = 'error' | 'warn' | 'info';

const LOKI_URL: string = process.env.LOKI_URL || '';
const LOKI_USER_ID: string = process.env.LOKI_USER_ID || '';
const LOKI_TOKEN: string = process.env.LOKI_TOKEN || '';
const ENABLED: boolean = !!(LOKI_URL && LOKI_USER_ID && LOKI_TOKEN);

const LABELS = { service: 'stock-page-fetcher', platform: 'lambda', env: process.env.LOKI_ENV || 'production' } as const;
const PUSH_TIMEOUT_MS = 2000;

let buffer: Array<{ level: Level; ts: string; line: string }> = [];
let lastNs = BigInt(0);

// Loki drops identical (timestamp, line) pairs within a stream; keep timestamps strictly increasing.
function nextTimestampNs(): string {
  const now: bigint = BigInt(Date.now()) * BigInt(1_000_000);
  lastNs = now > lastNs ? now : lastNs + BigInt(1);
  return lastNs.toString();
}

/** Log one line to stdout and, for warn/error, queue it for Loki. */
export function log(level: Level, msg: string, fields: Record<string, unknown> = {}): void {
  const line: string = JSON.stringify({ level, msg, ...fields });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);

  if (ENABLED && level !== 'info') {
    buffer.push({ level, ts: nextTimestampNs(), line });
  }
}

/** Push buffered lines (one request, one stream per level). Safe to call when empty. */
export async function flushLoki(): Promise<void> {
  if (!ENABLED || buffer.length === 0) return;
  const batch = buffer;
  buffer = [];

  const byLevel = new Map<Level, [string, string][]>();
  for (const entry of batch) {
    const values = byLevel.get(entry.level) ?? [];
    values.push([entry.ts, entry.line]);
    byLevel.set(entry.level, values);
  }

  try {
    const response: Response = await fetch(new URL('/loki/api/v1/push', LOKI_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${LOKI_USER_ID}:${LOKI_TOKEN}`).toString('base64')}`,
      },
      body: JSON.stringify({
        streams: Array.from(byLevel.entries()).map(([level, values]) => ({ stream: { ...LABELS, level }, values })),
      }),
      signal: AbortSignal.timeout(PUSH_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`Loki push failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`Loki push failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
