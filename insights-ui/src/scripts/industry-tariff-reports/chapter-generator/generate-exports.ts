import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { TariffStat, TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import type {
  TariffChapterExports,
  TariffExportChange,
  TariffExportMarket,
  TariffExportMarketLibrary,
  TariffExportMarketLibraryEntry,
  TariffExportMarketStatus,
  TariffExportMeasureInEffect,
  TariffExportStepsLibrary,
  TariffExportUpcoming,
  TariffForeignMeasuresLibrary,
  TariffChapterCoverage,
} from '@/types/tariff-chapter-exports';
import { EXPORT_PAGE_FILES, EXPORT_PAGE_SLUGS } from '@/utils/tariff-reports/chapter-exports';
import { chapterExportHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { parseCliArgs, stringArg } from '../../tariff-calculator/lib/hts-source';
import { padChapter } from './chapter-info';
import { countTodos, todo, TODO } from './placeholders';
import { changePct, dotHs6, formatUsdShort, loadTradeSummary, type TradeSummary } from './trade-stats';

/**
 * Export-side content generator: builds the data parts of a chapter's five export pages
 * (`src/tariff-data/chapters/exports/<NN>-<slug>/{overview,tariff-updates,markets,rules,faq}.json`)
 * and leaves "TODO" placeholders for the writer agents, like `generate-chapter.ts` does for the import
 * side. `pnpm tariff:validate-chapters` fails on any remaining "TODO". What each page must say is
 * specified in docs/insights-ui/tariffs/export-pages/.
 *
 *   pnpm tariff:fetch-trade --chapter 30 --flow X --ytd       # 1. U.S. export figures (UN Comtrade)
 *   pnpm tariff:generate-exports --chapter 30                 # 2. this script
 *   pnpm tariff:generate-exports --chapter 30 --out-dir /tmp/ch30-exports --force
 *
 * Inputs:
 *   - the chapter's import content file (`src/tariff-data/chapters/<NN>-<slug>.json`): chapter facts,
 *     slug and product-group labels. A chapter gets export pages only after its import pages exist.
 *   - the export trade summary (`src/tariff-data/trade/exports/chapter-NN.json`, from fetch-trade --flow X)
 *   - the export library (`src/tariff-data/export-library/`): the steps every exporter takes
 *     (`us-export-steps.json`), market facts (`markets.json`) and foreign tariff actions on U.S. goods
 *     (`foreign-measures.json`).
 *
 * From data:
 *   overview        byYear, the two largest buyers, yearToDate, top buyers, product groups, top HS6 lines,
 *                   trade stats, coverage note, the Comtrade source
 *   tariffUpdates   upcoming events, in-force measures and the change log from foreign-measures.json, each
 *                   marked by whether it reaches this chapter (from the measure's coverage map)
 *   markets         the largest markets (an EU member is folded into "European Union"), their exports per
 *                   product group, biggest lanes, trade agreement + country guide from markets.json
 *   rules           the steps and savings from us-export-steps.json; one rule group per heading
 * Left for writers (TODO): intros, SEO, takeaways, every tariff rate and its basis, what each measure means
 * for this chapter, regulator per market, chapter notes on each step, chapter-specific agency rules, FAQs.
 *
 * Options:
 *   --chapter N            HS chapter (required)
 *   --top-buyers N         countries in the overview's buyers table (default 12)
 *   --top-markets N        markets on the markets page (default 8; the EU counts as one)
 *   --as-of YYYY-MM-DD     check date written to every page (default: today)
 *   --out-dir <dir>        default src/tariff-data/chapters/exports/<NN>-<slug> (won't overwrite without --force)
 */

/** The slice of the prettier v2 API used here (the repo has no @types/prettier) — as in generate-chapter.ts. */
interface PrettierApi {
  resolveConfig(filePath: string): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): string;
}

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier'; // non-literal specifier: typed loosely, no declaration file needed
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

const CHAPTERS_DIR = path.join(process.cwd(), 'src/tariff-data/chapters');
const LIBRARY_DIR = path.join(process.cwd(), 'src/tariff-data/export-library');
/** Placeholder status: not a valid status, so the page cannot ship until a writer sets it (the validator flags the "TODO"). */
const TODO_STATUS = TODO as TariffExportMarketStatus;

/** Local YYYY-MM-DD — the same "today" the validator uses. */
function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** The parts of the import content file the export pages reuse. */
interface ImportChapterFile {
  chapter: { number: number; padded: string; slug: string; title: string };
  overview: { productGroups: { heading: string; label: string }[] };
  industryAreas?: { groups: { heading: string; shortLabel: string }[] };
}

function loadImportChapter(chapter: number): { file: string; content: ImportChapterFile } {
  const padded = padChapter(chapter);
  const name = readdirSync(CHAPTERS_DIR).find((f) => f.startsWith(`${padded}-`) && f.endsWith('.json'));
  if (!name) throw new Error(`No import content file src/tariff-data/chapters/${padded}-*.json — build the import pages first (pnpm tariff:generate-chapter).`);
  return { file: name, content: readJson<ImportChapterFile>(path.join(CHAPTERS_DIR, name)) };
}

/** Coverage of a library entry for this chapter: every chapter for an all-goods measure, else its coverage map (TODO when not checked). */
function coverageFor(entry: { allGoods: boolean; coverage: TariffChapterCoverage }, chapter: number): TariffExportChange['coversChapter'] {
  if (entry.allGoods) return 'yes';
  return entry.coverage[String(chapter)] ?? (TODO as TariffExportChange['coversChapter']);
}

type TariffExportPage = TariffChapterExports['overview']['page'];

interface MarketGroup {
  library: TariffExportMarketLibraryEntry | null;
  name: string;
  countryCode: number;
  memberCodes: number[];
}

/** Partners grouped into markets: a library market with several codes (the EU) becomes one row; others stand alone. */
function groupMarkets(summary: TradeSummary, library: TariffExportMarketLibrary): MarketGroup[] {
  const byCode = new Map<number, TariffExportMarketLibraryEntry>();
  for (const m of library.markets) for (const code of m.countryCodes) byCode.set(code, m);
  const groups = new Map<string, MarketGroup>();
  for (const c of summary.byCountry) {
    const lib = byCode.get(c.countryCode) ?? null;
    const key = lib?.name ?? c.country;
    const group = groups.get(key) ?? {
      library: lib,
      name: lib?.name ?? c.country,
      countryCode: lib?.marketCode ?? c.countryCode,
      memberCodes: [],
    };
    group.memberCodes.push(c.countryCode);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function buildPageBase(key: keyof TariffChapterExports, chapter: ImportChapterFile['chapter'], h1: string, asOf: string): TariffExportPage {
  return {
    slug: EXPORT_PAGE_SLUGS[key],
    path: chapterExportHref(chapter.slug, EXPORT_PAGE_SLUGS[key]),
    h1,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    lastCheckedAt: asOf,
  };
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const chapterNumber = Number(stringArg(args, 'chapter'));
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 97) throw new Error('--chapter N (1–97) is required');
  const asOf = stringArg(args, 'as-of') ?? todayIso();
  const topBuyers = Number(stringArg(args, 'top-buyers') ?? 12);
  const topMarkets = Number(stringArg(args, 'top-markets') ?? 8);

  const { file: importFile, content: imported } = loadImportChapter(chapterNumber);
  const chapter = imported.chapter;
  const { number, padded, slug, title } = chapter;
  const summary = loadTradeSummary(number, 'X');
  if (summary.flow !== 'X') throw new Error('the export trade summary must come from fetch-trade --flow X');

  const steps = readJson<TariffExportStepsLibrary>(path.join(LIBRARY_DIR, 'us-export-steps.json'));
  const marketLibrary = readJson<TariffExportMarketLibrary>(path.join(LIBRARY_DIR, 'markets.json'));
  const foreign = readJson<TariffForeignMeasuresLibrary>(path.join(LIBRARY_DIR, 'foreign-measures.json'));

  const { latestYear, priorYear } = summary;
  const total = summary.totalsByYear.find((t) => t.year === latestYear)?.totalUsd ?? 0;
  const priorTotal = summary.totalsByYear.find((t) => t.year === priorYear)?.totalUsd ?? 0;
  const share = (v: number): number => (total ? round1((v / total) * 100) : 0);
  const headingLabel = new Map(imported.overview.productGroups.map((g) => [g.heading, g.label]));
  const shortLabel = new Map((imported.industryAreas?.groups ?? []).map((g) => [g.heading, g.shortLabel]));
  const headings = summary.byHeading.map((h) => h.heading);
  const labelOf = (h: string): string => headingLabel.get(h) ?? summary.byHeading.find((x) => x.heading === h)?.description ?? h;
  const base = { schemaVersion: 1, direction: 'export' as const, chapter: { number, padded, slug, title } };

  const comtradeSource: TariffUpdateSource = {
    id: 'comtrade-exports',
    publisher: 'UN Comtrade',
    citation: `UN Comtrade, U.S. exports ${summary.years[0]}–${latestYear}`,
    document: summary.sourceLabel,
    title: `United States exports, HS chapter ${padded}, by partner, heading and subheading`,
    signed: null,
    published: summary.retrievedAt,
    url: 'https://comtradeplus.un.org/',
  };

  // --- overview ------------------------------------------------------------------------------------
  const countries = summary.byCountry.filter((c) => c.importsUsd > 0);
  const buyers = countries.slice(0, topBuyers);
  const [partnerA, partnerB] = countries;
  const byYear = summary.totalsByYear.map((t) => {
    const a = partnerA?.byYear[String(t.year)] ?? 0;
    const b = partnerB?.byYear[String(t.year)] ?? 0;
    return { year: t.year, totalUsd: t.totalUsd, partnerAUsd: a, partnerBUsd: b, restUsd: t.totalUsd - a - b };
  });
  const buyersTotal = buyers.reduce((s, c) => s + c.importsUsd, 0);
  const buyersPrior = buyers.reduce((s, c) => s + c.priorImportsUsd, 0);
  const byHeading = summary.byHeading
    .map((h) => {
      const v = h.byYear[String(latestYear)] ?? 0;
      const p = h.byYear[String(priorYear)] ?? 0;
      return { heading: h.heading, label: labelOf(h.heading), exportsUsd: v, priorExportsUsd: p, changePct: changePct(v, p), sharePct: share(v) };
    })
    .filter((h) => h.exportsUsd > 0 || h.priorExportsUsd > 0);
  const topHeading = [...byHeading].sort((a, b) => b.exportsUsd - a.exportsUsd)[0];
  const ytd = summary.yearToDate;

  const stats: TariffStat[] = [
    { label: `${latestYear} U.S. exports`, value: formatUsdShort(total) },
    { label: `Change vs ${priorYear}`, value: `${(changePct(total, priorTotal) ?? 0) > 0 ? '+' : ''}${changePct(total, priorTotal) ?? 0}%` },
    ...(topHeading ? [{ label: `Largest product group (${topHeading.heading})`, value: `${Math.round(topHeading.sharePct)}%`, note: topHeading.label }] : []),
    ...(partnerA && partnerB
      ? [
          {
            label: 'Two largest buyers',
            value: `${Math.round(share(partnerA.importsUsd + partnerB.importsUsd))}%`,
            note: `${partnerA.country}, ${partnerB.country}`,
          },
        ]
      : []),
    { label: TODO, value: TODO, note: todo('a tariff stat, e.g. "Top buyers charging 0%" or "Buyers that raised tariffs"') },
  ];

  const overview: TariffChapterExports['overview'] = {
    ...base,
    page: buildPageBase('overview', chapter, `HTS Chapter ${padded}: ${title} — U.S. Exports & Foreign Tariffs`, asOf),
    intro: todo('2 short paragraphs: how much the U.S. exports and what; where tariffs matter and where they do not'),
    latestYear,
    priorYear,
    valueBasis: summary.valueBasis,
    stats,
    keyTakeaways: [TODO],
    byYear,
    byYearPartners: [partnerA?.country ?? TODO, partnerB?.country ?? TODO],
    byYearCaption: `U.S. exports of Chapter ${padded} goods each year, split into the two largest ${latestYear} buyers (${partnerA?.country} and ${partnerB?.country}) and everyone else.`,
    yearToDate: ytd
      ? {
          year: ytd.year,
          throughMonth: ytd.throughMonth,
          exportsUsd: ytd.totalUsd,
          priorExportsUsd: ytd.priorTotalUsd,
          changePct: changePct(ytd.totalUsd, ytd.priorTotalUsd),
          topBuyers: ytd.byCountry.slice(0, 8).map((c) => ({
            countryCode: c.countryCode,
            country: c.country,
            exportsUsd: c.valueUsd,
            priorExportsUsd: c.priorValueUsd,
            changePct: changePct(c.valueUsd, c.priorValueUsd),
          })),
          note: 'Monthly figures as reported by the United States to UN Comtrade; the latest months can still be revised.',
        }
      : null,
    topMarkets: buyers.map((c) => ({
      countryCode: c.countryCode,
      country: c.country,
      exportsUsd: c.importsUsd,
      priorExportsUsd: c.priorImportsUsd,
      sharePct: share(c.importsUsd),
      changePct: changePct(c.importsUsd, c.priorImportsUsd),
      tariffNow: TODO,
      status: TODO_STATUS,
    })),
    othersExportsUsd: total - buyersTotal,
    othersPriorExportsUsd: priorTotal - buyersPrior,
    byHeading,
    byLine: summary.byHs6.slice(0, 10).map((l) => ({
      hs6: dotHs6(l.hs6),
      heading: l.heading,
      description: l.description,
      exportsUsd: l.importsUsd,
      priorExportsUsd: l.priorImportsUsd,
      changePct: changePct(l.importsUsd, l.priorImportsUsd),
      sharePct: share(l.importsUsd),
    })),
    sources: [comtradeSource],
    coverageNote: `The ${buyers.length} buyers listed take ${Math.round(share(buyersTotal))}% of ${latestYear} U.S. Chapter ${padded} exports. ${
      summary.valueBasis
    } They can differ from what the destination country reports as imports.`,
  };

  // --- markets -------------------------------------------------------------------------------------
  const valueOf = (codes: number[], year: number): number =>
    countries.filter((c) => codes.includes(c.countryCode)).reduce((s, c) => s + (c.byYear[String(year)] ?? 0), 0);
  const marketGroups = groupMarkets(summary, marketLibrary)
    .map((g) => ({ ...g, exportsUsd: valueOf(g.memberCodes, latestYear), priorExportsUsd: valueOf(g.memberCodes, priorYear) }))
    .sort((a, b) => b.exportsUsd - a.exportsUsd)
    .slice(0, topMarkets);
  const missingLibrary = marketGroups.filter((g) => !g.library).map((g) => g.name);
  const marketRows: TariffExportMarket[] = marketGroups.map((g) => {
    const cells: TariffExportMarket['cells'] = {};
    for (const h of headings) {
      const exportsUsd = summary.byHeadingCountry.filter((r) => r.heading === h && g.memberCodes.includes(r.countryCode)).reduce((s, r) => s + r.importsUsd, 0);
      cells[h] = { exportsUsd, rate: TODO, normalRate: null, basis: todo('the subheading, schedule year and rule the rate comes from') };
    }
    const topHeadings = Object.entries(cells)
      .sort((a, b) => b[1].exportsUsd - a[1].exportsUsd)
      .slice(0, 2)
      .filter(([, c]) => c.exportsUsd > 0)
      .map(([h]) => `${labelOf(h)} (${h})`);
    const members =
      g.memberCodes.length > 1
        ? countries
            .filter((c) => g.memberCodes.includes(c.countryCode))
            .slice(0, 5)
            .map((c) => ({
              countryCode: c.countryCode,
              country: c.country,
              exportsUsd: c.importsUsd,
              priorExportsUsd: c.priorImportsUsd,
              changePct: changePct(c.importsUsd, c.priorImportsUsd),
            }))
        : undefined;
    return {
      countryCode: g.countryCode,
      name: g.name,
      rule: todo('the tariff rule that applies to U.S. goods, e.g. "EU common external tariff (MFN)"'),
      usTradeAgreement: g.library ? g.library.usTradeAgreement : TODO,
      exportsUsd: g.exportsUsd,
      priorExportsUsd: g.priorExportsUsd,
      sharePct: share(g.exportsUsd),
      changePct: changePct(g.exportsUsd, g.priorExportsUsd),
      status: TODO_STATUS,
      ...(members ? { members } : {}),
      cells,
      profile: {
        headline: todo('one or two sentences: what matters for a U.S. exporter in this market'),
        mainProducts: topHeadings.join(' · '),
        tariffNow: TODO,
        regulator: { name: TODO, url: TODO, requirement: todo('whose approval or registration is needed to sell this chapter’s goods there') },
        countryGuide: g.library?.countryGuide ?? { label: TODO, url: TODO },
      },
    };
  });
  const lanes = marketRows
    .flatMap((m) => headings.map((h) => ({ market: m.name, heading: h, exportsUsd: m.cells[h].exportsUsd, rate: TODO })))
    .filter((l) => l.exportsUsd > 0)
    .sort((a, b) => b.exportsUsd - a.exportsUsd)
    .slice(0, 8);
  const marketsTotal = marketRows.reduce((s, m) => s + m.exportsUsd, 0);

  const markets: TariffChapterExports['markets'] = {
    ...base,
    page: buildPageBase('markets', chapter, `HTS Chapter ${padded}: ${title} — Export Markets & Foreign Tariffs on U.S. Goods`, asOf),
    intro: todo('what the matrix shows and what usually decides access for this chapter (tariff vs regulator)'),
    tradeYear: latestYear,
    tariffYear: 0,
    valueBasis: summary.valueBasis,
    groups: headings
      .filter((h) => byHeading.some((x) => x.heading === h))
      .map((h) => ({ heading: h, label: labelOf(h), shortLabel: shortLabel.get(h) ?? todo(`short matrix label for ${h}`) })),
    markets: marketRows,
    biggestLanes: lanes,
    assumptions: [todo('where the rates come from (schedule, year, one subheading per group) and how trade agreements and extra duties are applied')],
    sources: [comtradeSource],
    coverageNote: `The ${marketRows.length} markets shown take ${Math.round(
      share(marketsTotal)
    )}% of ${latestYear} U.S. Chapter ${padded} exports. A customs union (the EU) is one market: its members share one tariff.`,
  };

  // --- tariff updates ------------------------------------------------------------------------------
  const changes: TariffExportChange[] = foreign.measures.map((m) => ({
    id: m.id,
    date: m.date,
    type: m.type,
    countries: m.countries,
    title: m.title,
    before: m.before,
    now: m.now,
    coversChapter: coverageFor(m, number),
    status: m.status,
    detail: m.detail,
    sourceIds: m.sourceIds,
  }));
  const inEffect: TariffExportMeasureInEffect[] = foreign.measures
    .filter((m) => m.inForce && coverageFor(m, number) !== 'no')
    .map((m) => ({
      id: m.id,
      country: m.countries.join(', '),
      measure: m.title,
      before: m.before ?? TODO,
      now: m.now ?? TODO,
      appliesTo: todo(`which Chapter ${padded} goods it reaches, on top of which normal rate`),
      whatItMeans: todo('a worked example: what a typical shipment pays now vs January 2025'),
      effectiveFrom: m.date,
      effectiveSourceId: m.effectiveSourceId ?? TODO,
      sourceIds: m.sourceIds,
    }));
  const upcoming: TariffExportUpcoming[] = foreign.upcoming
    .filter((u) => u.expectedOn >= asOf && coverageFor(u, number) !== 'no')
    .map((u) => ({
      id: u.id,
      expectedOn: u.expectedOn,
      dateLabel: u.dateLabel,
      countries: u.countries,
      title: u.title,
      whatHappens: u.whatHappens,
      impact: todo(`what it would mean for U.S. Chapter ${padded} goods`),
      status: u.status,
      sourceIds: u.sourceIds,
    }));
  const usedSourceIds = new Set([...changes, ...upcoming, ...inEffect].flatMap((x) => x.sourceIds));
  const reaching = changes.filter((c) => c.coversChapter !== 'no');

  const tariffUpdates: TariffChapterExports['tariffUpdates'] = {
    ...base,
    page: buildPageBase('tariffUpdates', chapter, `HTS Chapter ${padded}: ${title} — Foreign Tariff Changes on U.S. Exports`, asOf),
    intro: todo('what changed for U.S. exporters of this chapter since January 2025, and the one thing to watch'),
    scope: `The ${marketRows.length} largest markets for U.S. Chapter ${padded} goods (${Math.round(share(marketsTotal))}% of ${latestYear} exports).`,
    stats: [
      { label: 'Actions tracked', value: String(changes.length) },
      {
        label: 'In force & cost these goods',
        value: String(inEffect.length),
        ...(inEffect.length > 0 ? { note: inEffect.map((m) => m.country).join(', ') } : {}),
      },
      { label: 'Reach this chapter', value: String(reaching.length) },
      { label: 'Coming up', value: String(upcoming.length) },
    ],
    upcoming,
    inEffect,
    changes,
    sources: foreign.sources.filter((s) => usedSourceIds.has(s.id)),
  };

  // --- rules ---------------------------------------------------------------------------------------
  const rules: TariffChapterExports['rules'] = {
    ...base,
    page: buildPageBase('rules', chapter, `HTS Chapter ${padded}: ${title} — U.S. Export Rules & Ways to Pay Less Abroad`, asOf),
    intro: todo('what a U.S. exporter of this chapter must do before shipping, and which agencies are involved'),
    regulationsAsOf: steps.regulationsAsOf,
    steps: steps.steps.map((s) => ({ ...s, chapterNote: todo(`what this step means for Chapter ${padded} goods, or null`) })),
    rules: [],
    groups: headings
      .filter((h) => byHeading.some((x) => x.heading === h))
      .map((h) => ({ heading: h, label: labelOf(h), ruleIds: [], note: todo('agency rules for this group, or null when none beyond the steps') })),
    savings: steps.savings,
    disclaimer: steps.disclaimer,
  };

  // --- faq -----------------------------------------------------------------------------------------
  const faq: TariffChapterExports['faq'] = {
    ...base,
    page: buildPageBase('faq', chapter, `HTS Chapter ${padded}: ${title} — U.S. Export FAQ`, asOf),
    intro: todo('one sentence: what the questions cover and where the answers come from'),
    keyTakeaways: [TODO],
    questionSource: todo('where the questions came from, e.g. Google search suggestions for "<product> export tariff"'),
    faqs: [],
  };

  // --- write ---------------------------------------------------------------------------------------
  const doc: TariffChapterExports = { overview, tariffUpdates, markets, rules, faq };
  const outDir = path.resolve(stringArg(args, 'out-dir') ?? path.join(CHAPTERS_DIR, 'exports', importFile.replace(/\.json$/, '')));
  if (existsSync(outDir) && readdirSync(outDir).length > 0 && args.force !== true) {
    throw new Error(`${outDir} is not empty — pass --force to overwrite (or --out-dir elsewhere)`);
  }
  mkdirSync(outDir, { recursive: true });
  const prettier = await loadPrettier();
  for (const key of Object.keys(EXPORT_PAGE_FILES) as (keyof TariffChapterExports)[]) {
    const out = path.join(outDir, EXPORT_PAGE_FILES[key]);
    const options = (await prettier.resolveConfig(out)) ?? {};
    writeFileSync(out, prettier.format(JSON.stringify(doc[key], null, 2), { ...options, parser: 'json' }));
  }

  console.log(`\nChapter ${padded} (${slug}) — export pages`);
  console.log(
    `  trade: ${latestYear} exports ${formatUsdShort(total)} (${countries.length} buyers)${
      ytd ? `; Jan-${ytd.throughMonth} ${ytd.year} ${formatUsdShort(ytd.totalUsd)}` : ''
    }`
  );
  console.log(`  markets: ${marketRows.map((m) => m.name).join(', ')}`);
  if (missingLibrary.length > 0) console.log(`  not in export-library/markets.json (add them): ${missingLibrary.join(', ')}`);
  console.log(`  foreign actions: ${changes.length} (${reaching.length} reach the chapter), ${inEffect.length} in force, ${upcoming.length} upcoming`);
  const unchecked = changes.filter((c) => c.coversChapter === (TODO as string)).length;
  if (unchecked > 0) console.log(`  ${unchecked} action(s) not yet checked against Chapter ${padded}: set coverage["${number}"] in foreign-measures.json`);
  console.log(`  TODO placeholders left for writers: ${countTodos(doc)}`);
  console.log(`\nWrote ${path.relative(process.cwd(), outDir)}/{${Object.values(EXPORT_PAGE_FILES).join(',')}}`);
  console.log(
    `Register the chapter in EXPORTS_BY_SLUG (src/utils/tariff-reports/chapter-exports.ts), fill the TODOs, then run pnpm tariff:validate-chapters --chapter ${slug}`
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
