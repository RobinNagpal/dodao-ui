import { writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  CHAPTER_READINESS_FILE,
  chapterKey,
  computeCalcReadiness,
  describeGap,
  enabledChapterProblems,
  enabledChapterSources,
  type CalcReadinessReport,
  type ChapterReadiness,
} from './lib/calc-readiness';

/**
 * Which HTS chapters can be switched to the official-measures calculator engine (issue #1794).
 *
 * A chapter is READY when every Chapter 99 program that charges duty on any of its lines on the as-of date is modelled
 * in measures.json (a measure for that heading whose coverage reaches the line). Otherwise it is NOT READY and the
 * gaps are listed per program: headings, lines affected, modelled yes/partial/no. Programs that start later (e.g.
 * Nicaragua +10% from 2027) are listed as "upcoming" and don't block yet. Offline: reads only committed JSON.
 *
 *   pnpm tariff:calc-readiness                          # every chapter; writes src/tariff-data/calculator/chapter-readiness.json
 *   pnpm tariff:calc-readiness --chapter 1 --chapter 30 # just these (exit 1 if any is NOT READY); --chapter 1,30 works too
 *   pnpm tariff:calc-readiness --check-enabled          # CI: exit 1 if a chapter in appConfigDefaults.json or the runbook's
 *                                                       # documented TARIFF_CALC_MEASURES_ENABLED value is NOT READY
 *   pnpm tariff:calc-readiness --json                   # print the report as JSON
 *   pnpm tariff:calc-readiness --as-of 2027-01-01       # readiness on another date (default: today, UTC)
 *   pnpm tariff:calc-readiness --no-write               # don't rewrite chapter-readiness.json
 *
 * Reviewed, time-limited waivers live in src/tariff-data/calculator/accepted-gaps.json: "lines" waivers turn the listed
 * unmodelled lines into ACCEPTED (not blocking) until their reviewBy date; "condition" waivers only record a known
 * condition the line-level check can't see. An expired waiver stops applying (and the chapter may block again).
 *
 * The coverage inputs are note-coverage.json and program-coverage.json (extract-ch99-program-coverage.ts); the program
 * statuses and coverage overrides are reviewed in lib/calc-readiness.ts. See docs/insights-ui/tariffs/calculator-data-refresh.md,
 * "Switching a chapter to the official-measures engine".
 */

interface Cli {
  chapters: number[];
  json: boolean;
  checkEnabled: boolean;
  asOf: string;
  write: boolean;
}

function parseCli(argv: string[]): Cli {
  const cli: Cli = { chapters: [], json: false, checkEnabled: false, asOf: new Date().toISOString().slice(0, 10), write: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = (): string => {
      const v = a.includes('=') ? a.slice(a.indexOf('=') + 1) : argv[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === '--chapter' || a.startsWith('--chapter=')) {
      for (const s of value().split(',')) {
        const n = parseInt(s.trim(), 10);
        if (!Number.isInteger(n) || n < 1 || n > 97) throw new Error(`--chapter: "${s}" is not a chapter number (1–97)`);
        cli.chapters.push(n);
      }
    } else if (a === '--json') cli.json = true;
    else if (a === '--check-enabled') cli.checkEnabled = true;
    else if (a === '--no-write') cli.write = false;
    else if (a === '--as-of' || a.startsWith('--as-of=')) {
      cli.asOf = value();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cli.asOf)) throw new Error('--as-of must be YYYY-MM-DD');
    } else throw new Error(`unknown argument ${a}`);
  }
  return cli;
}

