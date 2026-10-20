import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TariffImportsByHeadingCountry } from '@/types/tariff-chapter-prototype';
import { parseArgs, parsePositiveInt, sleep } from '../../tickers/lib';
import {
  COMTRADE_EXPORT_VALUE_BASIS,
  COMTRADE_VALUE_BASIS,
  comtradePartnerName,
  type TradeFlow,
  type TradeSummary,
  type TradeSummaryCountry,
  type TradeYearToDate,
  tradeSummaryPath,
} from './trade-stats';

/**
 * Download U.S. imports (default) or exports (`--flow X`) for one HS chapter
 * from the UN Comtrade public (preview) API and write a compact summary to
 * `src/tariff-data/trade/chapter-NN.json` (exports: `trade/exports/chapter-NN.json`).
 *
 *   pnpm tariff:fetch-trade --chapter 1
 *   pnpm tariff:fetch-trade --chapter 30 --years 2020-2025
 *   pnpm tariff:fetch-trade --chapter 30 --flow X --ytd                    # U.S. exports + this year so far (monthly)
 *   pnpm tariff:fetch-trade --chapter 3 --cache-dir /tmp/comtrade-cache   # raw responses (re-runs are offline)
 *   pnpm tariff:fetch-trade --chapter 3 --refresh                         # ignore cached raw responses
 *
 * Preview API limits (no key): one period per call, at most 500 records per
 * call, about one call every two seconds (HTTP 429 otherwise), and a call
 * volume quota of roughly 100 calls per window (HTTP 403 "Out of call volume
 * quota" — wait for it to replenish; cached responses are not re-fetched).
 * Omitting `partnerCode` returns every partner; `cmdCode` accepts a comma list.
 *
 * Calls per chapter (about 10): per year, chapter x every partner; for the
 * latest and prior year, headings + HS6 lines x World; for the latest year,
 * headings x every partner (grouped under the record cap). HS codes and
 * descriptions come from Comtrade's HS 2022 (H6) reference list.
 *
 * `--ytd` adds the current year so far from Comtrade's monthly data: it finds the
 * latest month reported, then fetches chapter x every partner for each month of
 * this year and the same months of last year (two calls per month). The U.S.
 * reports monthly trade to Comtrade about two months after the month ends.
 */

const PREVIEW_BASE = 'https://comtradeapi.un.org/public/v1/preview/C/A/HS';
const PREVIEW_MONTHLY_BASE = 'https://comtradeapi.un.org/public/v1/preview/C/M/HS';
const H6_REFERENCE_URL = 'https://comtradeapi.un.org/files/v1/app/reference/H6.json';
const US_REPORTER = 842;
const MAX_RECORDS = 500;
const MIN_INTERVAL_MS = 2100;
const MAX_ATTEMPTS = 8;
/** Codes per World-only call; one row per code, and the URL stays short. */
const WORLD_CODES_PER_CALL = 150;

interface ComtradeRow {
  period: string;
  reporterCode: number;
  flowCode: string;
  partnerCode: number;
  partnerDesc: string | null;
  partner2Code: number;
  cmdCode: string;
  cmdDesc: string | null;
  customsCode: string;
  motCode: number;
  primaryValue: number;
}

interface ComtradeResponse {
  count?: number;
  data?: ComtradeRow[];
  error?: string;
}

interface H6Reference {
  results: { id: string; text: string; parent: string; aggrlevel: number }[];
}

let lastCallAt = 0;
/** Latest download time among the raw responses used (cached or fresh), so re-runs from cache keep the real retrieval date. */
let latestRetrievedAt = '';

function noteRetrieved(iso: string): void {
  if (iso > latestRetrievedAt) latestRetrievedAt = iso;
}

/** The slice of the prettier v2 API used here (the repo has no @types/prettier). */
interface PrettierApi {
  resolveConfig(filePath: string): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): string;
}

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier'; // non-literal specifier: typed loosely, no declaration file needed
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

function cacheFile(cacheDir: string, url: string): string {
  return path.join(cacheDir, `${createHash('sha1').update(url).digest('hex').slice(0, 16)}.json`);
}

