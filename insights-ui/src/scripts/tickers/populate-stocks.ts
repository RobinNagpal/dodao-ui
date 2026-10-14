// Load env vars first — stockAnalyzeUrlValidation reads NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL
// at module load time, so dotenv must run before that import resolves.
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import {
  AllExchanges,
  EXCHANGES,
  getCountryByExchange,
  getExchangesByCountry,
  IndiaExchanges,
  isExchange,
  PakistanExchanges,
} from '@/utils/countryExchangeUtils';
import { generateExpectedStockAnalyzeUrl, validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { API_BASE, SPACE_ID, fetchJson, parseArgs, parsePositiveInt, sleep } from './lib';

/**
 * Populates new stocks for an exchange in two steps, with Claude mapping industries in between:
 *
 *   yarn stocks:populate fetch --exchange PSX --count 100
 *     → stock-population/psx-<date>-candidates.json  (industryKey / subIndustryKey left empty)
 *
 *   (Claude fills industryKey + subIndustryKey for every candidate from `allowedSubIndustries`)
 *
 *   yarn stocks:populate sql --in stock-population/psx-<date>-candidates.json
 *     → stock-population/psx-<date>.sql  (run on production Postgres)
 *
 * See docs/insights-ui/stock-analysis/populate-stocks.md.
 */

const STOCK_ANALYZE_BASE_URL = (process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '').replace(/\/+$/, '');
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const DEFAULT_OUT_DIR = 'stock-population';
const DEFAULT_DELAY_MS = 1500;
const MAX_COUNT = 500;
const DESCRIPTION_MAX_CHARS = 600;
const CREATED_BY = 'stocks-populate-script';

/** Ranked-by-market-cap list page on the stock-analyze site, per exchange. Others can pass --list-path. */
const EXCHANGE_LIST_PATHS: Partial<Record<AllExchanges, string>> = {
  [PakistanExchanges.PSX]: '/list/pakistan-stock-exchange/',
  [IndiaExchanges.NSE]: '/list/nse-india/',
  [IndiaExchanges.BSE]: '/list/bse-india/',
};

/**
 * Company-name comparison (e.g. an NSE candidate vs an existing BSE row): abbreviations are expanded and only
 * legal-form noise is dropped. "Corporation" / "Company" are kept — Arif Habib Limited and Arif Habib
 * Corporation Limited are different companies.
 */
const NAME_ABBREVIATIONS: Record<string, string> = { ltd: 'limited', co: 'company', corp: 'corporation', pvt: 'private', mfg: 'manufacturing' };
const NAME_STOP_WORDS = new Set(['the', 'limited', 'private', 'inc', 'plc']);

interface ExistingTicker {
  name: string;
  symbol: string;
  exchange: string;
}

interface ListRow {
  rank: number;
  segment: string;
  symbol: string;
  name: string;
  marketCap: number | null;
  subtype: string;
}

interface CompanyProfile {
  websiteUrl: string | null;
  sourceIndustry: string | null;
  sourceSector: string | null;
  isin: string | null;
  description: string | null;
}

export interface PopulateCandidate {
  rank: number;
  name: string;
  symbol: string;
  exchange: AllExchanges;
  websiteUrl: string;
  stockAnalyzeUrl: string;
  marketCap: number | null;
  isin: string | null;
  /** Industry / sector as labelled by the stock-analyze site — a hint for the mapping, never stored. */
  sourceIndustry: string | null;
  sourceSector: string | null;
  description: string | null;
  /** Set when an existing ticker in the same country has a similar (not identical) name. Claude decides. */
  possibleDuplicateOf: string | null;
  /** Filled by Claude from `allowedSubIndustries`. */
  industryKey: string;
  subIndustryKey: string;
  /** Claude sets this to true (with a reason) to leave a candidate out of the SQL. */
  skip?: boolean;
  skipReason?: string;
}

interface AllowedSubIndustry {
  industryKey: string;
  industryName: string;
  subIndustryKey: string;
  subIndustryName: string;
  summary: string;
  tickerCount: number;
}

interface CandidatesFile {
  generatedAt: string;
  exchange: AllExchanges;
  apiBase: string;
  instructions: string;
  candidates: PopulateCandidate[];
  allowedSubIndustries: AllowedSubIndustry[];
}

/** ---------- Shared helpers ---------- */

function requireExchange(raw: string | boolean | undefined): AllExchanges {
  const exchange = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (!exchange) throw new Error('Missing required arg --exchange');
  if (!isExchange(exchange)) throw new Error(`Invalid exchange "${raw}". Supported: ${EXCHANGES.join(', ')}`);
  return exchange;
}

/** All live tickers in the exchange's country — the API excludes deleted / moved rows; the SQL's ON CONFLICT covers those. */
async function fetchExistingTickers(exchange: AllExchanges): Promise<ExistingTicker[]> {
  const country = getCountryByExchange(exchange);
  return fetchJson<ExistingTicker[]>(`/api/${SPACE_ID}/tickers-v1?country=${encodeURIComponent(country)}`);
}

/** Non-archived sub-industries that already have at least one stock — the only ones new stocks may be mapped to. */
async function fetchAllowedSubIndustries(): Promise<AllowedSubIndustry[]> {
  const industries = await fetchJson<IndustryWithSubIndustriesAndCounts[]>('/api/industries');
  return industries
    .filter((industry) => !industry.archived)
    .flatMap((industry) =>
      industry.subIndustries
        .filter((sub) => !sub.archived && sub.tickerCount > 0)
        .map((sub) => ({
          industryKey: industry.industryKey,
          industryName: industry.name,
          subIndustryKey: sub.subIndustryKey,
          subIndustryName: sub.name,
          summary: truncate(sub.summary ?? '', 200),
          tickerCount: sub.tickerCount,
        }))
    );
}

function normalizeCompanyName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .map((word) => NAME_ABBREVIATIONS[word] ?? word)
    .filter((word) => word && !NAME_STOP_WORDS.has(word));
}

