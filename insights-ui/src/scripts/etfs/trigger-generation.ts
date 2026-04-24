import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, SampledEtf, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, sleep } from './lib';

interface EtfGenerationRequestPayload {
  etf: { symbol: string; exchange: string };
  regeneratePerformanceAndReturns: boolean;
  regenerateCostEfficiencyAndTeam: boolean;
  regenerateRiskAnalysis: boolean;
  regenerateFuturePerformanceOutlook?: boolean;
  regenerateIndexStrategy?: boolean;
  regenerateCompetition?: boolean;
  regenerateFinalSummary?: boolean;
}

interface EtfGenerationRequestRow {
  id: string;
  etfId: string;
  status: string;
}

const EVALUATION_CATEGORIES: readonly EtfReportType[] = [
  EtfReportType.PERFORMANCE_AND_RETURNS,
  EtfReportType.COST_EFFICIENCY_AND_TEAM,
  EtfReportType.RISK_ANALYSIS,
  EtfReportType.FUTURE_PERFORMANCE_OUTLOOK,
];

const ALL_REPORT_TYPES: readonly EtfReportType[] = [
  ...EVALUATION_CATEGORIES,
  EtfReportType.INDEX_STRATEGY,
  EtfReportType.COMPETITION,
  EtfReportType.FINAL_SUMMARY,
];

const MAX_ETFS_PER_INVOCATION = 50;
const DEFAULT_DELAY_MS = 10_000;

function buildPayload(etf: { symbol: string; exchange: string }, categories: EtfReportType[]): EtfGenerationRequestPayload {
  const set = new Set(categories);
  return {
    etf,
    regeneratePerformanceAndReturns: set.has(EtfReportType.PERFORMANCE_AND_RETURNS),
    regenerateCostEfficiencyAndTeam: set.has(EtfReportType.COST_EFFICIENCY_AND_TEAM),
    regenerateRiskAnalysis: set.has(EtfReportType.RISK_ANALYSIS),
    regenerateFuturePerformanceOutlook: set.has(EtfReportType.FUTURE_PERFORMANCE_OUTLOOK),
    regenerateIndexStrategy: set.has(EtfReportType.INDEX_STRATEGY),
    regenerateCompetition: set.has(EtfReportType.COMPETITION),
    regenerateFinalSummary: set.has(EtfReportType.FINAL_SUMMARY),
  };
}

/**
 * Resolve the report-type list from CLI args.
 *
 * Precedence (first match wins):
 *   1. `--all` (or `--categories=all`)              → every report type
 *   2. `--evaluation` (or `--categories=evaluation`) → the four factor-analysis categories
 *   3. `--categories=<csv>`                          → explicit comma-separated list
 *   4. (no flag)                                     → defaults to the four evaluation categories
 *
 * Each token in a CSV must match an EtfReportType enum value (e.g. `performance-and-returns`).
 */
function resolveCategories(args: Record<string, string | boolean>): EtfReportType[] {
  if (args['all'] === true) return [...ALL_REPORT_TYPES];
  if (args['evaluation'] === true) return [...EVALUATION_CATEGORIES];

  const raw = typeof args['categories'] === 'string' ? args['categories'].trim() : '';
  if (!raw) return [...EVALUATION_CATEGORIES];

  if (raw === 'all') return [...ALL_REPORT_TYPES];
  if (raw === 'evaluation') return [...EVALUATION_CATEGORIES];

  const valid = new Set<string>(Object.values(EtfReportType));
  const cats = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const c of cats) {
    if (!valid.has(c)) {
      throw new Error(`Unknown category "${c}". Valid values: ${[...valid].join(', ')} (or shortcuts: all, evaluation)`);
    }
  }
  return cats as EtfReportType[];
}

interface ResolvedEtf {
  symbol: string;
  exchange: string;
  source: SampledEtf;
}

/**
 * ETF list comes from one of two sources, mutually exclusive:
 *   --in <path>                       JSON file containing an array of {symbol, exchange, ...}
 *   --symbol X --exchange Y           single-ETF convenience for one-off use
 */
