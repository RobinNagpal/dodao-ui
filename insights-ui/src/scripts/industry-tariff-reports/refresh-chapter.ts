import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseCliArgs, stringArg } from '../tariff-calculator/lib/hts-source';

/**
 * Re-run one chapter's content pipeline (issue #1863):
 *   generate → fill → stamp dates → compact → prettier → validate
 *
 *   pnpm tariff:refresh-chapter 45                          # rewrites src/tariff-data/chapters/45-cork-and-articles.json
 *   pnpm tariff:refresh-chapter 45 --as-of 2026-11-15       # engine entry date + the asOf / lastCheckedAt stamps
 *   pnpm tariff:refresh-chapter 45 --dry-run --compare      # write to the cache instead, diff against the committed file
 *   pnpm tariff:refresh-chapter --all --dry-run --compare   # every chapter that has scripts; prints a summary table
 *
 * Each chapter's scripts live in `chapter-fills/<NN>/`: `run.sh` runs `pnpm tariff:generate-chapter` with the
 * chapter's flags and then its fill script(s), which write the hand-written parts (intros, SEO, FAQ, change log,
 * tariff-engineering, …) around the generated data. See docs/insights-ui/tariffs/chapter-content-refresh.md.
 *
 * Options:
 *   --as-of YYYY-MM-DD   generator entry date; also written to `asOf` and every page's `lastCheckedAt` (default: today).
 *                        `--as-of committed` reuses the committed file's asOf (for reproducibility checks)
 *   --hts-file <path>    HTS JSON for the generator (default: downloaded once into $CHAPTER_FILL_CACHE/generator/)
 *   --dry-run            write to $CHAPTER_FILL_CACHE/<NN>/out/<slug>.json, leave src/tariff-data/chapters/ alone
 *   --out <path>         write here instead
 *   --compare            report whether the output equals the committed file, ignoring asOf / lastCheckedAt
 *   --no-validate        skip `pnpm tariff:validate-chapters --check-calculator --check-hts`
 *   --offline            pass --offline to the generator (cached HTS / Federal Register data only)
 *   --reuse-gen          skip the generator and fill the existing $CHAPTER_FILL_CACHE/<NN>/gen.json again
 *   --all                every chapter with a chapter-fills/<NN>/run.sh (requires --dry-run or --out-dir <dir>)
 *
 * Env: CHAPTER_FILL_CACHE (default <os tmp>/koala-chapter-fills) holds downloads, generator output and dry-run files.
 * Run from insights-ui/. Needs bash and python3 (standard library only).
 */

const IU = process.cwd();
const FILLS = path.join(IU, 'src/scripts/industry-tariff-reports/chapter-fills');
const CHAPTERS = path.join(IU, 'src/tariff-data/chapters');
const PAGES_WITH_CHECK_DATE = ['tariffUpdates', 'understandIndustry', 'industryAreas', 'tariffEngineering', 'finalConclusion'] as const;

interface RunOptions {
  asOf: string;
  htsFile?: string;
  outFile?: string;
  dryRun: boolean;
  compare: boolean;
  validate: boolean;
  offline: boolean;
  reuseGen: boolean;
  cache: string;
  /** Capture output to <cache>/<NN>/refresh.log instead of printing it (used by --all). */
  logFile?: string;
}

interface RunResult {
  chapter: string;
  slug: string;
  out: string;
  step: 'ok' | 'run.sh' | 'stamp' | 'compact' | 'prettier' | 'validate';
  validation?: string;
  compare?: string;
}

/** Local YYYY-MM-DD — the same "today" the generator and validator use. */
function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function pad(n: string): string {
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > 97) throw new Error(`chapter must be 1–97, got "${n}"`);
  return String(num).padStart(2, '0');
}

function chaptersWithScripts(): string[] {
  return readdirSync(FILLS)
    .filter((d) => /^\d{2}$/.test(d) && existsSync(path.join(FILLS, d, 'run.sh')))
    .sort();
}

/** The committed content file for a chapter (`<n>-<slug>.json` or `<NN>-<slug>.json`), from the run.sh SLUG line. */
function slugFor(nn: string): string {
  const run = readFileSync(path.join(FILLS, nn, 'run.sh'), 'utf8');
  const m = /^SLUG=([a-z0-9-]+)\s*$/m.exec(run);
  if (!m) throw new Error(`chapter-fills/${nn}/run.sh has no SLUG= line`);
  return m[1];
}

