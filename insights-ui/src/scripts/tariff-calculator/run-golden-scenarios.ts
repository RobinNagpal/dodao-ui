import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { MeasureEngineInput, MeasureEngineLine, MeasureEngineResult, TariffMeasuresFile } from '@/types/tariff-calculator-measures';
import { calculateWithMeasures } from '@/utils/tariff-calculator/measures-engine';
import { parseArgs } from '../tickers/lib';

/**
 * Golden scenarios for the measures-based tariff calculator (issue #1785).
 *
 *   pnpm tariff:calc-scenarios                 # run every scenario
 *   pnpm tariff:calc-scenarios --id ch30-gauze-br
 *   pnpm tariff:calc-scenarios --verbose       # print each scenario's duty lines
 *
 * Loads src/tariff-data/calculator/golden-scenarios.json (expected duties taken
 * from the chapter content files) and src/tariff-data/calculator/measures.json,
 * runs the pure engine on each scenario and exits 1 on any mismatch or engine
 * error. No DB, no network — safe in CI.
 */

interface GoldenScenario {
  id: string;
  description: string;
  chapter: string;
  input: MeasureEngineInput;
  line: MeasureEngineLine;
  expectedTotalDutyUsd: number;
  toleranceUsd: number;
  sourceNote: string;
}

interface GoldenScenariosFile {
  description: string;
  entryDate: string;
  scenarios: GoldenScenario[];
}

const DATA_DIR = path.join(process.cwd(), 'src/tariff-data/calculator');

function readJson<T>(file: string): T {
  const full = path.join(DATA_DIR, file);
  if (!existsSync(full)) throw new Error(`${path.relative(process.cwd(), full)} not found`);
  return JSON.parse(readFileSync(full, 'utf8')) as T;
}

function usd(n: number | null): string {
  return n === null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function padLeft(s: string, n: number): string {
  return s.length >= n ? s : ' '.repeat(n - s.length) + s;
}

type Status = 'PASS' | 'FAIL' | 'ERROR';

interface Outcome {
  scenario: GoldenScenario;
  status: Status;
  actual: number | null;
  result: MeasureEngineResult | null;
  message?: string;
}

function runScenario(scenario: GoldenScenario, measures: TariffMeasuresFile): Outcome {
  let result: MeasureEngineResult;
  try {
    result = calculateWithMeasures(scenario.input, scenario.line, measures.measures);
  } catch (err) {
    return { scenario, status: 'ERROR', actual: null, result: null, message: `engine threw: ${(err as Error).message}` };
  }
  if (result.error) return { scenario, status: 'ERROR', actual: null, result, message: result.error };
  const diff = Math.abs(result.totalDutyUsd - scenario.expectedTotalDutyUsd);
  const status: Status = diff <= scenario.toleranceUsd + 1e-9 ? 'PASS' : 'FAIL';
  return { scenario, status, actual: result.totalDutyUsd, result };
}

function printDetail(o: Outcome): void {
  if (o.message) console.log(`      ${o.message}`);
  for (const l of o.result?.lines ?? []) console.log(`      ${pad(l.code, 12)} ${pad(l.rateText, 28)} ${padLeft(usd(l.amountUsd), 14)}  ${l.label}`);
  for (const s of o.result?.skipped ?? []) console.log(`      skipped ${s.ch99Code}: ${s.reason}`);
  console.log(`      source: ${o.scenario.sourceNote}`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const onlyId = typeof args.id === 'string' ? args.id : null;
  const verbose = Boolean(args.verbose);

  const golden = readJson<GoldenScenariosFile>('golden-scenarios.json');
  const measures = readJson<TariffMeasuresFile>('measures.json');
  const scenarios = golden.scenarios.filter((s) => !onlyId || s.id === onlyId);
  if (onlyId && scenarios.length === 0) {
    console.error(`No scenario "${onlyId}"`);
    process.exit(1);
  }

  console.log(
    `Golden tariff-calculator scenarios: ${scenarios.length} (measures: HTS ${measures.htsEdition}, reviewed ${measures.reviewedAt}, ${measures.measures.length} measures)\n`
  );
  const idWidth = Math.max(...scenarios.map((s) => s.id.length), 2);
  console.log(
    `${pad('id', idWidth)}  ${pad('hts10', 10)}  cty  ${pad('spi', 3)}  ${pad('type', 8)}  ${padLeft('expected', 14)}  ${padLeft('actual', 14)}  status`
  );
  console.log('-'.repeat(idWidth + 80));

  const outcomes = scenarios.map((s) => runScenario(s, measures));
  for (const o of outcomes) {
    const s = o.scenario;
    console.log(
      `${pad(s.id, idWidth)}  ${s.input.hts10}  ${pad(s.input.countryOfOrigin, 3)}  ${pad(s.input.claimedSpi ?? '', 3)}  ${pad(
        s.input.productType ?? '',
        8
      )}  ${padLeft(usd(s.expectedTotalDutyUsd), 14)}  ${padLeft(usd(o.actual), 14)}  ${o.status}`
    );
    if (verbose || o.status !== 'PASS') printDetail(o);
  }

  const failed = outcomes.filter((o) => o.status !== 'PASS');
  console.log(
    `\n${outcomes.length - failed.length}/${outcomes.length} passed${
      failed.length ? `, ${failed.length} failed: ${failed.map((o) => o.scenario.id).join(', ')}` : ''
    }`
  );
  if (failed.length > 0) process.exit(1);
}

try {
  main();
} catch (err) {
  console.error(`Golden scenarios could not run: ${(err as Error).message}`);
  process.exit(1);
}