async function getJson<T>(url: string, cacheDir: string, refresh: boolean): Promise<T> {
  const file = cacheFile(cacheDir, url);
  if (!refresh && existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, 'utf8')) as { url: string; retrievedAt: string; body: T };
    noteRetrieved(cached.retrievedAt);
    return cached.body;
  }
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCallAt = Date.now();
    let status = 0;
    let text = '';
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      status = res.status;
      text = await res.text();
    } catch (e) {
      text = (e as Error).message;
    }
    if (status === 200) {
      const body = JSON.parse(text) as T;
      const retrievedAt = new Date().toISOString();
      noteRetrieved(retrievedAt);
      writeFileSync(file, JSON.stringify({ url, retrievedAt, body }));
      return body;
    }
    const retryable = status === 0 || status === 429 || status >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS) {
      throw new Error(`GET ${url} failed (HTTP ${status}): ${text.slice(0, 300)}`);
    }
    const hinted = /Try again in (\d+) seconds/i.exec(text);
    const backoff = Math.max(hinted ? (parseInt(hinted[1], 10) + 1) * 1000 : 0, 2000 * 2 ** (attempt - 1));
    console.warn(`  HTTP ${status} — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${Math.round(backoff / 1000)}s`);
    await sleep(Math.min(backoff, 60_000));
  }
  throw new Error('unreachable');
}

/** Trade flow of this run (`--flow`): M = U.S. imports, X = U.S. exports. */
let flow: TradeFlow = 'M';

async function comtrade(
  params: Record<string, string>,
  cacheDir: string,
  refresh: boolean,
  base: string = PREVIEW_BASE
): Promise<{ url: string; rows: ComtradeRow[] }> {
  const qs = new URLSearchParams({ reporterCode: String(US_REPORTER), flowCode: flow, includeDesc: 'true', ...params });
  const url = `${base}?${qs.toString().replace(/%2C/g, ',')}`;
  const body = await getJson<ComtradeResponse>(url, cacheDir, refresh);
  if (body.error) throw new Error(`Comtrade error for ${url}: ${body.error}`);
  const data = body.data ?? [];
  if (data.length >= MAX_RECORDS) throw new Error(`Comtrade returned ${data.length} rows (preview cap ${MAX_RECORDS}) for ${url}; narrow the query`);
  // Keep only plain totals: all customs procedures, all transport modes, no second partner.
  const rows = data.filter((r) => r.reporterCode === US_REPORTER && r.flowCode === flow && r.customsCode === 'C00' && r.motCode === 0 && r.partner2Code === 0);
  return { url, rows };
}

/**
 * The current year so far from monthly data: the latest month the U.S. has reported for `year`
 * (probing back from December, or from the current month for the current year), then chapter x
 * every partner for months 1..that month of `year` and of `year - 1`.
 */
