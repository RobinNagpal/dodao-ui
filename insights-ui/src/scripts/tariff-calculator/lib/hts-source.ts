// Loads the official USITC HTS JSON (one file per HTS revision) from disk or from usitc.gov.
//
// usitc.gov answers scripted requests with "403 Access Denied" unless they look like a browser and
// arrive slowly, so downloads send a browser User-Agent and retry with growing delays. When the
// site still refuses, download the file in a browser and pass it with --file.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HTS_BASE_URL = 'https://www.usitc.gov/sites/default/files/tata/hts';

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://hts.usitc.gov/',
};

/** One row of the HTS JSON as usitc.gov publishes it. */
export interface HtsJsonRow {
  htsno: string;
  indent: string;
  description: string;
  superior: string | null;
  units: string[] | null;
  general: string | null;
  special: string | null;
  other: string | null;
  footnotes: unknown[] | null;
  quotaQuantity: string | null;
  additionalDuties: string | null;
}

export interface HtsSource {
  rows: HtsJsonRow[];
  /** e.g. "2026 Revision 21". */
  edition: string;
  sourceUrl: string;
}

export function htsJsonUrl(year: number, revision: number): string {
  return revision === 0 ? `${HTS_BASE_URL}/hts_${year}_basic_edition_json.json` : `${HTS_BASE_URL}/hts_${year}_revision_${revision}_json.json`;
}

/** "…/hts_2026_revision_21_json.json" → "2026 Revision 21"; "…/hts_2026_basic_edition_json.json" → "2026 Basic Edition". */
export function editionFromName(name: string): string | null {
  const rev = /hts_(\d{4})_revision_(\d+)_json/i.exec(name);
  if (rev) return `${rev[1]} Revision ${Number(rev[2])}`;
  const basic = /hts_(\d{4})_basic_edition_json/i.exec(name);
  if (basic) return `${basic[1]} Basic Edition`;
  return null;
}

/** "2026 Revision 21" → usitc.gov URL. */
export function urlForEdition(edition: string): string {
  const m = /^(\d{4}) (?:Revision (\d+)|Basic Edition)$/i.exec(edition.trim());
  if (!m) throw new Error(`cannot parse HTS edition "${edition}" (expected "<year> Revision <n>" or "<year> Basic Edition")`);
  return htsJsonUrl(Number(m[1]), m[2] ? Number(m[2]) : 0);
}

/** "2026 Revision 21" → "2026-revision-21". */
export function editionSlug(edition: string): string {
  return edition
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** true = a JSON file is published at the URL, false = 404 / soft-404, null = the site would not answer. */
async function probe(url: string, attempts: number): Promise<boolean | null> {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(2_000 * i);
    try {
      const res = await fetch(url, { headers: { ...BROWSER_HEADERS, Range: 'bytes=0-63' }, signal: AbortSignal.timeout(20_000) });
      await res.body?.cancel();
      if (res.ok || res.status === 206) return !(res.headers.get('content-type') ?? '').includes('text/html');
      if (res.status === 404) return false;
    } catch {
      // network error / timeout — retry
    }
  }
  return null;
}

/** Walks usitc.gov forward from this year's basic edition and returns the URL of the newest published HTS JSON. */
export async function findNewestHtsUrl(year = new Date().getFullYear()): Promise<string> {
  let newest: string | null = null;
  for (const y of [year - 1, year]) {
    const basic = await probe(htsJsonUrl(y, 0), 3);
    if (basic === null) throw new Error('usitc.gov did not answer (it blocks scripted requests at times) — download the HTS JSON in a browser and pass --file');
    if (basic) newest = htsJsonUrl(y, 0);
    // Revision numbers are occasionally skipped, so stop after two consecutive misses.
    let misses = 0;
    for (let n = 1; misses < 2 && n < 80; n++) {
      await sleep(1_500);
      const exists = await probe(htsJsonUrl(y, n), 3);
      if (exists === null) throw new Error(`usitc.gov did not answer for ${htsJsonUrl(y, n)} — download the HTS JSON in a browser and pass --file`);
      if (exists) {
        newest = htsJsonUrl(y, n);
        misses = 0;
      } else misses++;
    }
  }
  if (!newest) throw new Error('no HTS JSON found on usitc.gov');
  return newest;
}

