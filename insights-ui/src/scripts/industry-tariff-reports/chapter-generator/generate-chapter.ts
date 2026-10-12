import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {
  TariffChapterPrototype,
  TariffEngineeringContent,
  TariffFinalConclusionContent,
  TariffStat,
  TariffTradeSnapshot,
  TariffUnderstandIndustryContent,
} from '@/types/tariff-chapter-prototype';
import type { TariffMeasureRecord, TariffMeasuresFile } from '@/types/tariff-calculator-measures';
import { downloadHtsJson, editionFromName, type HtsJsonRow, parseCliArgs, stringArg, urlForEdition } from '../../tariff-calculator/lib/hts-source';
import { contentFileName, liveChapterSlugs, liveChapterTitle, padChapter, sectionForChapter } from './chapter-info';
import { ANY_OTHER_COUNTRY, buildIndustryAreas, type MatrixCountryInput } from './industry-areas';
import { inEffectOn, measureChargesLine, measureReachesLine, programShort } from './line-rates';
import { countTodos, todo, TODO } from './placeholders';
import { buildRateTableRows, chapterJsonRows, headingsOf, leafLines, productGroups, RATE_TABLE_NOTE, spiLegend } from './rate-table';
import { SourceRegistry } from './sources';
import { buildTariffUpdates, countryName, editionRef } from './tariff-updates';
import { loadTradeInput, loadTradeStatsModule, tradeSnapshot, type TradeInput } from './trade-input';

/**
 * Approach-2 chapter content generator (issue #1803): builds the data parts of a chapter content file
 * (`src/tariff-data/chapters/<NN>-<slug>.json`) from official data, and leaves "TODO" placeholders for
 * the writer agents. `pnpm tariff:validate-chapters` fails on any remaining "TODO".
 *
 *   pnpm tariff:generate-chapter --chapter 2 --slug 2-meat-and-offal
 *   pnpm tariff:generate-chapter --chapter 2 --hts-file /tmp/hts_2026_revision_21_json.json --out /tmp/02.json
 *   pnpm tariff:generate-chapter --chapter 1 --trade-file trade.json --claim MU:D --countries CA,MX,NL,DE
 *
 * From data:
 *   chapter          number, live slug (checked against /industry-tariff-report/sitemap.xml), title, HTSUS section
 *   overview         rateTable (HTS JSON: effective rates inherited from the rate-stating parent, ancestorPath,
 *                    searchText, dutiable), productGroups (rate summary + line counts), stats, SPI legend
 *   tariffUpdates    inEffect + changes from measures.json (dates, official sources), before/now editions,
 *                    base-rate status of every line between the 2025 Basic Edition and the current edition
 *   industryAreas    country × heading matrix priced by the official-measures engine (calculateWithMeasures)
 *   understandIndustry  from the trade-statistics module (trade-stats.ts) when it and its data exist
 * Left for writers (TODO): intros, SEO, blurbs, search examples, exemption text, tariffEngineering, finalConclusion.
 *
 * Options:
 *   --chapter N              HTS chapter (required)
 *   --slug <live-slug>       e.g. 2-meat-and-offal; checked against the live sitemap (default: taken from it)
 *   --title <title>          chapter title (default: from the live chapter page)
 *   --hts-file <path>        current HTS JSON (default: download the edition measures.json was reviewed against)
 *   --hts-edition <label>    e.g. "2026 Revision 21" (default: from the file name, else measures.json)
 *   --before-file <path>     earlier HTS JSON (default: download the 2025 Basic Edition); --no-before skips it
 *   --before-edition <label> default "2025 Basic Edition"
 *   --trade-file <path>      { countries: [{ iso2, name, importsUsd, byHeading }] } or a Comtrade trade summary
 *   --countries CA,MX,…      matrix countries (default: top --top-countries by imports, else a default list)
 *   --top-countries N        default 10
 *   --claim MU:D,…           extra preference claims per country (country-tied FTAs are applied automatically)
 *   --as-of YYYY-MM-DD       entry date for the engine and the check dates (default: today)
 *   --out <path>             default src/tariff-data/chapters/<NN>-<slug>.json (won't overwrite without --force)
 *   --cache-dir <dir>        downloads cache (default: <os tmp>/koala-chapter-generator)
 *   --offline                no network (no slug/title check, no Federal Register enrichment, no downloads)
 *   --skip-slug-check        don't compare --slug with the live sitemap
 *   --now-released / --now-in-force YYYY-MM-DD   dates of the current edition when the generator doesn't know them
 */

