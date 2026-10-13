// Weekly freshness check for the tariff data the calculator and the chapter pages are built from (issue #1785, Phase 5).
//
//   pnpm tariff:freshness                         # markdown report on stdout
//   pnpm tariff:freshness --out /tmp/fresh.md     # also write it to a file
//   pnpm tariff:freshness --json                  # JSON instead of markdown (with --out: JSON file)
//   pnpm tariff:freshness --days 8                # Federal Register look-back window (default 8 = weekly run + 1 day overlap)
//   pnpm tariff:freshness --since 2026-10-01      # explicit start date instead of --days
//   pnpm tariff:freshness --horizon-days 14       # how far ahead to look for measure start/end dates (default 14)
//   pnpm tariff:freshness --today 2026-10-12      # pretend today is this date (testing)
//
// It only REPORTS — it never edits data or touches a database. Three checks:
//   1. HTS revision: the edition hts.usitc.gov marks "current" vs. the edition every committed data file was built from.
//   2. Federal Register: tariff documents (USTR, presidential documents, BIS Section 232, CBP, any "Chapter 99" HTS
//      amendment) published since the look-back date. Documents already cited in our data are listed separately.
//   3. measures.json: measures whose effectiveFrom / effectiveTo falls within the horizon (scheduled steps going live / ending).
//
// A source that is down (USITC, Federal Register) becomes a line in the report, not a crash. The script exits 0 whenever
// it produced a report; `hasFindings` (JSON) / the `has_findings` GitHub Actions output says whether anything needs a look.
//
// Only Node built-ins + ./lib/hts-source are imported, so the workflow can run it with `npx tsx` without a full install.

import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  compareEditions,
  DATA_SQL_DIR,
  editionLabel,
  fetchCurrentHtsRelease,
  HtsEditionNumber,
  HtsRelease,
  INSIGHTS_UI_ROOT,
  parseCliArgs,
  parseEdition,
  stringArg,
} from './lib/hts-source';

const CALCULATOR_DIR = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator');
const CHAPTERS_DIR = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'chapters');
const FR_API = 'https://www.federalregister.gov/api/v1/documents.json';
const FR_TIMEOUT_MS = 30_000;
const FR_MAX_PAGES = 5;
const RUNBOOK = 'docs/insights-ui/tariffs/calculator-data-refresh.md';
const CHAPTER_RUNBOOK = 'docs/insights-ui/tariffs/chapter-content-refresh.md';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditionSource {
  /** Repo-relative file (or group of files). */
  source: string;
  edition: string;
}

interface HtsCheck {
  current: HtsRelease | null;
  /** Every place the repo records the edition its data was built from. */
  recorded: EditionSource[];
  /** Oldest recorded edition (what "our data" is effectively built from). */
  oldestRecorded: string | null;
  /** Recorded sources older than the current release. */
  stale: EditionSource[];
}

interface FrDocument {
  documentNumber: string;
  title: string;
  publicationDate: string;
  type: string;
  agencies: string[];
  citation: string | null;
  effectiveOn: string | null;
  htmlUrl: string;
  /** Labels of the queries that returned it. */
  matchedBy: string[];
  /** True when a committed data file already cites this document. */
  alreadyCited: boolean;
}

interface UpcomingMeasureGroup {
  date: string;
  event: 'starts' | 'ends';
  program: string;
  ch99Code: string;
  count: number;
  sampleKeys: string[];
}

