import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import appConfigDefaults from '@/lib/appConfig/appConfigDefaults.json';
import { parseArgs, parsePositiveInt } from '../tickers/lib';

/**
 * Pull insights-ui logs from Grafana Cloud Loki for local triage.
 *
 *   pnpm logs:fetch                          # production error lines, last 24h, grouped summary
 *   pnpm logs:fetch --hours 6 --raw          # every line, oldest first
 *   pnpm logs:fetch --level all --grep scrap # all levels, lines matching a regex
 *   pnpm logs:fetch --out data/logs.jsonl    # save the raw lines as JSONL
 *   pnpm logs:fetch --service stock-page-fetcher   # the fetch-proxy Lambda's logs (`all` = both)
 *
 * Needs LOKI_READ_TOKEN (a Grafana Cloud token with `logs:read` scope) in insights-ui/.env.
 * The app's own LOKI_TOKEN App Setting is write-only and cannot query.
 * See docs/insights-ui/grafana-cloud-logging.md.
 */

const DEFAULT_HOURS = 24;
const DEFAULT_LIMIT = 5000;
// Loki rejects a single query_range request with a limit above this.
const PAGE_SIZE = 5000;

interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiQueryRangeResponse {
  status: string;
  data: { resultType: string; result: LokiStream[] };
}

interface LogLine {
  tsNs: string;
  time: string;
  level: string;
  env: string;
  msg: string;
  raw: string;
}

const defaults = appConfigDefaults as Record<string, string>;

function stringArg(args: Record<string, string | boolean>, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function buildQuery(args: Record<string, string | boolean>): string {
  const custom = stringArg(args, 'query');
  if (custom) {
    return custom;
  }
  const env = stringArg(args, 'env') ?? 'production';
  const level = stringArg(args, 'level') ?? 'error';
  // insights-ui (the app) or stock-page-fetcher (the fetch-proxy Lambda); `all` for both.
  const service = stringArg(args, 'service') ?? 'insights-ui';
  const selectors = [service === 'all' ? `service=~".+"` : `service="${service}"`, `env="${env}"`];
  if (level !== 'all') {
    selectors.push(`level=~"${level.replace(/,/g, '|')}"`);
  }
  const grep = stringArg(args, 'grep');
  return `{${selectors.join(', ')}}${grep ? ` |~ \`(?i)${grep}\`` : ''}`;
}

function toLogLine(stream: Record<string, string>, tsNs: string, raw: string): LogLine {
  let msg = raw;
  try {
    const parsed = JSON.parse(raw) as { msg?: unknown };
    if (typeof parsed.msg === 'string') {
      msg = parsed.msg;
    }
  } catch {
    // Not JSON — keep the raw line.
  }
  return {
    tsNs,
    time: new Date(Number(BigInt(tsNs) / BigInt(1_000_000))).toISOString(),
    level: stream.level ?? '',
    env: stream.env ?? '',
    msg,
    raw,
  };
}

async function queryRange(baseUrl: string, auth: string, query: string, startNs: bigint, endNs: bigint, limit: number): Promise<LogLine[]> {
  const url = new URL('/loki/api/v1/query_range', baseUrl);
  url.search = new URLSearchParams({
    query,
    start: startNs.toString(),
    end: endNs.toString(),
    limit: String(limit),
    direction: 'backward',
  }).toString();

  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) {
    throw new Error(`Loki query failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const body = (await res.json()) as LokiQueryRangeResponse;
  return body.data.result.flatMap((s) => s.values.map(([ts, line]) => toLogLine(s.stream, ts, line)));
}

/** Pages backwards from `end` until `limit` lines are collected or the window is exhausted. */
async function fetchLines(baseUrl: string, auth: string, query: string, startNs: bigint, endNs: bigint, limit: number): Promise<LogLine[]> {
  const lines: LogLine[] = [];
  let end = endNs;
  while (lines.length < limit) {
    const page = await queryRange(baseUrl, auth, query, startNs, end, Math.min(PAGE_SIZE, limit - lines.length));
    if (page.length === 0) {
      break;
    }
    lines.push(...page);
    // `end` is exclusive, so the oldest line's timestamp is the next page's upper bound.
    const oldest = page.reduce((min, l) => (BigInt(l.tsNs) < min ? BigInt(l.tsNs) : min), BigInt(page[0].tsNs));
    if (oldest <= startNs || page.length < Math.min(PAGE_SIZE, limit)) {
      break;
    }
    end = oldest;
  }
  return lines.sort((a, b) => (BigInt(a.tsNs) < BigInt(b.tsNs) ? -1 : 1));
}

/** Collapses tickers, numbers and URLs paths so the same error on different stocks groups together. */
function patternOf(msg: string): string {
  return msg
    .split('\n')[0]
    .slice(0, 200)
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/\(([A-Z0-9.\-]{1,12})\)/g, '(<sym>)')
    .replace(/\b(for|of) [A-Z0-9.\-]{1,12}\b/g, '$1 <sym>')
    .replace(/\d+/g, 'N');
}

function printSummary(lines: LogLine[]): void {
  const groups = new Map<string, { count: number; first: LogLine; last: LogLine }>();
  for (const line of lines) {
    const key = `${line.level}\t${patternOf(line.msg)}`;
    const group = groups.get(key);
    if (group) {
      group.count++;
      group.last = line;
    } else {
      groups.set(key, { count: 1, first: line, last: line });
    }
  }

  const sorted = Array.from(groups.values()).sort((a, b) => b.count - a.count);
  console.log(`${lines.length} lines in ${sorted.length} groups\n`);
  for (const g of sorted) {
    console.log(`[${g.count}x] ${g.first.level}  last=${g.last.time}`);
    console.log(`  ${g.last.msg.split('\n').slice(0, 3).join('\n  ').slice(0, 600)}\n`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const token = process.env.LOKI_READ_TOKEN;
  if (!token) {
    throw new Error('LOKI_READ_TOKEN is not set. Add a Grafana Cloud token with logs:read scope to insights-ui/.env.');
  }
  const baseUrl = process.env.LOKI_URL || defaults.LOKI_URL;
  const userId = process.env.LOKI_USER_ID || defaults.LOKI_USER_ID;
  const auth = Buffer.from(`${userId}:${token}`).toString('base64');

  const hours = parsePositiveInt(args['hours']) ?? DEFAULT_HOURS;
  const limit = parsePositiveInt(args['limit']) ?? DEFAULT_LIMIT;
  const query = buildQuery(args);
  const endNs = BigInt(Date.now()) * BigInt(1_000_000);
  const startNs = endNs - BigInt(hours) * BigInt(3_600_000_000_000);

  console.error(`Query: ${query}  (last ${hours}h, limit ${limit})`);
  const lines = await fetchLines(baseUrl, auth, query, startNs, endNs, limit);

  const outPath = stringArg(args, 'out');
  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, lines.map((l) => JSON.stringify({ time: l.time, level: l.level, env: l.env, line: l.raw })).join('\n') + '\n', 'utf8');
    console.error(`Wrote ${lines.length} lines to ${outPath}`);
  }

  if (args['raw'] === true) {
    for (const l of lines) {
      console.log(`${l.time} ${l.level.padEnd(5)} ${l.msg}`);
    }
  } else {
    printSummary(lines);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