function existingKey(symbol: string, exchange: string): string {
  return `${symbol.toUpperCase()}|${exchange.toUpperCase()}`;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function defaultStem(exchange: AllExchanges): string {
  return path.join(DEFAULT_OUT_DIR, `${exchange.toLowerCase()}-${new Date().toISOString().slice(0, 10)}`);
}

/** ---------- Stock-analyze site scraping ---------- */

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'user-agent': BROWSER_USER_AGENT, accept: 'text/html,application/xhtml+xml' } });
  const html = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  if (html.includes('<title>Just a moment...</title>') || html.includes('/cdn-cgi/challenge-platform/')) {
    throw new Error(`Bot challenge served for ${url} — wait a few minutes and re-run with a larger --delay-ms`);
  }
  return html;
}

/** Decodes a JS string literal body as embedded in the page's hydration data (\uXXXX, \", \\ …). */
function decodeJsString(raw: string): string {
  return raw.replace(/\\u([0-9a-fA-F]{4})|\\(.)/g, (_m, hex: string | undefined, ch: string | undefined) => {
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    if (ch === 'n') return '\n';
    if (ch === 't') return '\t';
    return ch ?? '';
  });
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Rows of one list page, read from the page's embedded hydration data: `{no:1,s:"psx/OGDC",n:"…",marketCap:…,subtype:"stock",…}`. */
function parseListPage(html: string): { rows: ListRow[]; resultsCount: number | null } {
  const rows: ListRow[] = [];
  for (const match of html.matchAll(/\{no:\d+,[^{}]*\}/g)) {
    const chunk = match[0];
    const rank = /no:(\d+)/.exec(chunk);
    const s = /\bs:"([a-z]+)\/((?:[^"\\]|\\.)+)"/.exec(chunk);
    const n = /\bn:"((?:[^"\\]|\\.)*)"/.exec(chunk);
    if (!rank || !s || !n) continue;
    const marketCap = /marketCap:([0-9.e+-]+)/.exec(chunk);
    const subtype = /subtype:"([a-z]+)"/.exec(chunk);
    rows.push({
      rank: parseInt(rank[1], 10),
      segment: s[1],
      symbol: decodeJsString(s[2]).toUpperCase(),
      name: decodeJsString(n[1]).trim(),
      marketCap: marketCap ? Number(marketCap[1]) : null,
      subtype: subtype ? subtype[1] : 'stock',
    });
  }
  const resultsCount = /resultsCount:(\d+)/.exec(html);
  return { rows, resultsCount: resultsCount ? parseInt(resultsCount[1], 10) : null };
}

function tableCell(html: string, label: string): string | null {
  const match = new RegExp(`>${label}</td>\\s*<td[^>]*>([\\s\\S]*?)</td>`).exec(html);
  const value = match ? stripTags(match[1]) : '';
  return value && value !== 'n/a' ? value : null;
}