/** The slice of the prettier v2 API used here (the repo has no @types/prettier) — as in build-ch99-headings.ts. */
interface PrettierApi {
  resolveConfig(filePath: string): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): string;
}

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier'; // non-literal specifier: typed loosely, no declaration file needed
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

const DEFAULT_COUNTRIES = ['CA', 'MX', 'CN', 'DE', 'NL', 'FR', 'IT', 'IE', 'JP', 'IN', 'VN', 'BR', 'GB'];
const GENERATED_BY = 'src/scripts/industry-tariff-reports/chapter-generator/generate-chapter.ts';

/** Local YYYY-MM-DD — the same "today" the validator uses (a UTC date can be tomorrow and fail as future). */
function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

/** HTS JSON for an edition: --file, else the cache dir, else usitc.gov (browser UA + retries, see hts-source.ts). */
async function loadHts(file: string | undefined, edition: string, cacheDir: string, offline: boolean): Promise<HtsJsonRow[]> {
  if (file) return readJson<HtsJsonRow[]>(path.resolve(file));
  const url = urlForEdition(edition);
  const cached = path.join(cacheDir, path.basename(new URL(url).pathname));
  if (existsSync(cached)) return readJson<HtsJsonRow[]>(cached);
  if (offline) throw new Error(`no cached ${path.basename(cached)} and --offline is set`);
  const rows = await downloadHtsJson(url);
  const tmpCopy = path.join(os.tmpdir(), 'koala-hts-json', path.basename(cached));
  if (existsSync(tmpCopy)) {
    mkdirSync(cacheDir, { recursive: true });
    copyFileSync(tmpCopy, cached);
  }
  return rows;
}

function parseClaims(raw: string | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const part of (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const [iso, spi] = part.split(':').map((s) => s.trim());
    if (!iso || !spi) throw new Error(`--claim expects COUNTRY:SPI pairs, got "${part}"`);
    out[iso.toUpperCase()] = [...(out[iso.toUpperCase()] ?? []), spi];
  }
  return out;
}

function matrixCountries(trade: TradeInput | null, explicit: string[] | null, top: number): MatrixCountryInput[] {
  const byIso = new Map((trade?.countries ?? []).map((c) => [c.iso, c]));
  const pick =
    explicit ??
    (trade
      ? trade.countries
          .filter((c) => c.iso !== 'US')
          .slice(0, top)
          .map((c) => c.iso)
      : DEFAULT_COUNTRIES);
  return pick.map((iso) => {
    const t = byIso.get(iso);
    return { iso, name: t?.name ?? countryName(iso), importsUsd: t?.importsUsd ?? 0, byHeading: t?.byHeading ?? {} };
  });
}

function othersImports(trade: TradeInput | null, listed: MatrixCountryInput[]): { importsUsd: number; byHeading: Record<string, number> } | null {
  if (!trade || trade.totalUsd === null) return null;
  const listedIso = new Set(listed.map((c) => c.iso));
  const byHeading: Record<string, number> = {};
  if (trade.summary) {
    for (const h of trade.summary.byHeadingCountry) byHeading[h.heading] = (byHeading[h.heading] ?? 0) + h.importsUsd;
  } else {
    for (const c of trade.countries) for (const [h, v] of Object.entries(c.byHeading)) byHeading[h] = (byHeading[h] ?? 0) + v;
  }
  for (const c of listed) for (const [h, v] of Object.entries(c.byHeading)) byHeading[h] = (byHeading[h] ?? 0) - v;
  const listedTotal = trade.countries.filter((c) => listedIso.has(c.iso)).reduce((s, c) => s + c.importsUsd, 0);
  return { importsUsd: Math.max(0, trade.totalUsd - listedTotal), byHeading };
}