async function resolveEtfs(args: Record<string, string | boolean>): Promise<ResolvedEtf[]> {
  const inPath = typeof args['in'] === 'string' ? args['in'] : undefined;
  const inlineSymbol = typeof args['symbol'] === 'string' ? args['symbol'] : undefined;
  const inlineExchange = typeof args['exchange'] === 'string' ? args['exchange'] : undefined;

  if (inPath && (inlineSymbol || inlineExchange)) {
    throw new Error('Pass either --in <path> OR --symbol/--exchange, not both');
  }

  if (inlineSymbol || inlineExchange) {
    if (!inlineSymbol || !inlineExchange) {
      throw new Error('--symbol and --exchange must be passed together');
    }
    const symbol = inlineSymbol.toUpperCase();
    const exchange = inlineExchange.toUpperCase();
    return [{ symbol, exchange, source: { symbol, exchange } }];
  }

  if (!inPath) {
    throw new Error('Missing required input: pass --in <path> or --symbol X --exchange Y');
  }

  const raw = await readFile(inPath, 'utf-8');
  const parsed = JSON.parse(raw) as Array<Partial<SampledEtf>>;
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`--in file ${inPath} must contain a non-empty JSON array of {symbol, exchange} objects`);
  }
  return parsed.map((entry, idx) => {
    if (typeof entry.symbol !== 'string' || entry.symbol.length === 0 || typeof entry.exchange !== 'string' || entry.exchange.length === 0) {
      throw new Error(`--in entry at index ${idx} is missing symbol or exchange: ${JSON.stringify(entry)}`);
    }
    return {
      symbol: entry.symbol.toUpperCase(),
      exchange: entry.exchange.toUpperCase(),
      source: entry as SampledEtf,
    };
  });
}

interface PostOutcome {
  etf: ResolvedEtf;
  requestId: string | null;
  ok: boolean;
  error?: string;
}

async function postOne(payload: EtfGenerationRequestPayload, etf: ResolvedEtf): Promise<PostOutcome> {
  try {
    // Endpoint accepts an array; we send a single-element array per call so each ETF
    // is enqueued in its own POST. Failures of one ETF don't poison the whole batch.
    const rows = await fetchJson<EtfGenerationRequestRow[]>(`/api/${SPACE_ID}/etfs-v1/generation-requests`, {
      method: 'POST',
      body: [payload],
      authToken: true,
    });
    return { etf, requestId: rows[0]?.id ?? null, ok: true };
  } catch (err) {
    return { etf, requestId: null, ok: false, error: (err as Error).message };
  }
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;
  const delayMs = parsePositiveInt(args['delay-ms']) ?? DEFAULT_DELAY_MS;

  const categories = resolveCategories(args);
  const etfs = await resolveEtfs(args);

  if (etfs.length > MAX_ETFS_PER_INVOCATION) {
    throw new Error(
      `Refusing to enqueue ${etfs.length} ETFs in one invocation — limit is ${MAX_ETFS_PER_INVOCATION}. ` +
        `Each ETF triggers up to 6 LLM jobs and a sequential delay; split the input file and run again.`
    );
  }

  console.log(`Enqueueing generation for ${etfs.length} ETF${etfs.length === 1 ? '' : 's'}, categories: ${categories.join(', ')}`);
  if (etfs.length > 1) console.log(`Sequential POSTs with ${delayMs}ms delay between calls.`);

  const outcomes: PostOutcome[] = [];

  for (let i = 0; i < etfs.length; i++) {
    const etf = etfs[i];
    const idx = `[${String(i + 1).padStart(2, '0')}/${etfs.length}]`;
    const payload = buildPayload({ symbol: etf.symbol, exchange: etf.exchange }, categories);

    const outcome = await postOne(payload, etf);
    outcomes.push(outcome);

    if (outcome.ok) {
      console.log(`${idx} OK   ${etf.symbol} (${etf.exchange}) — request ${outcome.requestId ?? '(no id)'}`);
    } else {
      console.error(`${idx} FAIL ${etf.symbol} (${etf.exchange}) — ${outcome.error}`);
    }

    if (i < etfs.length - 1) {
      await sleep(delayMs);
    }
  }

  const okCount = outcomes.filter((o) => o.ok).length;
  const failCount = outcomes.length - okCount;
  console.log(`\nDone — ${okCount} succeeded, ${failCount} failed.`);

  const requestIds = outcomes.filter((o) => o.requestId !== null).map((o) => o.requestId as string);
  const failedEtfs = outcomes.filter((o) => !o.ok).map((o) => ({ symbol: o.etf.symbol, exchange: o.etf.exchange, error: o.error }));

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(
      outPath,
      JSON.stringify(
        {
          categories,
          etfs: outcomes.map((o) => ({
            ...o.etf.source,
            symbol: o.etf.symbol,
            exchange: o.etf.exchange,
            requestId: o.requestId,
            ok: o.ok,
            error: o.error ?? null,
          })),
          requestIds,
          failedEtfs,
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`Wrote request IDs → ${outPath}`);
  } else {
    console.log(JSON.stringify({ requestIds, failedEtfs }, null, 2));
  }

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