function committedFile(nn: string, slug: string): string | null {
  const named = path.join(CHAPTERS, `${slug}.json`);
  if (existsSync(named)) return named;
  const byNumber = readdirSync(CHAPTERS).find((f) => f.startsWith(`${nn}-`) && f.endsWith('.json'));
  return byNumber ? path.join(CHAPTERS, byNumber) : null;
}

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv, logFile?: string): { ok: boolean; output: string } {
  const res = spawnSync(cmd, args, { cwd: IU, env, encoding: 'utf8', stdio: logFile ? 'pipe' : ['inherit', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  if (logFile) writeFileSync(logFile, `$ ${cmd} ${args.join(' ')}\n${output}\n`, { flag: 'a' });
  else {
    process.stdout.write(res.stdout ?? '');
    process.stderr.write(res.stderr ?? '');
  }
  return { ok: res.status === 0, output };
}

/** asOf and every page's lastCheckedAt → the run's as-of date (fill scripts may hard-code the date they were written). */
function stampDates(file: string, asOf: string): void {
  const doc = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  doc.asOf = asOf;
  for (const page of PAGES_WITH_CHECK_DATE) {
    const p = doc[page] as Record<string, unknown> | undefined;
    if (p && typeof p === 'object' && 'lastCheckedAt' in p) p.lastCheckedAt = asOf;
  }
  writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
}

/** Lines that differ once asOf / lastCheckedAt values are blanked. Empty array = identical apart from those dates. */
function diffIgnoringDates(a: string, b: string): string[] {
  const norm = (s: string) => s.replace(/("(?:asOf|lastCheckedAt)": )"\d{4}-\d{2}-\d{2}"/g, '$1"<date>"').split('\n');
  const x = norm(a);
  const y = norm(b);
  const out: string[] = [];
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n && out.length < 12; i++) {
    if (x[i] !== y[i])
      out.push(`  line ${i + 1}\n    committed: ${(x[i] ?? '<eof>').trim().slice(0, 200)}\n    refreshed: ${(y[i] ?? '<eof>').trim().slice(0, 200)}`);
  }
  if (out.length && x.length !== y.length) out.push(`  (${x.length} vs ${y.length} lines)`);
  return out;
}

function refreshChapter(nn: string, o: RunOptions): RunResult {
  const slug = slugFor(nn);
  const committed = committedFile(nn, slug);
  const work = path.join(o.cache, nn);
  mkdirSync(work, { recursive: true });
  const out = path.resolve(o.outFile ?? (o.dryRun ? path.join(work, 'out', `${slug}.json`) : committed ?? path.join(CHAPTERS, `${slug}.json`)));
  mkdirSync(path.dirname(out), { recursive: true });
  if (o.logFile) writeFileSync(o.logFile, '');
  const log = (s: string) => (o.logFile ? writeFileSync(o.logFile, s + '\n', { flag: 'a' }) : console.log(s));
  const result: RunResult = { chapter: nn, slug, out, step: 'ok' };
  if (o.asOf === 'committed') {
    if (!committed) throw new Error(`--as-of committed: chapter ${nn} has no committed file`);
    o = { ...o, asOf: (JSON.parse(readFileSync(committed, 'utf8')) as { asOf: string }).asOf };
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    IU,
    CHAPTER_FILL_CACHE: o.cache,
    GEN: path.join(work, 'gen.json'),
    OUT: out,
    AS_OF: o.asOf,
    HTS_FILE_ARG: o.htsFile ? path.resolve(o.htsFile) : '',
    GEN_OFFLINE: o.offline ? '1' : '',
    REUSE_GEN: o.reuseGen ? '1' : '',
    PYTHONDONTWRITEBYTECODE: '1',
    // Several fill scripts sort sources by date only, so same-date sources came out in Python's random set order.
    // A fixed hash seed makes every run give the same order.
    PYTHONHASHSEED: '0',
  };
  log(`=== Chapter ${nn} (${slug}) → ${path.relative(IU, out).startsWith('..') ? out : path.relative(IU, out)}  as of ${o.asOf}`);

  log('--- generate + fill (chapter-fills/' + nn + '/run.sh)');
  if (!run('bash', [path.join(FILLS, nn, 'run.sh')], env, o.logFile).ok || !existsSync(out)) return { ...result, step: 'run.sh' };

  try {
    stampDates(out, o.asOf);
  } catch (err) {
    log(`stamp failed: ${(err as Error).message}`);
    return { ...result, step: 'stamp' };
  }
  log('--- compact');
  if (!run('pnpm', ['tariff:compact-chapters', out], env, o.logFile).ok) return { ...result, step: 'compact' };
  log('--- prettier');
  if (!run('pnpm', ['exec', 'prettier', '--write', '--config', path.join(IU, '.prettierrc'), out], env, o.logFile).ok) return { ...result, step: 'prettier' };

  if (o.compare) {
    if (!committed) result.compare = 'no committed file';
    else {
      const diff = diffIgnoringDates(readFileSync(committed, 'utf8'), readFileSync(out, 'utf8'));
      result.compare = diff.length ? 'DIFFERS' : 'identical';
      log(
        diff.length
          ? `--- compare: differs from ${path.relative(IU, committed)} (first lines)\n${diff.join('\n')}`
          : `--- compare: identical to ${path.relative(IU, committed)} apart from asOf / lastCheckedAt`
      );
    }
  }

  if (o.validate) {
    log('--- validate');
    const v = run('pnpm', ['tariff:validate-chapters', '--file', out, '--check-calculator', '--check-hts'], env, o.logFile);
    const summary = /PASS: \d+ error\(s\), \d+ warning\(s\)|FAIL: \d+ error\(s\), \d+ warning\(s\)/.exec(v.output)?.[0];
    result.validation = summary ?? (v.ok ? 'ok' : 'failed');
    if (!v.ok) return { ...result, step: 'validate' };
  }
  return result;
}

function main(): void {
  const argv = process.argv.slice(2);
  const args = parseCliArgs(argv);
  const asOf = stringArg(args, 'as-of') ?? todayIso();
  if (asOf !== 'committed' && !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error('--as-of must be YYYY-MM-DD or "committed"');
  const cache = path.resolve(process.env.CHAPTER_FILL_CACHE || path.join(os.tmpdir(), 'koala-chapter-fills'));
  const base: RunOptions = {
    asOf,
    htsFile: stringArg(args, 'hts-file'),
    outFile: stringArg(args, 'out'),
    dryRun: args['dry-run'] === true,
    compare: args.compare === true,
    validate: args['no-validate'] !== true,
    offline: args.offline === true,
    reuseGen: args['reuse-gen'] === true,
    cache,
  };
  if (!existsSync(path.join(IU, 'src/tariff-data/chapters'))) throw new Error('run from insights-ui/ (pnpm tariff:refresh-chapter …)');

  if (args.all === true) {
    if (!base.dryRun) throw new Error('--all only runs with --dry-run (it never rewrites the committed chapter files)');
    const results: RunResult[] = [];
    for (const nn of chaptersWithScripts()) {
      const logFile = path.join(cache, nn, 'refresh.log');
      mkdirSync(path.dirname(logFile), { recursive: true });
      process.stdout.write(`chapter ${nn} … `);
      const r = refreshChapter(nn, { ...base, outFile: undefined, logFile });
      results.push(r);
      console.log(
        `${r.step === 'ok' ? 'ok' : `FAILED at ${r.step}`}${r.validation ? ` | ${r.validation}` : ''}${r.compare ? ` | ${r.compare}` : ''}  (${logFile})`
      );
    }
    const failed = results.filter((r) => r.step !== 'ok');
    console.log(`\n${results.length - failed.length}/${results.length} chapters ran cleanly.`);
    if (base.compare)
      console.log(`${results.filter((r) => r.compare === 'identical').length}/${results.length} identical to the committed file (dates aside).`);
    if (failed.length) process.exit(1);
    return;
  }

  const positional = argv[0] && !argv[0].startsWith('--') ? argv[0] : undefined;
  if (!positional) throw new Error('usage: pnpm tariff:refresh-chapter <NN> [--as-of YYYY-MM-DD] [--dry-run|--out <file>] [--compare] [--hts-file <path>]');
  const nn = pad(positional);
  if (!existsSync(path.join(FILLS, nn, 'run.sh'))) {
    throw new Error(`chapter ${nn} has no chapter-fills/${nn}/run.sh. Chapters with one: ${chaptersWithScripts().join(', ')}`);
  }
  const r = refreshChapter(nn, base);
  console.log(
    `\n${r.step === 'ok' ? 'DONE' : `FAILED at ${r.step}`}: ${r.out}${r.validation ? ` | ${r.validation}` : ''}${r.compare ? ` | compare: ${r.compare}` : ''}`
  );
  if (r.step !== 'ok') process.exit(1);
}

main();
