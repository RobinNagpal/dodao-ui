import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { TariffChapterPrototype, TariffEditionRef } from '@/types/tariff-chapter-prototype';
import type { TariffChapterExports } from '@/types/tariff-chapter-exports';
import { getChapterExports, listChapterExportSlugs } from '@/utils/tariff-reports/chapter-exports';
import { getChapterPrototype, listChapterPrototypeSlugs } from '@/utils/tariff-reports/chapter-prototype';
import { parseArgs, parsePositiveInt } from '../tickers/lib';

/**
 * Validate the Approach-2 tariff chapter content files
 * (`src/tariff-data/chapters/<slug>.json` + `exports/<slug>/*.json`).
 *
 *   pnpm tariff:validate-chapters                       # every registered chapter
 *   pnpm tariff:validate-chapters --chapter 30-pharmaceutical-products
 *   pnpm tariff:validate-chapters --max-age-days 14     # stricter freshness window (default 30)
 *   pnpm tariff:validate-chapters --check-hts           # also ask usitc.gov whether a newer HTS revision exists
 *   pnpm tariff:validate-chapters --strict              # treat warnings as errors
 *
 * Exits 1 when any ERROR is found. WARNINGs (unknown source hosts, stale
 * check dates, a newer HTS revision) are printed but don't fail the run unless
 * --strict is passed. See docs/insights-ui/tariffs/chapter-content-refresh.md.
 */

/**
 * Hosts accepted as official sources. A URL passes when its host equals an
 * entry or is a subdomain of it (so `www.federalregister.gov` and
 * `aphis.usda.gov` both match). Unknown hosts are warnings, not errors —
 * foreign official sites vary. Extend this list rather than ignoring warnings.
 */
export const OFFICIAL_SOURCE_DOMAINS: readonly string[] = [
  // U.S. — schedule, legal texts, proclamations
  'federalregister.gov',
  'govinfo.gov',
  'whitehouse.gov',
  'usitc.gov', // includes hts.usitc.gov, dataweb.usitc.gov
  'ecfr.gov',
  'congress.gov',
  'house.gov', // uscode.house.gov — U.S. Code
  // U.S. — agencies
  'cbp.gov',
  'content.govdelivery.com', // CBP CSMS messages
  'ustr.gov',
  'bis.gov',
  'bis.doc.gov',
  'commerce.gov',
  'trade.gov',
  'usda.gov', // includes aphis.usda.gov, fas.usda.gov
  'fda.gov',
  'dea.gov',
  'census.gov',
  // U.S. courts
  'supremecourt.gov',
  'uscourts.gov', // includes cit.uscourts.gov, cafc.uscourts.gov
  // Trade data / multilateral
  'comtrade.un.org',
  'comtradeplus.un.org',
  'wto.org',
  'wits.worldbank.org', // World Bank / UNCTAD tariff data
  // Foreign official
  'eur-lex.europa.eu',
  'ec.europa.eu',
  'policy.trade.ec.europa.eu',
  'gov.uk',
  'canada.ca',
  'cbsa-asfc.gc.ca',
  'gob.mx',
  'dof.gob.mx',
  'mofcom.gov.cn',
  'customs.gov.cn',
  'gov.cn', // other PRC ministries / regulators (e.g. NMPA)
  'europa.eu', // other EU institutions (e.g. EMA)
  'gc.ca', // Canada Gazette and other federal sites
  'go.jp', // Japan Customs, PMDA, ministries
  'admin.ch', // Swiss federal administration (SECO)
  'swissmedic.ch',
  'gov.br',
  'cso.ie', // Ireland Central Statistics Office
];

/** Keys whose string value is a date. All must be ISO YYYY-MM-DD and not in the future. */
const DATE_KEYS = new Set(['date', 'published', 'signed', 'released', 'inForceFrom', 'effectiveFrom', 'lastCheckedAt', 'asOf', 'regulationsAsOf']);
/** Keys whose age drives the freshness warning. */
const FRESHNESS_KEYS = new Set(['lastCheckedAt', 'asOf']);
/** Section slugs a FAQ `link` may point at ('' = the chapter overview). */
const FAQ_LINK_SLUGS = new Set(['', 'tariff-updates', 'understand-industry', 'industry-areas', 'tariff-engineering', 'final-conclusion', 'exports']);