async function fetchYearToDate(ch: string, year: number, cacheDir: string, refresh: boolean): Promise<TradeYearToDate | null> {
  const now = new Date();
  const startMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12;
  let throughMonth = 0;
  for (let month = startMonth; month >= 1; month--) {
    // Probe with refresh so a month reported since the last run is picked up.
    const { rows } = await comtrade(
      { period: `${year}${String(month).padStart(2, '0')}`, cmdCode: ch, partnerCode: '0' },
      cacheDir,
      true,
      PREVIEW_MONTHLY_BASE
    );
    if (rows.some((r) => r.partnerCode === 0 && r.primaryValue > 0)) {
      throughMonth = month;
      break;
    }
  }
  if (throughMonth === 0) {
    console.warn(`  year to date: no monthly data for ${year} yet`);
    return null;
  }

  const sumMonths = async (y: number): Promise<{ total: number; byPartner: Map<number, { name: string; value: number }> }> => {
    let total = 0;
    const byPartner = new Map<number, { name: string; value: number }>();
    for (let month = 1; month <= throughMonth; month++) {
      const { rows } = await comtrade({ period: `${y}${String(month).padStart(2, '0')}`, cmdCode: ch }, cacheDir, refresh, PREVIEW_MONTHLY_BASE);
      for (const r of rows) {
        if (r.partnerCode === 0) total += r.primaryValue;
        else {
          const entry = byPartner.get(r.partnerCode) ?? { name: comtradePartnerName(r.partnerCode, r.partnerDesc), value: 0 };
          entry.value += r.primaryValue;
          byPartner.set(r.partnerCode, entry);
        }
      }
    }
    return { total, byPartner };
  };

  const current = await sumMonths(year);
  const prior = await sumMonths(year - 1);
  const codes = new Set([...current.byPartner.keys(), ...prior.byPartner.keys()]);
  const byCountry = [...codes]
    .map((code) => ({
      countryCode: code,
      country: current.byPartner.get(code)?.name ?? prior.byPartner.get(code)?.name ?? String(code),
      valueUsd: current.byPartner.get(code)?.value ?? 0,
      priorValueUsd: prior.byPartner.get(code)?.value ?? 0,
    }))
    .filter((c) => c.valueUsd > 0 || c.priorValueUsd > 0)
    .sort((a, b) => b.valueUsd - a.valueUsd || b.priorValueUsd - a.priorValueUsd);
  console.log(`  year to date: Jan-${throughMonth} ${year} ${current.total.toLocaleString()} vs ${year - 1} ${prior.total.toLocaleString()}`);
  return { year, throughMonth, totalUsd: current.total, priorTotalUsd: prior.total, byCountry };
}

function sumBy<K>(rows: ComtradeRow[], key: (r: ComtradeRow) => K): Map<K, number> {
  const out = new Map<K, number>();
  for (const r of rows) out.set(key(r), (out.get(key(r)) ?? 0) + r.primaryValue);
  return out;
}

