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

export function withToken(url: string): string {
  if (!AUTOMATION_SECRET) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(AUTOMATION_SECRET)}`;
}

export interface FetchOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  authToken?: boolean;
}

export async function fetchJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const rawUrl = `${API_BASE}${path}`;
  const url = opts.authToken ? withToken(rawUrl) : rawUrl;
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(opts.authToken && AUTOMATION_SECRET ? { 'x-automation-token': AUTOMATION_SECRET } : {}),
    },
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
    const key = a.slice(2);
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

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