interface FreshnessReport {
  generatedAt: string;
  today: string;
  federalRegisterSince: string;
  horizonUntil: string;
  hasFindings: boolean;
  hts: HtsCheck;
  federalRegister: { queries: string[]; failedQueries: string[]; newDocuments: FrDocument[]; alreadyCited: FrDocument[] };
  upcomingMeasures: UpcomingMeasureGroup[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function rel(file: string): string {
  return path.relative(path.resolve(INSIGHTS_UI_ROOT, '..'), file);
}

function tryParseEdition(edition: string): HtsEditionNumber | null {
  try {
    return parseEdition(edition);
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Escape text for a markdown table cell. */
function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// 1. HTS revision
// ---------------------------------------------------------------------------

/** Every place the committed data records the HTS edition it was built from. */
function recordedEditions(): EditionSource[] {
  const out: EditionSource[] = [];

  // Calculator data files carry a top-level "htsEdition".
  for (const name of readdirSync(CALCULATOR_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()) {
    const data = readJson(path.join(CALCULATOR_DIR, name)) as { htsEdition?: unknown };
    if (typeof data?.htsEdition === 'string') out.push({ source: rel(path.join(CALCULATOR_DIR, name)), edition: data.htsEdition });
  }

  // Chapter content files cite the schedule they were checked against in tariffUpdates.now.edition — grouped per edition.
  if (existsSync(CHAPTERS_DIR)) {
    const perEdition = new Map<string, number>();
    for (const name of readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.json'))) {
      const data = readJson(path.join(CHAPTERS_DIR, name)) as { tariffUpdates?: { now?: { edition?: unknown } } };
      const edition = data?.tariffUpdates?.now?.edition;
      if (typeof edition === 'string') perEdition.set(edition, (perEdition.get(edition) ?? 0) + 1);
    }
    for (const [edition, n] of perEdition) out.push({ source: `${rel(CHAPTERS_DIR)}/*.json (${n} chapter file${n === 1 ? '' : 's'})`, edition });
  }

  // Newest data SQL file: <YYYYMMDD>-<year>-revision-<n>[-suffix].sql / <YYYYMMDD>-<year>-basic-edition[-suffix].sql.
  if (existsSync(DATA_SQL_DIR)) {
    let newest: { file: string; edition: HtsEditionNumber } | null = null;
    for (const name of readdirSync(DATA_SQL_DIR).filter((f) => f.endsWith('.sql'))) {
      const m = /^\d{8}-(\d{4})-(?:revision-(\d+)|basic-edition)/.exec(name);
      if (!m) continue;
      const edition = { year: Number(m[1]), rev: m[2] ? Number(m[2]) : 0 };
      if (!newest || compareEditions(edition, newest.edition) > 0 || (compareEditions(edition, newest.edition) === 0 && name > newest.file)) {
        newest = { file: name, edition };
      }
    }
    if (newest) out.push({ source: `${rel(path.join(DATA_SQL_DIR, newest.file))} (newest data SQL)`, edition: editionLabel(newest.edition) });
  }
  return out;
}

async function checkHts(errors: string[]): Promise<HtsCheck> {
  const recorded = recordedEditions();
  const parsed = recorded.map((r) => ({ ...r, num: tryParseEdition(r.edition) }));
  for (const r of parsed.filter((x) => !x.num)) errors.push(`${r.source}: cannot parse HTS edition "${r.edition}"`);
  const valid = parsed.filter((x): x is EditionSource & { num: HtsEditionNumber } => x.num !== null);
  const oldest = valid.reduce<(typeof valid)[number] | null>((acc, x) => (!acc || compareEditions(x.num, acc.num) < 0 ? x : acc), null);

  let current: HtsRelease | null = null;
  try {
    current = await fetchCurrentHtsRelease();
  } catch (err) {
    errors.push(`HTS revision check skipped — ${(err as Error).message}`);
  }
  const stale = current ? valid.filter((x) => compareEditions(x.num, current as HtsRelease) < 0).map(({ source, edition }) => ({ source, edition })) : [];
  return { current, recorded, oldestRecorded: oldest?.edition ?? null, stale };
}

// ---------------------------------------------------------------------------
// 2. Federal Register
// ---------------------------------------------------------------------------

interface FrQuery {
  label: string;
  /** Extra query-string conditions (already in FR API syntax). */
  params: [string, string][];
}

const HTS_TERMS = '"Harmonized Tariff Schedule" | "Chapter 99" | "Section 301" | "Section 232"';

const FR_QUERIES: FrQuery[] = [
  { label: 'USTR', params: [['conditions[agencies][]', 'trade-representative-office-of-united-states']] },
  {
    label: 'Presidential documents',
    params: [
      ['conditions[type][]', 'PRESDOCU'],
      ['conditions[term]', HTS_TERMS],
    ],
  },
  {
    label: 'Commerce/BIS Section 232',
    params: [
      ['conditions[agencies][]', 'industry-and-security-bureau'],
      ['conditions[term]', '"Section 232"'],
    ],
  },
  {
    label: 'CBP',
    params: [
      ['conditions[agencies][]', 'u-s-customs-and-border-protection'],
      // Not "Harmonized Tariff Schedule": nearly every CBP rule cites the HTS in passing.
      ['conditions[term]', '"Chapter 99" | "Section 301" | "Section 232"'],
    ],
  },
  // Any agency amending Chapter 99 of the HTS (e.g. USDA safeguard triggers).
  { label: 'Any agency: "Chapter 99" + HTS', params: [['conditions[term]', '"Chapter 99" "Harmonized Tariff Schedule"']] },
];

const FR_FIELDS = ['document_number', 'title', 'publication_date', 'type', 'agencies', 'citation', 'effective_on', 'html_url'];

interface FrApiDocument {
  document_number?: string;
  title?: string;
  publication_date?: string;
  type?: string;
  agencies?: { name?: string; raw_name?: string }[];
  citation?: string | null;
  effective_on?: string | null;
  html_url?: string;
}

interface FrApiPage {
  count?: number;
  results?: FrApiDocument[];
  next_page_url?: string | null;
  errors?: unknown;
}

async function fetchFrPage(url: string): Promise<FrApiPage> {
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt > 1) await sleep(5_000);
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(FR_TIMEOUT_MS) });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status >= 400 && res.status < 500 && res.status !== 429) break; // a bad query won't fix itself
        continue;
      }
      const body = (await res.json()) as FrApiPage;
      if (body.errors) {
        lastError = `API error ${JSON.stringify(body.errors)}`;
        break;
      }
      return body;
    } catch (err) {
      lastError = (err as Error).name === 'TimeoutError' ? `timed out after ${FR_TIMEOUT_MS / 1000}s` : (err as Error).message;
    }
  }
  throw new Error(lastError);
}