/** JSON laid out the way prettier (printWidth 160) leaves it: objects expanded, primitive arrays on one line when they fit. */
function formatJson(value: unknown, indent = '', prefixLength = 0): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((v) => v === null || typeof v !== 'object')) {
      const one = `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
      if (indent.length + prefixLength + one.length + 1 <= 160) return one;
    }
    return `[\n${value.map((v) => `${inner}${formatJson(v, inner)}`).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${formatJson(v, inner, JSON.stringify(k).length + 2)}`).join(',\n')}\n${indent}}`;
}

function printChapter(c: ChapterReadiness): void {
  console.log(`\nChapter ${c.chapter} (${c.lines} lines): ${c.status}`);
  for (const g of c.gaps) {
    console.log(`  GAP       ${describeGap(g)}`);
    for (const n of g.coverageNotes ?? []) console.log(`            ${n}`);
  }
  for (const g of c.upcoming) console.log(`  UPCOMING  ${describeGap(g)}`);
  for (const g of c.accepted) console.log(`  ACCEPTED  ${describeGap(g)}`);
  for (const g of c.modelled) console.log(`  modelled  ${describeGap(g)}`);
  for (const id of c.acceptedConditions) console.log(`  ACCEPTED  condition not modelled: ${id} (accepted-gaps.json)`);
}

function printSummary(report: CalcReadinessReport): void {
  console.log(`\nReadiness as of ${report.asOf} (headings ${report.htsEdition}, measures reviewed ${report.measuresReviewedAt ?? '?'})`);
  console.log(`READY (${report.ready.length}): ${report.ready.join(', ') || '—'}`);
  console.log(`NOT READY (${report.notReady.length})`);
  const blocking = report.programs.filter((p) => p.blocksChapters.length > 0).sort((a, b) => b.blocksChapters.length - a.blocksChapters.length);
  if (blocking.length > 0) {
    console.log('\nPrograms blocking chapters (in effect or status unknown, not fully modelled):');
    for (const p of blocking) console.log(`  ${String(p.blocksChapters.length).padStart(3)} chapter(s)  ${p.name}`);
  }
  for (const w of report.expiredWaivers) console.log(`\nWAIVER EXPIRED (no longer applied): ${w} — re-review it in accepted-gaps.json`);
  const upcoming = report.programs.filter((p) => p.upcomingInChapters.length > 0);
  if (upcoming.length > 0) {
    console.log('\nUpcoming programs, not modelled (block once they start):');
    for (const p of upcoming) console.log(`  ${String(p.upcomingInChapters.length).padStart(3)} chapter(s)  ${p.name}`);
  }
}

function main(): void {
  const cli = parseCli(process.argv.slice(2));
  const report = computeCalcReadiness(cli.asOf);

  if (cli.write) {
    // Fully modelled programs are summarised as "program: n lines" to keep the committed file small.
    const compact = {
      ...report,
      chapters: report.chapters.map((c) => ({ ...c, modelled: c.modelled.map((g) => `${g.program}: ${g.linesAffected} line(s)`) })),
    };
    writeFileSync(CHAPTER_READINESS_FILE, formatJson(compact) + '\n');
  }

  const wanted = new Set(cli.chapters.map(chapterKey));
  const shown = wanted.size > 0 ? report.chapters.filter((c) => wanted.has(c.chapter)) : report.chapters;
  if (cli.json) {
    console.log(JSON.stringify(wanted.size > 0 ? { ...report, chapters: shown } : report, null, 2));
  } else {
    shown.forEach(printChapter);
    if (wanted.size === 0) printSummary(report);
  }

  let failed = false;
  for (const k of wanted) {
    const c = report.chapters.find((x) => x.chapter === k);
    if (!c) {
      console.error(`\nChapter ${k}: no HTS lines in program-coverage.json`);
      failed = true;
    } else if (c.status !== 'READY') failed = true;
  }
  if (cli.checkEnabled) {
    const sources = enabledChapterSources();
    for (const s of sources) console.log(`\n${s.source}: ${s.chapters.length ? s.chapters.join(',') : '(none)'}`);
    const problems = enabledChapterProblems(report, sources);
    for (const p of problems) console.error(`ERROR ${p}`);
    if (problems.length > 0) failed = true;
    else console.log('Every enabled chapter is READY.');
  }
  for (const w of report.unusedWaivers) console.log(`\nNote: waiver ${w} in accepted-gaps.json matched no gap (the line is modelled now?) — remove it if so.`);
  if (cli.write) console.log(`\nWrote ${path.relative(process.cwd(), CHAPTER_READINESS_FILE)}`);
  if (failed) {
    console.error('\nNOT READY: do not list these chapters in TARIFF_CALC_MEASURES_ENABLED until every gap is modelled in measures.json.');
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