type Level = 'ERROR' | 'WARN';

interface Finding {
  level: Level;
  where: string;
  message: string;
}

interface Options {
  maxAgeDays: number;
  checkHts: boolean;
  today: string;
}

class Report {
  readonly findings: Finding[] = [];
  error(where: string, message: string): void {
    this.findings.push({ level: 'ERROR', where, message });
  }
  warn(where: string, message: string): void {
    this.findings.push({ level: 'WARN', where, message });
  }
  get errorCount(): number {
    return this.findings.filter((f) => f.level === 'ERROR').length;
  }
  get warnCount(): number {
    return this.findings.filter((f) => f.level === 'WARN').length;
  }
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

function isObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function todayIso(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

function isOfficialHost(host: string): boolean {
  const h = host.toLowerCase();
  return OFFICIAL_SOURCE_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
}

function checkUrl(report: Report, where: string, url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    report.error(where, `invalid URL "${url}"`);
    return;
  }
  if (parsed.protocol !== 'https:') report.error(where, `URL must be https: "${url}"`);
  if (!isOfficialHost(parsed.hostname)) report.warn(where, `host "${parsed.hostname}" is not in OFFICIAL_SOURCE_DOMAINS (${url})`);
}

/** The `sources` array of a page, when it holds id-keyed source objects. */
function sourceIdsOf(node: JsonObject): Set<string> | null {
  const sources = node.sources;
  if (!Array.isArray(sources) || !sources.some((s) => isObject(s) && typeof s.id === 'string')) return null;
  return new Set(sources.filter(isObject).map((s) => String(s.id)));
}

/**
 * Generic walk over one content document. Discovers every field by name, so
 * new fields that follow the conventions are validated without code changes:
 *  - `sourceIds` resolve against the nearest enclosing `sources` (the page's own list)
 *  - date keys are ISO and not in the future (pending changes may be future-dated: WARN)
 *  - `url` values are https on an official host
 *  - arrays of objects with `id` have unique ids
 *  - an object with `sources` (id-keyed) must define `published` on every source
 */
function walk(report: Report, opts: Options, node: Json, where: string, scope: Set<string> | null, futureOk: boolean): void {
  if (Array.isArray(node)) {
    const ids = new Map<string, number>();
    node.forEach((item, i) => {
      if (isObject(item) && typeof item.id === 'string') ids.set(item.id, (ids.get(item.id) ?? 0) + 1);
      const label = isObject(item) && typeof item.id === 'string' ? `${where}[${item.id}]` : `${where}[${i}]`;
      walk(report, opts, item, label, scope, futureOk);
    });
    for (const [id, count] of ids) if (count > 1) report.error(where, `duplicate id "${id}" (${count}×)`);
    return;
  }
  if (!isObject(node)) return;

  const ownScope = sourceIdsOf(node);
  if (ownScope) {
    scope = ownScope;
    (node.sources as Json[]).filter(isObject).forEach((s) => {
      const w = `${where}.sources[${String(s.id)}]`;
      if (typeof s.published !== 'string' || !s.published) report.error(w, 'missing `published` date');
      if (typeof s.url !== 'string' || !s.url) report.error(w, 'missing `url`');
    });
  }
  const pendingChange = node.type === 'pending';

  for (const [key, value] of Object.entries(node)) {
    const w = `${where}.${key}`;
    if (key === 'effectiveSourceId') {
      // The document that put an in-effect rate in force: must resolve, and must be one of the entry's own citations.
      if (typeof value !== 'string' || !value) report.error(w, 'missing — cite the document that put the current rate in force');
      else if (!scope || !scope.has(value)) report.error(w, `unknown source id "${value}"`);
      else if (Array.isArray(node.sourceIds) && !node.sourceIds.includes(value)) report.error(w, `"${value}" is not in this entry's sourceIds`);
      continue;
    }
    if (key === 'sourceIds' && Array.isArray(value)) {
      if (!scope) report.error(w, 'sourceIds used but no `sources` list with ids encloses it');
      else for (const id of value) if (typeof id !== 'string' || !scope.has(id)) report.error(w, `unknown source id "${String(id)}"`);
      if (value.length === 0) report.warn(w, 'empty sourceIds — every fact should cite a source');
      continue;
    }
    if (DATE_KEYS.has(key) && typeof value === 'string') {
      if (!isIsoDate(value)) report.error(w, `"${value}" is not an ISO date (YYYY-MM-DD)`);
      else if (value > opts.today) {
        if (futureOk || pendingChange) report.warn(w, `${value} is in the future (allowed for a pending change)`);
        else report.error(w, `${value} is in the future`);
      } else if (FRESHNESS_KEYS.has(key)) {
        const age = daysBetween(value, opts.today);
        if (age > opts.maxAgeDays) report.warn(w, `${value} is ${age} days old (> ${opts.maxAgeDays}) — re-check the sources`);
      }
      continue;
    }
    if (key === 'url' && typeof value === 'string') {
      checkUrl(report, w, value);
      continue;
    }
    walk(report, opts, value, w, scope, futureOk);
  }
}

/** Dated change logs must be newest-first. */
function checkSortedNewestFirst(report: Report, where: string, entries: { id: string; date: string }[] | undefined): void {
  if (!entries) return;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].date > entries[i - 1].date) {
      report.error(where, `not sorted newest-first: "${entries[i].id}" (${entries[i].date}) comes after "${entries[i - 1].id}" (${entries[i - 1].date})`);
    }
  }
}