function frQueryUrl(query: FrQuery, since: string, until: string): string {
  const qs = new URLSearchParams();
  qs.set('per_page', '100');
  qs.set('order', 'newest');
  qs.set('conditions[publication_date][gte]', since);
  qs.set('conditions[publication_date][lte]', until);
  for (const f of FR_FIELDS) qs.append('fields[]', f);
  for (const [k, v] of query.params) qs.append(k, v);
  return `${FR_API}?${qs.toString()}`;
}

/** Federal Register document numbers (e.g. "2026-15181") cited anywhere in the committed calculator + chapter data. */
function citedFrDocumentNumbers(): Set<string> {
  const cited = new Set<string>();
  const re = /federalregister\.gov\/(?:documents|d)\/(?:\d{4}\/\d{2}\/\d{2}\/)?(\d{4}-\d{4,6})/g;
  for (const dir of [CALCULATOR_DIR, CHAPTERS_DIR]) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      for (const m of readFileSync(path.join(dir, name), 'utf8').matchAll(re)) cited.add(m[1]);
    }
  }
  return cited;
}

async function checkFederalRegister(
  since: string,
  until: string,
  errors: string[]
): Promise<{ failedQueries: string[]; newDocuments: FrDocument[]; alreadyCited: FrDocument[] }> {
  const byNumber = new Map<string, FrDocument>();
  const failedQueries: string[] = [];
  for (const query of FR_QUERIES) {
    let url: string | null = frQueryUrl(query, since, until);
    try {
      for (let page = 1; url && page <= FR_MAX_PAGES; page++) {
        const body = await fetchFrPage(url);
        for (const d of body.results ?? []) {
          if (!d.document_number) continue;
          const existing = byNumber.get(d.document_number);
          if (existing) {
            if (!existing.matchedBy.includes(query.label)) existing.matchedBy.push(query.label);
            continue;
          }
          byNumber.set(d.document_number, {
            documentNumber: d.document_number,
            title: d.title ?? '(untitled)',
            publicationDate: d.publication_date ?? '',
            type: d.type ?? '',
            agencies: [...new Set((d.agencies ?? []).map((a) => a.name ?? a.raw_name ?? '').filter(Boolean))],
            citation: d.citation ?? null,
            effectiveOn: d.effective_on ?? null,
            htmlUrl: d.html_url ?? `https://www.federalregister.gov/d/${d.document_number}`,
            matchedBy: [query.label],
            alreadyCited: false,
          });
        }
        url = body.next_page_url ?? null;
        if (url && page === FR_MAX_PAGES) errors.push(`Federal Register query "${query.label}": more than ${FR_MAX_PAGES * 100} results, list truncated`);
      }
    } catch (err) {
      failedQueries.push(query.label);
      errors.push(`Federal Register query "${query.label}" failed — ${(err as Error).message} (${FR_API})`);
    }
  }
  const cited = citedFrDocumentNumbers();
  const docs = [...byNumber.values()]
    .map((d) => ({ ...d, alreadyCited: cited.has(d.documentNumber) }))
    .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate) || a.documentNumber.localeCompare(b.documentNumber));
  return { failedQueries, newDocuments: docs.filter((d) => !d.alreadyCited), alreadyCited: docs.filter((d) => d.alreadyCited) };
}