function parseYears(raw: string | boolean | undefined): number[] {
  const spec = typeof raw === 'string' ? raw : '2020-2025';
  const m = /^(\d{4})-(\d{4})$/.exec(spec);
  if (!m) throw new Error(`--years must look like 2020-2025, got "${spec}"`);
  const [from, to] = [parseInt(m[1], 10), parseInt(m[2], 10)];
  if (to <= from) throw new Error('--years needs at least two years');
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function descFromReference(text: string, id: string): string {
  return text.startsWith(`${id} - `) ? text.slice(id.length + 3) : text;
}

async function fetchChapter(chapter: number, years: number[], cacheDir: string, refresh: boolean): Promise<TradeSummary> {
  const ch = String(chapter).padStart(2, '0');
  const latestYear = years[years.length - 1];
  const priorYear = years[years.length - 2];

  const ref = await getJson<H6Reference>(H6_REFERENCE_URL, cacheDir, refresh);
  const chapterRef = ref.results.find((r) => r.id === ch);
  if (!chapterRef) throw new Error(`HS chapter ${ch} not in the Comtrade H6 reference list`);
  const headingRefs = ref.results.filter((r) => r.id.length === 4 && r.id.startsWith(ch));
  const hs6Refs = ref.results.filter((r) => r.id.length === 6 && r.id.startsWith(ch));
  const headingCodes = headingRefs.map((r) => r.id);
  const hs6Codes = hs6Refs.map((r) => r.id);
  console.log(`Chapter ${ch}: ${headingCodes.length} headings, ${hs6Codes.length} HS6 lines, years ${years[0]}-${latestYear}`);

  // 1) Chapter total by partner (the World row is the total), for every year.
  const countryByYear = new Map<number, { name: string; byYear: Record<string, number> }>();
  const totalsByYear: TradeSummary['totalsByYear'] = [];
  for (const year of years) {
    const { rows } = await comtrade({ period: String(year), cmdCode: ch }, cacheDir, refresh);
    const world = rows.find((r) => r.partnerCode === 0);
    const partners = rows.filter((r) => r.partnerCode !== 0 && r.cmdCode === ch);
    if (!world) {
      console.warn(`  ${year}: no data`);
      continue;
    }
    totalsByYear.push({ year, totalUsd: world.primaryValue, partnerCount: partners.filter((r) => r.primaryValue > 0).length });
    for (const r of partners) {
      const entry = countryByYear.get(r.partnerCode) ?? { name: comtradePartnerName(r.partnerCode, r.partnerDesc), byYear: {} };
      entry.byYear[String(year)] = (entry.byYear[String(year)] ?? 0) + r.primaryValue;
      countryByYear.set(r.partnerCode, entry);
    }
    const partnerSum = partners.reduce((s, r) => s + r.primaryValue, 0);
    console.log(`  ${year}: total ${world.primaryValue.toLocaleString()} (partners sum ${partnerSum.toLocaleString()}, ${partners.length} partners)`);
  }
  const latestTotals = totalsByYear.find((t) => t.year === latestYear);
  if (!latestTotals || !totalsByYear.some((t) => t.year === priorYear)) {
    throw new Error(`Chapter ${ch}: Comtrade has no data for ${priorYear} and/or ${latestYear}`);
  }

  // 2) Latest and prior year: headings + HS6 lines x World, in as few calls as the record cap allows.
  const headingByYear = new Map<string, Record<string, number>>(headingCodes.map((h) => [h, {}]));
  const hs6ByYear = new Map<number, Map<string, number>>();
  const worldCodes = [...headingCodes, ...hs6Codes];
  for (const year of [priorYear, latestYear]) {
    const totals = new Map<string, number>();
    for (let i = 0; i < worldCodes.length; i += WORLD_CODES_PER_CALL) {
      const { rows } = await comtrade(
        { period: String(year), cmdCode: worldCodes.slice(i, i + WORLD_CODES_PER_CALL).join(','), partnerCode: '0' },
        cacheDir,
        refresh
      );
      for (const [code, v] of sumBy(rows, (r) => r.cmdCode)) totals.set(code, (totals.get(code) ?? 0) + v);
    }
    for (const h of headingCodes) {
      const v = totals.get(h);
      if (v !== undefined) headingByYear.get(h)![String(year)] = v;
    }
    hs6ByYear.set(year, new Map([...totals].filter(([code]) => code.length === 6)));
  }

  // 3) Latest year: headings x every partner. Group headings so a call stays under the record cap
  //    even if every partner trades every heading.
  const byHeadingCountry: TariffImportsByHeadingCountry[] = [];
  const perCall = Math.max(1, Math.floor((MAX_RECORDS - 1) / (latestTotals.partnerCount + 2)));
  for (let i = 0; i < headingCodes.length; i += perCall) {
    const { rows } = await comtrade({ period: String(latestYear), cmdCode: headingCodes.slice(i, i + perCall).join(',') }, cacheDir, refresh);
    for (const r of rows) {
      if (r.partnerCode === 0 || r.primaryValue <= 0) continue;
      byHeadingCountry.push({
        heading: r.cmdCode,
        countryCode: r.partnerCode,
        country: comtradePartnerName(r.partnerCode, r.partnerDesc),
        importsUsd: r.primaryValue,
      });
    }
  }
  byHeadingCountry.sort((a, b) => a.heading.localeCompare(b.heading) || b.importsUsd - a.importsUsd);

  const byCountry: TradeSummaryCountry[] = [...countryByYear.entries()]
    .map(([countryCode, { name, byYear }]) => ({
      countryCode,
      country: name,
      importsUsd: byYear[String(latestYear)] ?? 0,
      priorImportsUsd: byYear[String(priorYear)] ?? 0,
      byYear,
    }))
    .filter((c) => c.importsUsd > 0 || c.priorImportsUsd > 0)
    .sort((a, b) => b.importsUsd - a.importsUsd || b.priorImportsUsd - a.priorImportsUsd);

  const byHs6 = hs6Refs
    .map((r) => ({
      hs6: r.id,
      heading: r.id.slice(0, 4),
      description: descFromReference(r.text, r.id),
      importsUsd: hs6ByYear.get(latestYear)?.get(r.id) ?? 0,
      priorImportsUsd: hs6ByYear.get(priorYear)?.get(r.id) ?? 0,
    }))
    .filter((l) => l.importsUsd > 0 || l.priorImportsUsd > 0)
    .sort((a, b) => b.importsUsd - a.importsUsd || b.priorImportsUsd - a.priorImportsUsd);

  const latestTotal = latestTotals.totalUsd;
  const check = (label: string, actualUsd: number) => ({ label, expectedUsd: latestTotal, actualUsd, diffUsd: actualUsd - latestTotal });
  const checks = [
    check(
      `${latestYear} partners sum`,
      byCountry.reduce((s, c) => s + c.importsUsd, 0)
    ),
    check(
      `${latestYear} headings sum`,
      [...headingByYear.values()].reduce((s, h) => s + (h[String(latestYear)] ?? 0), 0)
    ),
    check(
      `${latestYear} HS6 lines sum`,
      byHs6.reduce((s, l) => s + l.importsUsd, 0)
    ),
    check(
      `${latestYear} heading x partner sum`,
      byHeadingCountry.reduce((s, r) => s + r.importsUsd, 0)
    ),
  ];

  return {
    chapter,
    chapterPadded: ch,
    chapterDescription: descFromReference(chapterRef.text, ch),
    source: 'un-comtrade-public-preview',
    sourceLabel: `UN Comtrade public API (preview), United States ${flow === 'X' ? 'exports' : 'imports'}, annual, HS`,
    sourceUrls: ['https://comtradeplus.un.org/', `${PREVIEW_BASE}?reporterCode=${US_REPORTER}&flowCode=${flow}&period=YYYY&cmdCode=${ch}`, H6_REFERENCE_URL],
    retrievedAt: new Date(latestRetrievedAt).toLocaleDateString('en-CA'), // local YYYY-MM-DD
    reporter: { code: US_REPORTER, name: 'United States' },
    flow,
    valueBasis: flow === 'X' ? COMTRADE_EXPORT_VALUE_BASIS : COMTRADE_VALUE_BASIS,
    years: totalsByYear.map((t) => t.year),
    latestYear,
    priorYear,
    totalsByYear,
    byCountry,
    byHeading: headingRefs.map((r) => ({ heading: r.id, description: descFromReference(r.text, r.id), byYear: headingByYear.get(r.id) ?? {} })),
    byHs6,
    byHeadingCountry,
    checks,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const chapter = parsePositiveInt(args.chapter);
  if (!chapter || chapter > 99) {
    throw new Error('Usage: pnpm tariff:fetch-trade --chapter N [--flow M|X] [--ytd] [--years 2020-2025] [--cache-dir DIR] [--refresh]');
  }
  const flowArg = typeof args.flow === 'string' ? args.flow.toUpperCase() : 'M';
  if (flowArg !== 'M' && flowArg !== 'X') throw new Error(`--flow must be M (imports) or X (exports), got "${flowArg}"`);
  flow = flowArg;
  const years = parseYears(args.years);
  const cacheDir = typeof args['cache-dir'] === 'string' ? args['cache-dir'] : path.join(os.tmpdir(), 'koalagains-comtrade-cache');
  mkdirSync(cacheDir, { recursive: true });
  const out = tradeSummaryPath(chapter, flow);
  mkdirSync(path.dirname(out), { recursive: true });

  const summary = await fetchChapter(chapter, years, cacheDir, args.refresh === true);
  if (args.ytd === true) {
    const ytd = await fetchYearToDate(summary.chapterPadded, summary.latestYear + 1, cacheDir, args.refresh === true);
    if (ytd) summary.yearToDate = ytd;
  }
  for (const c of summary.checks) {
    const flag = c.diffUsd === 0 ? 'ok' : `diff ${c.diffUsd.toLocaleString()}`;
    console.log(`  check ${c.label}: ${c.actualUsd.toLocaleString()} vs ${c.expectedUsd.toLocaleString()} (${flag})`);
  }
  // Format with the repo's prettier config so the committed file passes `pnpm prettier-check` as generated.
  const prettier = await loadPrettier();
  const prettierOptions = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, prettier.format(JSON.stringify(summary, null, 2), { ...prettierOptions, filepath: out }));
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