/** Every in-effect measure must say since when its current rate applies and which official document put it in force. */
function checkInEffectDated(report: Report, where: string, entries: { id: string; effectiveFrom?: string; effectiveSourceId?: string }[] | undefined): void {
  for (const e of entries ?? []) {
    if (!e.effectiveFrom) report.error(`${where}[${e.id}]`, 'missing `effectiveFrom` — the date the current rate took effect');
    if (!e.effectiveSourceId) report.error(`${where}[${e.id}]`, 'missing `effectiveSourceId` — the official document that put it in force');
  }
}

function checkPrototype(report: Report, opts: Options, slug: string, p: TariffChapterPrototype): void {
  const where = slug;
  if (p.chapter.slug !== slug) report.error(where, `chapter.slug "${p.chapter.slug}" does not match the registered slug`);
  walk(report, opts, p as unknown as Json, where, null, false);

  const tu = p.tariffUpdates;
  if (tu) {
    checkSortedNewestFirst(report, `${where}.tariffUpdates.changes`, tu.changes);
    checkInEffectDated(report, `${where}.tariffUpdates.inEffect`, tu.inEffect);
    if (tu.before.inForceFrom > tu.now.inForceFrom) report.error(`${where}.tariffUpdates`, 'before edition is newer than now edition');
  }

  const ia = p.industryAreas;
  if (ia && tu && ia.scheduleEdition !== tu.now.edition) {
    report.warn(`${where}.industryAreas.scheduleEdition`, `"${ia.scheduleEdition}" differs from tariffUpdates.now.edition "${tu.now.edition}"`);
  }
  if (ia) {
    const headings = new Set(ia.groups.map((g) => g.heading));
    ia.countries.forEach((c) => {
      for (const h of Object.keys(c.cells))
        if (!headings.has(h)) report.error(`${where}.industryAreas.countries[${c.country}]`, `cell for unknown heading ${h}`);
    });
  }

  const te = p.tariffEngineering;
  if (te) {
    const ruleIds = new Set(te.rules.map((r) => r.id));
    const leverIds = new Set(te.levers.map((l) => l.id));
    te.groups.forEach((g) =>
      g.ruleIds.forEach((id) => !ruleIds.has(id) && report.error(`${where}.tariffEngineering.groups[${g.heading}]`, `unknown rule id "${id}"`))
    );
    te.lines.forEach((l) => {
      l.ruleIds.forEach((id) => !ruleIds.has(id) && report.error(`${where}.tariffEngineering.lines[${l.hts}]`, `unknown rule id "${id}"`));
      l.leverIds.forEach((id) => !leverIds.has(id) && report.error(`${where}.tariffEngineering.lines[${l.hts}]`, `unknown lever id "${id}"`));
    });
    [...te.rules, ...te.levers].forEach((x) => {
      if (x.citations.length === 0) report.warn(`${where}.tariffEngineering[${x.id}]`, 'no citations');
    });
  }

  const fc = p.finalConclusion;
  if (fc) {
    fc.faqs.forEach((f) => {
      if (!FAQ_LINK_SLUGS.has(f.link)) report.error(`${where}.finalConclusion.faqs[${f.id}]`, `link "${f.link}" is not a chapter section slug`);
      else if (f.link && !(p as unknown as JsonObject)[camel(f.link)] && f.link !== 'exports' && f.link !== 'final-conclusion') {
        report.error(`${where}.finalConclusion.faqs[${f.id}]`, `link "${f.link}" points at a page this chapter has not built`);
      }
    });
  }
}