// ---------------------------------------------------------------------------
// 3. Measures with dates coming up
// ---------------------------------------------------------------------------

interface MeasureRow {
  measureKey: string;
  program: string;
  ch99Code: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

function upcomingMeasures(today: string, until: string, errors: string[]): UpcomingMeasureGroup[] {
  const file = path.join(CALCULATOR_DIR, 'measures.json');
  let measures: MeasureRow[];
  try {
    measures = (readJson(file) as { measures: MeasureRow[] }).measures;
  } catch (err) {
    errors.push(`${rel(file)}: could not read measures — ${(err as Error).message}`);
    return [];
  }
  const groups = new Map<string, UpcomingMeasureGroup>();
  for (const m of measures) {
    for (const [event, date] of [
      ['starts', m.effectiveFrom],
      ['ends', m.effectiveTo],
    ] as const) {
      if (!date || date < today || date > until) continue;
      const key = `${date}|${event}|${m.program}|${m.ch99Code}`;
      const g = groups.get(key) ?? { date, event, program: m.program, ch99Code: m.ch99Code, count: 0, sampleKeys: [] };
      g.count++;
      if (g.sampleKeys.length < 3) g.sampleKeys.push(m.measureKey);
      groups.set(key, g);
    }
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date) || a.ch99Code.localeCompare(b.ch99Code));
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function renderMarkdown(r: FreshnessReport): string {
  const lines: string[] = [];
  lines.push(`## Tariff data freshness report — ${r.today}`);
  lines.push('');
  lines.push(
    `Checked the HTS release list (hts.usitc.gov), Federal Register documents published ${r.federalRegisterSince} → ${r.today}, and measure dates in \`measures.json\` through ${r.horizonUntil}. ` +
      'This report is generated by `pnpm tariff:freshness`; it changes nothing — a person reviews each item and applies it through the runbooks.'
  );
  lines.push('');
  lines.push(r.hasFindings ? '**Result: updates to review (see below).**' : '**Result: nothing to review.**');

  // 1. HTS
  lines.push('', '### 1. HTS revision', '');
  const { current, stale, oldestRecorded } = r.hts;
  if (current) {
    const dates = [current.date && `published ${current.date}`, current.releaseStartDate && `in force from ${current.releaseStartDate}`]
      .filter(Boolean)
      .join(', ');
    lines.push(`- Current USITC release: **${current.label}** (\`${current.name}\`${dates ? `, ${dates}` : ''})`);
  } else {
    lines.push('- Current USITC release: **unknown** (the release list could not be read — see "Check errors")');
  }
  lines.push(`- Our data is built from: **${oldestRecorded ?? 'unknown'}** (oldest edition recorded in the committed data)`);
  if (current && stale.length === 0) lines.push('- Up to date: every data file records the current edition.');
  if (stale.length) {
    lines.push(`- **A newer HTS revision is published (${current?.label}).** Files still built from an older edition:`, '');
    lines.push('| File | Edition |', '| --- | --- |');
    for (const s of stale) lines.push(`| \`${cell(s.source)}\` | ${cell(s.edition)} |`);
    lines.push('', `  Apply it with \`${RUNBOOK}\` (calculator data) and \`${CHAPTER_RUNBOOK}\` (chapter pages).`);
  }

  // 2. Federal Register
  const { newDocuments, alreadyCited, failedQueries } = r.federalRegister;
  lines.push('', `### 2. Federal Register documents (${newDocuments.length} not yet cited in our data)`, '');
  lines.push(`Queries: ${r.federalRegister.queries.join('; ')}.`, '');
  if (newDocuments.length) {
    lines.push('| Published | Type | Agency | Document | Title | Matched by |', '| --- | --- | --- | --- | --- | --- |');
    for (const d of newDocuments) {
      const doc = `[${d.documentNumber}](${d.htmlUrl})${d.citation ? ` (${d.citation})` : ''}`;
      const effective = d.effectiveOn ? ` — effective ${d.effectiveOn}` : '';
      lines.push(
        `| ${d.publicationDate} | ${cell(d.type)} | ${cell(d.agencies.join(', '))} | ${doc} | ${cell(d.title)}${effective} | ${cell(d.matchedBy.join(', '))} |`
      );
    }
    lines.push(
      '',
      `  For each: does it add, change or end a duty on a chapter we cover? If so, update the measure definitions / chapter files per \`${RUNBOOK}\`.`
    );
  } else if (failedQueries.length === r.federalRegister.queries.length) {
    lines.push('- **Not checked**: every query failed (see "Check errors").');
  } else {
    lines.push('- None.');
  }
  if (failedQueries.length && failedQueries.length < r.federalRegister.queries.length) {
    lines.push(
      '',
      `  Incomplete: ${failedQueries.length} quer${failedQueries.length === 1 ? 'y' : 'ies'} failed (${failedQueries.join('; ')}) — see "Check errors".`
    );
  }
  if (alreadyCited.length) {
    lines.push('', `Already cited in our data (no action): ${alreadyCited.map((d) => `[${d.documentNumber}](${d.htmlUrl})`).join(', ')}`);
  }

  // 3. Measures
  lines.push('', `### 3. Measures with a start/end date by ${r.horizonUntil}`, '');
  if (r.upcomingMeasures.length) {
    lines.push('| Date | Event | Program | Ch. 99 | Measures |', '| --- | --- | --- | --- | --- |');
    for (const g of r.upcomingMeasures) {
      const keys = g.sampleKeys.map((k) => `\`${k}\``).join(', ') + (g.count > g.sampleKeys.length ? `, … (${g.count} total)` : '');
      lines.push(`| ${g.date} | ${g.event} | ${cell(g.program)} | ${g.ch99Code} | ${keys} |`);
    }
    lines.push('', '  Check the step is still on schedule (no delay/extension published) and that the calculator and chapter pages show it on that date.');
  } else {
    lines.push('- None.');
  }

  if (r.errors.length) {
    lines.push('', '### Check errors', '');
    for (const e of r.errors) lines.push(`- ${e}`);
    lines.push('', '  A source that was down is re-checked on the next run; run `pnpm tariff:freshness` locally to retry now.');
  }
  lines.push('');
  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const today = stringArg(args, 'today') ?? isoDate(new Date());
  const days = Number(stringArg(args, 'days') ?? 8);
  const horizonDays = Number(stringArg(args, 'horizon-days') ?? 14);
  const since = stringArg(args, 'since') ?? addDays(today, -days);
  for (const [name, v] of [
    ['today', today],
    ['since', since],
  ] as const) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`--${name} must be YYYY-MM-DD (got "${v}")`);
  }
  if (!Number.isInteger(days) || days < 1) throw new Error('--days must be a positive integer');
  if (!Number.isInteger(horizonDays) || horizonDays < 0) throw new Error('--horizon-days must be a non-negative integer');
  const horizonUntil = addDays(today, horizonDays);

  const errors: string[] = [];
  const [hts, fr] = await Promise.all([checkHts(errors), checkFederalRegister(since, today, errors)]);
  const upcoming = upcomingMeasures(today, horizonUntil, errors);

  const report: FreshnessReport = {
    generatedAt: new Date().toISOString(),
    today,
    federalRegisterSince: since,
    horizonUntil,
    hasFindings: hts.stale.length > 0 || fr.newDocuments.length > 0 || upcoming.length > 0 || errors.length > 0,
    hts,
    federalRegister: { queries: FR_QUERIES.map((q) => q.label), ...fr },
    upcomingMeasures: upcoming,
    errors,
  };

  const output = args.json ? `${JSON.stringify(report, null, 2)}\n` : renderMarkdown(report);
  process.stdout.write(output);
  const out = stringArg(args, 'out');
  if (out) {
    writeFileSync(path.resolve(out), output);
    console.error(`Wrote ${path.resolve(out)}`);
  }
  // In GitHub Actions, expose whether there is anything to report.
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `has_findings=${report.hasFindings}\n`);
}

main().catch((err) => {
  console.error(`tariff:freshness failed: ${(err as Error).message}`);
  process.exit(1);
});