function understandIndustryStub(chapterPadded: string, title: string, asOf: string): TariffUnderstandIndustryContent {
  return {
    h1: `HTS Chapter ${chapterPadded}: ${title} — U.S. Import Statistics`,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    latestYear: 0,
    priorYear: 0,
    valueBasis: TODO,
    lastCheckedAt: asOf,
    stats: [],
    byYear: [],
    byYearPartners: [TODO, TODO],
    byYearCaption: TODO,
    byCountry: [],
    othersImportsUsd: 0,
    othersPriorImportsUsd: 0,
    byLine: [],
    byHeadingCountry: [],
    effectiveDuty: { year: 0, dutyPaidUsd: null, note: TODO },
    why: todo('run the trade-statistics module (pnpm tariff:fetch-trade) and regenerate, or fill this page from UN Comtrade'),
    sources: [{ label: 'UN Comtrade', url: 'https://comtradeplus.un.org/' }],
    coverageNote: TODO,
  };
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const chapter = Number(stringArg(args, 'chapter'));
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 97) throw new Error('--chapter N (1–97) is required');
  const padded = padChapter(chapter);
  const offline = args.offline === true;
  const asOf = stringArg(args, 'as-of') ?? todayIso();
  const cacheDir = path.resolve(stringArg(args, 'cache-dir') ?? path.join(os.tmpdir(), 'koala-chapter-generator'));
  mkdirSync(cacheDir, { recursive: true });

  // --- chapter block -------------------------------------------------------------------------------
  let slug = stringArg(args, 'slug') ?? null;
  if (!offline && args['skip-slug-check'] !== true) {
    const live = await liveChapterSlugs(cacheDir);
    const liveSlug = live?.get(chapter) ?? null;
    if (!live) console.warn('WARN: could not read the live sitemap; the slug was not checked.');
    else if (!liveSlug) console.warn(`WARN: chapter ${chapter} is not in the live sitemap.`);
    if (liveSlug && slug && slug !== liveSlug) {
      throw new Error(
        `--slug "${slug}" is not the live slug "${liveSlug}" (${'/industry-tariff-report/sitemap.xml'}). Use the live slug so the URL stays the same.`
      );
    }
    slug = slug ?? liveSlug;
  }
  if (!slug) throw new Error('--slug is required (the live slug could not be read)');
  if (!new RegExp(`^${chapter}-[a-z0-9-]+$`).test(slug)) throw new Error(`slug "${slug}" must look like "${chapter}-<kebab-title>" (no zero padding)`);
  const title = stringArg(args, 'title') ?? (offline ? null : await liveChapterTitle(slug, cacheDir)) ?? todo('chapter title');
  const section = sectionForChapter(chapter);

  // --- HTS editions --------------------------------------------------------------------------------
  const measuresFile = readJson<TariffMeasuresFile>(path.resolve(process.cwd(), 'src/tariff-data/calculator/measures.json'));
  const htsFile = stringArg(args, 'hts-file');
  const nowEdition = stringArg(args, 'hts-edition') ?? (htsFile ? editionFromName(path.basename(htsFile)) : null) ?? measuresFile.htsEdition;
  if (nowEdition !== measuresFile.htsEdition)
    console.warn(`WARN: rate table edition "${nowEdition}" differs from the edition measures.json was reviewed against ("${measuresFile.htsEdition}").`);
  const nowRows = chapterJsonRows(await loadHts(htsFile, nowEdition, cacheDir, offline), chapter);
  const beforeEdition = stringArg(args, 'before-edition') ?? '2025 Basic Edition';
  let beforeJson: HtsJsonRow[] | null = null;
  if (args['no-before'] !== true) {
    try {
      beforeJson = chapterJsonRows(await loadHts(stringArg(args, 'before-file'), beforeEdition, cacheDir, offline), chapter);
    } catch (err) {
      console.warn(`WARN: ${beforeEdition} not loaded (${(err as Error).message}); tariffUpdates.lines left as TODO.`);
    }
  }

  const rows = buildRateTableRows(nowRows);
  const lines = leafLines(rows);
  const headings = headingsOf(rows);
  const beforeRows = beforeJson ? buildRateTableRows(beforeJson) : null;

  // --- measures ------------------------------------------------------------------------------------
  const chapterMeasures: TariffMeasureRecord[] = measuresFile.measures.filter((m) => lines.some((l) => measureReachesLine(m, l.htsCode10 as string)));
  const sources = new SourceRegistry(cacheDir, offline);
  await sources.prefetch(chapterMeasures.flatMap((m) => m.sources));

  // --- trade ---------------------------------------------------------------------------------------
  const tradeModule = await loadTradeStatsModule();
  const trade = await loadTradeInput(chapter, stringArg(args, 'trade-file'), tradeModule);
  const explicit = stringArg(args, 'countries')
    ?.split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const top = Number(stringArg(args, 'top-countries') ?? 10);
  const countries = matrixCountries(trade, explicit ?? null, top);

  // --- pages ---------------------------------------------------------------------------------------
  const nowRef = editionRef(nowEdition, urlForEdition(nowEdition), { released: stringArg(args, 'now-released'), inForceFrom: stringArg(args, 'now-in-force') });
  const beforeRef = editionRef(beforeEdition, urlForEdition(beforeEdition));
  const tariffUpdates = buildTariffUpdates({
    chapterPadded: padded,
    title,
    lines,
    beforeRows,
    measures: chapterMeasures,
    featured: countries.map((c) => c.iso),
    asOf,
    before: beforeRef,
    now: nowRef,
    sources,
  });

  const areas = buildIndustryAreas({
    chapterPadded: padded,
    title,
    headings,
    measures: chapterMeasures,
    countries,
    others: othersImports(trade, countries),
    tradeYear: trade?.year ?? null,
    asOf,
    edition: nowEdition,
    sources,
    extraClaims: parseClaims(stringArg(args, 'claim')),
  });
  const industryAreas = areas.content;
  industryAreas.sources = sources.list(['hts-now', ...industryAreas.countries.flatMap((c) => c.rule.sourceIds)]);

  let understandIndustry: TariffUnderstandIndustryContent = understandIndustryStub(padded, title, asOf);
  let snapshot: TariffTradeSnapshot | null = null;
  if (tradeModule && trade?.summary) {
    try {
      understandIndustry = tradeModule.buildUnderstandIndustry(trade.summary, {
        number: chapter,
        title,
        headingLabels: Object.fromEntries(headings.map((h) => [h.heading, h.label])),
      });
      snapshot = tradeSnapshot(trade.summary, padded);
    } catch (err) {
      console.warn(`WARN: understandIndustry not built from the trade summary: ${(err as Error).message}`);
    }
  }

  // --- overview ------------------------------------------------------------------------------------
  const charging = chapterMeasures.filter((m) => m.rateKind !== 'relief' && (m.ratePct ?? 0) > 0 && inEffectOn(m, asOf));
  const chargingLive = charging.filter((m) => lines.some((l) => measureChargesLine(m, l.htsCode10 as string, chapterMeasures, asOf)));
  const extraLines = lines.filter((l) => chargingLive.some((m) => measureChargesLine(m, l.htsCode10 as string, chapterMeasures, asOf)));
  const usmcaRelief = chapterMeasures.some((m) => m.rateKind === 'relief' && m.conditions?.usmcaQualifying === true && inEffectOn(m, asOf));
  const stats: TariffStat[] = [
    { label: 'Tariff lines', value: String(lines.length) },
    { label: 'Lines with a base-rate duty', value: `${lines.filter((l) => l.dutiable).length} of ${lines.length}` },
    {
      label: 'Lines with an extra duty for some origins',
      value: `${extraLines.length} of ${lines.length}`,
      note: `${Array.from(new Set(chargingLive.map((m) => programShort(m.program)))).join(', ') || 'none'}${usmcaRelief ? '; USMCA goods exempt' : ''}`,
    },
  ];
  if (trade?.year && trade.totalUsd) {
    const fmt = (n: number): string => (n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(1)}M`);
    stats.push({ label: `${trade.year} imports`, value: fmt(trade.totalUsd) });
    const [a, b] = trade.countries;
    if (a && b) stats.push({ label: `${a.name} + ${b.name} share`, value: `${Math.round(((a.importsUsd + b.importsUsd) / trade.totalUsd) * 100)}%` });
  }

  const tariffEngineering: TariffEngineeringContent = {
    h1: `HTS Chapter ${padded}: ${title} — Import Documents & Ways to Lower Duty`,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    intro: TODO,
    lastCheckedAt: asOf,
    regulationsAsOf: todo('the eCFR "up to date as of" date of the regulations cited'),
    levers: [],
    rules: [],
    groups: headings.map((h) => ({ heading: h.heading, label: h.label, ruleIds: [], note: TODO })),
    lines: lines.map((l) => ({
      hts: l.hts as string,
      description: l.description,
      ancestorPath: l.ancestorPath,
      searchText: l.searchText,
      heading: l.heading as string,
      general: l.effectiveGeneral,
      ruleIds: [],
      leverIds: [],
    })),
    disclaimer: TODO,
  };

  const finalConclusion: TariffFinalConclusionContent = {
    h1: `HTS Chapter ${padded}: ${title} — Tariff FAQ`,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    intro: TODO,
    keyTakeaways: [TODO],
    lastCheckedAt: asOf,
    questionSource: TODO,
    faqs: [],
  };

  const doc: TariffChapterPrototype = {
    schemaVersion: 1,
    approach: 2,
    generatedBy: GENERATED_BY,
    asOf,
    chapter: {
      number: chapter,
      padded,
      slug,
      title,
      sectionNumber: section.number,
      sectionRoman: section.roman,
      sectionTitle: section.title,
    },
    sources: [
      { label: 'Harmonized Tariff Schedule of the United States', url: 'https://hts.usitc.gov/', note: `rate table rows (${nowEdition})` },
      ...(trade?.year ? [{ label: 'UN Comtrade', url: 'https://comtradeplus.un.org/', note: `${trade.year} import figures` }] : []),
    ],
    overview: {
      h1: `HTS Chapter ${padded}: ${title} — Tariff Rates`,
      seo: { title: `HTS Chapter ${padded}: ${title} — Tariff Rates & Import Duties | KoalaGains`, shortDescription: TODO, keywords: [TODO] },
      intro: TODO,
      stats,
      productGroups: productGroups(headings),
      rateTable: { note: RATE_TABLE_NOTE, rowCount: rows.length, rows },
      spiLegend: spiLegend(rows),
      workedExamples: [{ title: TODO, line: TODO, body: TODO }],
      tradeSnapshot: snapshot ?? {
        year: 0,
        totalImportsUsd: 0,
        totalDutyCollectedUsd: null,
        effectiveDutyRateNote: TODO,
        topCountries: [],
        biggestLines: [],
        source: TODO,
        coverageNote: TODO,
      },
      notes: { chapterNotes: todo('chapter notes from the HTSUS (or null)'), additionalUsNotes: todo('additional U.S. notes (or null)') },
    },
    tariffUpdates,
    understandIndustry,
    industryAreas,
    tariffEngineering,
    finalConclusion,
  };

  // --- write ---------------------------------------------------------------------------------------
  const out = path.resolve(stringArg(args, 'out') ?? path.join(process.cwd(), 'src/tariff-data/chapters', contentFileName(chapter, slug)));
  if (existsSync(out) && args.force !== true) throw new Error(`${out} exists — pass --force to overwrite (or --out elsewhere)`);
  mkdirSync(path.dirname(out), { recursive: true });
  // Format with the repo's prettier config so the file passes `pnpm prettier-check` as generated.
  const prettier = await loadPrettier();
  const options = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, prettier.format(JSON.stringify(doc, null, 2), { ...options, parser: 'json' }));

  console.log(`\nChapter ${padded} (${slug}) — "${title}", section ${section.roman}`);
  console.log(`  rate table: ${rows.length} rows, ${lines.length} lines, ${headings.length} headings (${nowEdition})`);
  console.log(`  measures reaching the chapter: ${chapterMeasures.length} (${charging.length} charging on ${asOf})`);
  console.log(
    `  tariffUpdates: ${tariffUpdates.inEffect.length} in effect, ${tariffUpdates.changes.length} changes, ${tariffUpdates.lines.length} line statuses`
  );
  console.log(
    `  industryAreas: ${industryAreas.countries.length} rows (${industryAreas.countries
      .filter((c) => c.country !== ANY_OTHER_COUNTRY)
      .map((c) => c.country)
      .join(', ')}, ${ANY_OTHER_COUNTRY})`
  );
  console.log(`  trade data: ${trade ? `${trade.year ?? '?'} (${trade.countries.length} partners)` : 'none — understandIndustry is a TODO stub'}`);
  console.log(`  TODO placeholders left for writers: ${countTodos(doc)}`);
  if (areas.notes.length > 0) console.log(`  engine notes: ${areas.notes.length} (first: ${areas.notes[0]})`);
  if (areas.problems.length > 0) {
    console.log(`\n  ${areas.problems.length} PROBLEM(S) — totals marked TODO in the file:`);
    for (const p of areas.problems.slice(0, 40)) console.log(`    ${p}`);
  }
  console.log(`\nWrote ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