function camel(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function checkExports(report: Report, opts: Options, slug: string, e: TariffChapterExports): void {
  for (const [name, page] of Object.entries(e)) {
    const where = `${slug}/exports/${name}`;
    if (page.chapter.slug !== slug) report.error(where, `chapter.slug "${page.chapter.slug}" does not match the registered slug`);
    walk(report, opts, page as unknown as Json, where, null, false);
  }
  checkSortedNewestFirst(report, `${slug}/exports/tariffUpdates.changes`, e.tariffUpdates.changes);
  checkInEffectDated(report, `${slug}/exports/tariffUpdates.inEffect`, e.tariffUpdates.inEffect);
}

/** Content files on disk that no loader registers — they never render. */
function findUnregisteredFiles(report: Report, registered: string[], registeredExports: string[]): void {
  const dir = path.resolve(process.cwd(), 'src/tariff-data/chapters');
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    report.warn('tariff-data', `cannot read ${dir}`);
    return;
  }
  // Files are named with a zero-padded chapter number; slugs are not.
  const unpad = (name: string): string => name.replace(/^0+(\d)/, '$1');
  for (const name of entries) {
    if (name.endsWith('.json') && !registered.includes(unpad(name.replace(/\.json$/, '')))) {
      report.warn(`tariff-data/chapters/${name}`, 'content file is not registered in chapter-prototype.ts');
    }
  }
  const exportsDir = path.join(dir, 'exports');
  try {
    for (const name of readdirSync(exportsDir)) {
      if (statSync(path.join(exportsDir, name)).isDirectory() && !registeredExports.includes(unpad(name))) {
        report.warn(`tariff-data/chapters/exports/${name}`, 'export content folder is not registered in chapter-exports.ts');
      }
    }
  } catch {
    // No exports folder — nothing to check.
  }
}

// ---------------------------------------------------------------------------
// Optional network check: is the cited HTS edition the newest one published?
// ---------------------------------------------------------------------------

const HTS_BASE = 'https://www.usitc.gov/sites/default/files/tata/hts';

async function urlExists(url: string): Promise<boolean | null> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined, signal: AbortSignal.timeout(15_000) });
      // A soft-404 HTML page would also answer 200 — only a JSON response counts.
      if (res.ok || res.status === 206) return !(res.headers.get('content-type') ?? '').includes('text/html');
      if (res.status === 404) return false;
      // Some servers reject HEAD (405/403) — retry with a ranged GET.
    } catch {
      // Network error / timeout — try the next method, then give up.
    }
  }
  return null;
}

const newestEditionCache = new Map<string, Promise<string | null>>();