function parseCompanyProfile(html: string): CompanyProfile {
  const website = /contact:\{[^}]*?website:"((?:[^"\\]|\\.)*)"/.exec(html);
  const isin = /isin:"([A-Z0-9]+)"/.exec(html);
  const description = /description:"((?:[^"\\]|\\.)*)",contact:\{/.exec(html);
  const websiteUrl = website ? decodeJsString(website[1]).trim() : '';
  return {
    websiteUrl: /^https?:\/\/\S+$/i.test(websiteUrl) ? websiteUrl : null,
    sourceIndustry: tableCell(html, 'Industry'),
    sourceSector: tableCell(html, 'Sector'),
    isin: isin ? isin[1] : null,
    description: description ? truncate(stripTags(decodeJsString(description[1])), DESCRIPTION_MAX_CHARS) : null,
  };
}

/** ---------- fetch ---------- */

async function runFetch(args: Record<string, string | boolean>): Promise<void> {
  if (!STOCK_ANALYZE_BASE_URL) throw new Error('NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL is not set — add it to insights-ui/.env');
  const exchange = requireExchange(args['exchange']);
  const count = parsePositiveInt(args['count']);
  if (!count) throw new Error('Missing required arg --count (number of NEW stocks to collect)');
  if (count > MAX_COUNT) throw new Error(`--count is capped at ${MAX_COUNT}`);
  const delayMs = parsePositiveInt(args['delay-ms']) ?? DEFAULT_DELAY_MS;
  const listPath = typeof args['list-path'] === 'string' ? args['list-path'] : EXCHANGE_LIST_PATHS[exchange];
  if (!listPath) {
    throw new Error(`No known list page for ${exchange}. Pass --list-path (e.g. /list/<exchange-list>/) from ${STOCK_ANALYZE_BASE_URL}/list/`);
  }
  const outPath = typeof args['out'] === 'string' ? args['out'] : `${defaultStem(exchange)}-candidates.json`;

  // The segment the stock-analyze site uses for this exchange, e.g. "psx" in /quote/psx/OGDC/.
  const expectedSegment = /\/quote\/([^/]+)\//.exec(generateExpectedStockAnalyzeUrl('X', exchange))?.[1] ?? null;

  console.log(`Reading existing ${getCountryByExchange(exchange)} tickers and industries from ${API_BASE} …`);
  const [existing, allowedSubIndustries] = await Promise.all([fetchExistingTickers(exchange), fetchAllowedSubIndustries()]);
  const existingKeys = new Set(existing.map((t) => existingKey(t.symbol, t.exchange)));
  const existingNames = new Map(existing.map((t) => [normalizeCompanyName(t.name).join(' '), t]));
  const existingByPrefix = new Map(existing.map((t) => [normalizeCompanyName(t.name).slice(0, 2).join(' '), t]));
  const countryExchanges = getExchangesByCountry(getCountryByExchange(exchange));
  console.log(
    `  ${existing.length} existing tickers on ${countryExchanges.join('/')} (${existing.filter((t) => t.exchange === exchange).length} on ${exchange}); ` +
      `${allowedSubIndustries.length} in-use sub-industries`
  );

  const candidates: PopulateCandidate[] = [];
  const skipped: Array<{ symbol: string; name: string; reason: string }> = [];
  let page = 1;
  let totalRows: number | null = null;
  let scanned = 0;

  pages: while (candidates.length < count) {
    const url = `${STOCK_ANALYZE_BASE_URL}${listPath}${page > 1 ? `?page=${page}` : ''}`;
    const { rows, resultsCount } = parseListPage(await fetchHtml(url));
    totalRows = totalRows ?? resultsCount;
    if (rows.length === 0) {
      if (page === 1) throw new Error(`No rows parsed from ${url} — the list page layout may have changed`);
      break;
    }
    console.log(`List page ${page}: ${rows.length} rows (ranks ${rows[0].rank}-${rows[rows.length - 1].rank} of ${totalRows ?? '?'})`);

    for (const row of rows) {
      if (candidates.length >= count) break pages;
      scanned++;
      if (row.subtype !== 'stock') continue;
      if (expectedSegment && row.segment !== expectedSegment) continue;
      if (existingKeys.has(existingKey(row.symbol, exchange))) continue;

      const nameTokens = normalizeCompanyName(row.name);
      const sameName = existingNames.get(nameTokens.join(' '));
      if (sameName) {
        skipped.push({ symbol: row.symbol, name: row.name, reason: `already listed as ${sameName.symbol} (${sameName.exchange})` });
        continue;
      }
      // Another share class of a company already picked in this run (e.g. PIAHCLA / PIAHCLB) — keep the higher-ranked one.
      const sameCandidate = candidates.find((c) => normalizeCompanyName(c.name).join(' ') === nameTokens.join(' '));
      if (sameCandidate) {
        skipped.push({ symbol: row.symbol, name: row.name, reason: `another share class of ${sameCandidate.symbol}` });
        continue;
      }

      const stockAnalyzeUrl = generateExpectedStockAnalyzeUrl(row.symbol, exchange);
      await sleep(delayMs);
      let profile: CompanyProfile;
      try {
        profile = parseCompanyProfile(await fetchHtml(`${stockAnalyzeUrl}company/`));
      } catch (err) {
        const message = (err as Error).message;
        if (message.includes('Bot challenge') || /HTTP (401|403|429)/.test(message)) throw err;
        skipped.push({ symbol: row.symbol, name: row.name, reason: `profile fetch failed: ${message}` });
        continue;
      }
      if (!profile.websiteUrl) {
        skipped.push({ symbol: row.symbol, name: row.name, reason: 'no website on profile page' });
        continue;
      }

      const similar = nameTokens.length >= 2 ? existingByPrefix.get(nameTokens.slice(0, 2).join(' ')) : undefined;
      candidates.push({
        rank: row.rank,
        name: row.name,
        symbol: row.symbol,
        exchange,
        websiteUrl: profile.websiteUrl,
        stockAnalyzeUrl,
        marketCap: row.marketCap,
        isin: profile.isin,
        sourceIndustry: profile.sourceIndustry,
        sourceSector: profile.sourceSector,
        description: profile.description,
        possibleDuplicateOf: similar ? `${similar.name} (${similar.symbol}, ${similar.exchange})` : null,
        industryKey: '',
        subIndustryKey: '',
      });
      console.log(`  [${String(candidates.length).padStart(3)}/${count}] #${row.rank} ${row.symbol} — ${row.name}${similar ? '  ⚠ similar name exists' : ''}`);
    }

    if (totalRows !== null && scanned >= totalRows) break;
    page++;
    await sleep(delayMs);
  }

  const file: CandidatesFile = {
    generatedAt: new Date().toISOString(),
    exchange,
    apiBase: API_BASE,
    instructions:
      'For every candidate set industryKey + subIndustryKey to a pair from allowedSubIndustries (use name, sourceIndustry, sourceSector, description). ' +
      'If possibleDuplicateOf is the same company, or it is not an operating company (fund, trust, shell), set skip: true and skipReason. ' +
      'Then run: yarn stocks:populate sql --in <this file>',
    candidates,
    allowedSubIndustries,
  };
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(file, null, 2), 'utf-8');

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} ranked stock(s):`);
    for (const s of skipped) console.log(`  - ${s.symbol} (${s.name}): ${s.reason}`);
  }
  if (candidates.length < count) console.warn(`\nOnly found ${candidates.length} new stocks (asked for ${count}) — the list ran out.`);
  console.log(`\nWrote ${candidates.length} candidates → ${outPath}`);
  console.log('Next: fill industryKey / subIndustryKey for each candidate, then run `yarn stocks:populate sql --in ' + outPath + '`');
}

/** ---------- sql ---------- */

function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

async function runSql(args: Record<string, string | boolean>): Promise<void> {
  const inPath = typeof args['in'] === 'string' ? args['in'] : undefined;
  if (!inPath) throw new Error('Missing required arg --in <candidates.json>');
  const outPath = typeof args['out'] === 'string' ? args['out'] : inPath.replace(/-candidates\.json$|\.json$/, '') + '.sql';

  const file = JSON.parse(await readFile(inPath, 'utf-8')) as CandidatesFile;
  const exchange = requireExchange(file.exchange);
  if (!Array.isArray(file.candidates) || file.candidates.length === 0) throw new Error(`${inPath} has no candidates`);

  // Re-read production state so the SQL reflects what is there now, not when `fetch` ran.
  console.log(`Re-checking existing tickers and in-use sub-industries on ${API_BASE} …`);
  const [existing, allowedSubIndustries] = await Promise.all([fetchExistingTickers(exchange), fetchAllowedSubIndustries()]);
  const existingKeys = new Set(existing.map((t) => existingKey(t.symbol, t.exchange)));
  const allowedPairs = new Set(allowedSubIndustries.map((s) => `${s.industryKey}|${s.subIndustryKey}`));

  const rows: PopulateCandidate[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  let skippedByClaude = 0;
  let alreadyExists = 0;

  for (const c of file.candidates) {
    const symbol = (c.symbol ?? '').trim().toUpperCase();
    const label = `${symbol || '(no symbol)'} (${c.name})`;
    if (c.skip) {
      skippedByClaude++;
      console.log(`  skip ${label}: ${c.skipReason ?? 'marked skip'}`);
      continue;
    }
    if (existingKeys.has(existingKey(symbol, exchange))) {
      alreadyExists++;
      continue;
    }
    if (seen.has(symbol)) {
      problems.push(`${label}: listed twice in the file`);
      continue;
    }
    seen.add(symbol);
    if (!c.name?.trim() || !symbol) problems.push(`${label}: missing name or symbol`);
    if (!c.industryKey || !c.subIndustryKey) problems.push(`${label}: industryKey / subIndustryKey not filled`);
    else if (!allowedPairs.has(`${c.industryKey}|${c.subIndustryKey}`)) {
      problems.push(`${label}: ${c.industryKey} / ${c.subIndustryKey} is not an in-use sub-industry pair`);
    }
    if (!/^https?:\/\/\S+$/i.test(c.websiteUrl ?? '')) problems.push(`${label}: websiteUrl must be an absolute http(s) URL`);
    const urlError = validateStockAnalyzeUrl(symbol, exchange, c.stockAnalyzeUrl) ?? (c.stockAnalyzeUrl ? null : 'missing');
    if (urlError) problems.push(`${label}: stockAnalyzeUrl ${urlError}`);
    rows.push({ ...c, symbol, name: c.name.trim() });
  }

  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s) — fix the candidates file and re-run:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  if (rows.length === 0) throw new Error('Nothing to insert — every candidate is skipped or already exists');

  const columns = [
    'id',
    'name',
    'symbol',
    'exchange',
    'industry_key',
    'sub_industry_key',
    'website_url',
    'stock_analyze_url',
    'space_id',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at',
  ];
  const values = rows.map(
    (r) =>
      `  (${[
        sqlString(randomUUID()),
        sqlString(r.name),
        sqlString(r.symbol),
        sqlString(exchange),
        sqlString(r.industryKey),
        sqlString(r.subIndustryKey),
        sqlString(r.websiteUrl.trim()),
        sqlString(r.stockAnalyzeUrl.trim()),
        sqlString(SPACE_ID),
        sqlString(CREATED_BY),
        sqlString(CREATED_BY),
        'NOW()',
        'NOW()',
      ].join(', ')})`
  );

  const sql = [
    `-- ${rows.length} new ${exchange} stocks for KoalaGains (tickers_v1).`,
    `-- Generated ${new Date().toISOString()} by \`yarn stocks:populate sql\` from ${path.basename(inPath)}.`,
    `-- Re-running is safe: rows that already exist (same space_id + symbol + exchange) are skipped.`,
    `-- Runs in one transaction; an unknown industry/sub-industry aborts the whole insert.`,
    '',
    'BEGIN;',
    '',
    `INSERT INTO "tickers_v1" (${columns.map((c) => `"${c}"`).join(', ')})`,
    'VALUES',
    values.join(',\n'),
    'ON CONFLICT ("space_id", "symbol", "exchange") DO NOTHING;',
    '',
    'COMMIT;',
    '',
    '-- Check:',
    `-- SELECT COUNT(*) FROM "tickers_v1" WHERE "exchange" = '${exchange}' AND "created_by" = '${CREATED_BY}';`,
    '',
  ].join('\n');

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, sql, 'utf-8');
  console.log(`\nWrote ${rows.length} INSERT rows → ${outPath}`);
  if (skippedByClaude > 0) console.log(`  ${skippedByClaude} candidate(s) marked skip`);
  if (alreadyExists > 0) console.log(`  ${alreadyExists} candidate(s) already exist on production — left out`);
}

/** ---------- main ---------- */

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  if (command === 'fetch') return runFetch(args);
  if (command === 'sql') return runSql(args);
  throw new Error(
    'Usage:\n' +
      '  yarn stocks:populate fetch --exchange <PSX|NSE|BSE|…> --count <n> [--out file.json] [--list-path /list/…/] [--delay-ms 1500]\n' +
      '  yarn stocks:populate sql --in <candidates.json> [--out file.sql]'
  );
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
