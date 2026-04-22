import 'dotenv/config';

export const API_BASE = (process.env.KOALAGAINS_API_BASE ?? process.env.SCENARIOS_API_BASE ?? 'https://koalagains.com').replace(/\/+$/, '');
export const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET ?? '';
export const SPACE_ID = process.env.KOALAGAINS_SPACE_ID ?? 'koala_gains';

export function requireAutomationSecret(): string {
  if (!AUTOMATION_SECRET) {
    throw new Error('AUTOMATION_SECRET is not set — export it or source the discord-claude-bot/.env before running.');
  }
  return AUTOMATION_SECRET;
}

export interface FetchOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  authToken?: boolean;
}

export async function fetchJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.authToken) {
    if (!AUTOMATION_SECRET) {
      throw new Error(`AUTOMATION_SECRET required for ${method} ${path} but not set`);
    }
    headers['x-automation-token'] = AUTOMATION_SECRET;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${method} ${path}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const body = a.slice(2);
    const eqIdx = body.indexOf('=');
    if (eqIdx !== -1) {
      const key = body.slice(0, eqIdx);
      const value = body.slice(eqIdx + 1);
      out[key] = value;
      continue;
    }
    const key = body;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

export function requireStringArg(args: Record<string, string | boolean>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Missing required arg --${key}`);
  }
  return v;
}

export function parsePositiveInt(raw: string | boolean | undefined): number | undefined {
  if (typeof raw !== 'string') return undefined;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Expected a positive integer, got "${raw}"`);
  }
  return n;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Row shape of the hardcoded sample ETF JSON (insights-ui/src/etf-analysis-data/sample-etfs.json).
 * `symbol` and `exchange` drive the API calls; the rest is metadata used to label reports.
 */
export interface SampledEtf {
  symbol: string;
  exchange: string;
  name?: string;
  group?: string;
  groupName?: string;
  category?: string;
}