/** Probe usitc.gov for revisions after the cited one; returns the newest found edition label, or null if the cited one is newest. */
function findNewerHtsEdition(edition: string): Promise<string | null> {
  const cached = newestEditionCache.get(edition);
  if (cached) return cached;
  const promise = (async (): Promise<string | null> => {
    const m = /^(\d{4}) (?:Revision (\d+)|Basic Edition)$/i.exec(edition.trim());
    if (!m) throw new Error(`cannot parse HTS edition "${edition}" (expected "<year> Revision <n>" or "<year> Basic Edition")`);
    let year = Number(m[1]);
    let rev = m[2] ? Number(m[2]) : 0;
    let newest: string | null = null;

    // Next year's basic edition supersedes every revision of this year.
    const nextBasic = await urlExists(`${HTS_BASE}/hts_${year + 1}_basic_edition_json.json`);
    if (nextBasic === null) throw new Error('usitc.gov did not answer');
    if (nextBasic) {
      year += 1;
      rev = 0;
      newest = `${year} Basic Edition`;
    }
    // Walk revisions forward; stop after two consecutive misses (numbers are occasionally skipped).
    let misses = 0;
    for (let n = rev + 1; misses < 2 && n < rev + 60; n++) {
      const exists = await urlExists(`${HTS_BASE}/hts_${year}_revision_${n}_json.json`);
      if (exists === null) throw new Error('usitc.gov did not answer');
      if (exists) {
        newest = `${year} Revision ${n}`;
        misses = 0;
      } else misses++;
    }
    return newest;
  })();
  newestEditionCache.set(edition, promise);
  return promise;
}

async function checkHtsEdition(report: Report, where: string, now: TariffEditionRef | undefined): Promise<void> {
  if (!now) return;
  try {
    const newer = await findNewerHtsEdition(now.edition);
    if (newer) report.warn(where, `cites HTS ${now.edition}, but ${newer} is published — refresh the chapter`);
  } catch (err) {
    report.warn(where, `HTS edition check skipped: ${(err as Error).message}`);
  }
}

// ---------------------------------------------------------------------------

function printReport(title: string, report: Report): void {
  const status = report.errorCount ? 'FAIL' : report.warnCount ? 'PASS (with warnings)' : 'PASS';
  console.log(`\n=== ${title} — ${status}: ${report.errorCount} error(s), ${report.warnCount} warning(s)`);
  for (const level of ['ERROR', 'WARN'] as const) {
    for (const f of report.findings.filter((x) => x.level === level)) console.log(`  ${level.padEnd(5)} ${f.where}: ${f.message}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const opts: Options = {
    maxAgeDays: parsePositiveInt(args['max-age-days']) ?? 30,
    checkHts: Boolean(args['check-hts']),
    today: typeof args.today === 'string' ? args.today : todayIso(),
  };
  const only = typeof args.chapter === 'string' ? args.chapter : null;
  const strict = Boolean(args.strict);

  const prototypeSlugs = listChapterPrototypeSlugs();
  const exportSlugs = listChapterExportSlugs();
  const slugs = [...new Set([...prototypeSlugs, ...exportSlugs])].filter((s) => !only || s === only);
  if (only && slugs.length === 0) {
    console.error(`No registered chapter "${only}". Registered: ${prototypeSlugs.join(', ')}`);
    process.exit(1);
  }

  console.log(
    `Validating ${slugs.length} chapter(s) as of ${opts.today} (freshness window ${opts.maxAgeDays} days${opts.checkHts ? ', HTS edition check on' : ''})`
  );

  let errors = 0;
  let warnings = 0;
  const global = new Report();
  if (!only) findUnregisteredFiles(global, prototypeSlugs, exportSlugs);
  if (global.findings.length) printReport('tariff-data', global);
  errors += global.errorCount;
  warnings += global.warnCount;

  for (const slug of slugs) {
    const report = new Report();
    const prototype = getChapterPrototype(slug);
    const exportsContent = getChapterExports(slug);
    if (prototype) {
      checkPrototype(report, opts, slug, prototype);
      if (opts.checkHts) await checkHtsEdition(report, `${slug}.tariffUpdates.now`, prototype.tariffUpdates?.now);
    } else {
      report.error(slug, 'export content is registered but the chapter has no import content file');
    }
    if (exportsContent) checkExports(report, opts, slug, exportsContent);
    printReport(slug, report);
    errors += report.errorCount;
    warnings += report.warnCount;
  }

  console.log(`\nTotal: ${errors} error(s), ${warnings} warning(s)`);
  if (errors > 0 || (strict && warnings > 0)) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