/** Downloads the HTS JSON (cached under the OS temp dir, since the file is ~12 MB). */
export async function downloadHtsJson(url: string): Promise<HtsJsonRow[]> {
  const cacheDir = path.join(os.tmpdir(), 'koala-hts-json');
  const cachePath = path.join(cacheDir, path.basename(new URL(url).pathname));
  if (existsSync(cachePath)) {
    console.log(`Using cached ${cachePath}`);
    return parseHtsJson(readFileSync(cachePath, 'utf-8'), cachePath);
  }
  let lastError = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await sleep(5_000 * attempt);
    try {
      console.log(`Downloading ${url} (attempt ${attempt + 1}/5)`);
      const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(180_000) });
      const text = await res.text();
      if (!res.ok || text.trimStart().startsWith('<')) {
        lastError = `HTTP ${res.status}${text.includes('Access Denied') ? ' (Access Denied)' : ''}`;
        continue;
      }
      const rows = parseHtsJson(text, url);
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(cachePath, text);
      return rows;
    } catch (err) {
      lastError = (err as Error).message;
    }
  }
  throw new Error(`could not download ${url}: ${lastError}. usitc.gov blocks scripted requests at times — download it in a browser and pass --file`);
}

function parseHtsJson(text: string, where: string): HtsJsonRow[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0 || typeof (parsed[0] as HtsJsonRow).htsno !== 'string') {
    throw new Error(`${where} is not an HTS JSON file (expected an array of rows with "htsno")`);
  }
  return parsed as HtsJsonRow[];
}

export interface LoadHtsOptions {
  /** Local copy of the HTS JSON. */
  file?: string;
  /** usitc.gov URL to download (default: the newest published revision). */
  url?: string;
  /** Edition label, required with --file when the filename doesn't carry it. */
  edition?: string;
}

export async function loadHtsSource(opts: LoadHtsOptions): Promise<HtsSource> {
  if (opts.file) {
    const filePath = path.resolve(opts.file);
    const rows = parseHtsJson(readFileSync(filePath, 'utf-8'), filePath);
    const edition = opts.edition ?? editionFromName(path.basename(filePath)) ?? (opts.url ? editionFromName(opts.url) : null);
    if (!edition) throw new Error(`cannot tell the HTS edition from "${path.basename(filePath)}" — pass --edition "<year> Revision <n>"`);
    return { rows, edition, sourceUrl: opts.url ?? urlForEdition(edition) };
  }
  const url = opts.url ?? (opts.edition ? urlForEdition(opts.edition) : await findNewestHtsUrl());
  const edition = opts.edition ?? editionFromName(url);
  if (!edition) throw new Error(`cannot tell the HTS edition from ${url} — pass --edition`);
  return { rows: await downloadHtsJson(url), edition, sourceUrl: url };
}

/** Minimal `--key value` / `--key=value` / `--flag` parser (no dotenv: these scripts never touch a DB). */
export function parseCliArgs(argv: string[]): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const body = a.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      out[body.slice(0, eq)] = body.slice(eq + 1);
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) {
      out[body] = argv[++i];
    } else {
      out[body] = true;
    }
  }
  return out;
}

export function stringArg(args: Record<string, string | true>, key: string): string | undefined {
  const v = args[key];
  if (v === true) throw new Error(`--${key} needs a value`);
  return v;
}

/** Path of the insights-ui package root (scripts are run from there via pnpm, but resolve it from this file to be safe). */
export const INSIGHTS_UI_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

/** Where the generated, reviewed calculator data SQL files live. */
export const DATA_SQL_DIR = path.join(INSIGHTS_UI_ROOT, 'prisma', 'data-sql', 'tariff-calculator');

/** UTC date as YYYYMMDD, the data SQL filename prefix. */
export function yyyymmdd(d = new Date()): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}
