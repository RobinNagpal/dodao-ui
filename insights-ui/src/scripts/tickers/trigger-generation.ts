import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ReportType } from '@/types/ticker-typesv1';
import { SPACE_ID, SampledTicker, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, sleep } from './lib';

interface TickerIdentifier {
  symbol: string;
  exchange: string;
}

interface GenerationRequestPayload {
  ticker: TickerIdentifier;
  regenerateCompetition: boolean;
  regenerateFinancialAnalysis: boolean;
  regenerateBusinessAndMoat: boolean;
  regeneratePastPerformance: boolean;
  regenerateFutureGrowth: boolean;
  regenerateFairValue: boolean;
  regenerateFutureRisk: boolean;
  regenerateManagementTeam: boolean;
  regenerateFinalSummary: boolean;
}

interface GenerationRequestRow {
  id: string;
  tickerId: string;
  status: string;
}

const ANALYSIS_CATEGORIES: readonly ReportType[] = [
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.COMPETITION,
  ReportType.BUSINESS_AND_MOAT,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_GROWTH,
  ReportType.FAIR_VALUE,
  ReportType.FUTURE_RISK,
  ReportType.MANAGEMENT_TEAM,
];

const ALL_REPORT_TYPES: readonly ReportType[] = [...ANALYSIS_CATEGORIES, ReportType.FINAL_SUMMARY];

const MAX_TICKERS_PER_INVOCATION = 50;
const DEFAULT_DELAY_MS = 10_000;

function buildPayload(ticker: TickerIdentifier, categories: ReportType[]): GenerationRequestPayload {
  const set = new Set(categories);
  return {
    ticker,
    regenerateCompetition: set.has(ReportType.COMPETITION),
    regenerateFinancialAnalysis: set.has(ReportType.FINANCIAL_ANALYSIS),
    regenerateBusinessAndMoat: set.has(ReportType.BUSINESS_AND_MOAT),
    regeneratePastPerformance: set.has(ReportType.PAST_PERFORMANCE),
    regenerateFutureGrowth: set.has(ReportType.FUTURE_GROWTH),
    regenerateFairValue: set.has(ReportType.FAIR_VALUE),
    regenerateFutureRisk: set.has(ReportType.FUTURE_RISK),
    regenerateManagementTeam: set.has(ReportType.MANAGEMENT_TEAM),
    regenerateFinalSummary: set.has(ReportType.FINAL_SUMMARY),
  };
}

/**
 * Resolve the report-type list from CLI args.
 *
 * Precedence (first match wins):
 *   1. `--all` (or `--categories=all`)                 → every report type (incl. final-summary)
 *   2. `--analysis` (or `--categories=analysis`)       → 7 analysis categories, skip final-summary
 *   3. `--categories=<csv>`                            → explicit comma-separated list
 *   4. (no flag)                                       → defaults to all 9 report types
 *
 * Each token in a CSV must match a ReportType enum value (e.g. `financial-analysis`).
 */
function resolveCategories(args: Record<string, string | boolean>): ReportType[] {
  if (args['all'] === true) return [...ALL_REPORT_TYPES];
  if (args['analysis'] === true) return [...ANALYSIS_CATEGORIES];

  const raw = typeof args['categories'] === 'string' ? args['categories'].trim() : '';
  if (!raw) return [...ALL_REPORT_TYPES];

  if (raw === 'all') return [...ALL_REPORT_TYPES];
  if (raw === 'analysis') return [...ANALYSIS_CATEGORIES];

  const valid = new Set<string>(Object.values(ReportType));
  const cats = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const c of cats) {
    if (!valid.has(c)) {
      throw new Error(`Unknown category "${c}". Valid values: ${[...valid].join(', ')} (or shortcuts: all, analysis)`);
    }
  }
  return cats as ReportType[];
}

interface ResolvedTicker {
  symbol: string;
  exchange: string;
  source: SampledTicker;
}

/**
 * Ticker list comes from one of two sources, mutually exclusive:
 *   --in <path>                       JSON file containing an array of {symbol, exchange, ...}
 *   --symbol X --exchange Y           single-ticker convenience for one-off use
 */
async function resolveTickers(args: Record<string, string | boolean>): Promise<ResolvedTicker[]> {
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
  const parsed = JSON.parse(raw) as Array<Partial<SampledTicker>>;
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
      source: entry as SampledTicker,
    };
  });
}

interface PostOutcome {
  ticker: ResolvedTicker;
  requestId: string | null;
  ok: boolean;
  error?: string;
}

async function postOne(payload: GenerationRequestPayload, ticker: ResolvedTicker): Promise<PostOutcome> {
  try {
    // Endpoint accepts an array; we send a single-element array per call so each ticker
    // is enqueued in its own POST. Failures of one ticker don't poison the whole batch.
    const rows = await fetchJson<GenerationRequestRow[]>(`/api/${SPACE_ID}/tickers-v1/generation-requests`, {
      method: 'POST',
      body: [payload],
      authToken: true,
    });
    return { ticker, requestId: rows[0]?.id ?? null, ok: true };
  } catch (err) {
    return { ticker, requestId: null, ok: false, error: (err as Error).message };
  }
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;
  const delayMs = parsePositiveInt(args['delay-ms']) ?? DEFAULT_DELAY_MS;

  const categories = resolveCategories(args);
  const tickers = await resolveTickers(args);

  if (tickers.length > MAX_TICKERS_PER_INVOCATION) {
    throw new Error(
      `Refusing to enqueue ${tickers.length} tickers in one invocation — limit is ${MAX_TICKERS_PER_INVOCATION}. ` +
        `Each ticker triggers up to 8 LLM jobs and a sequential delay; split the input file and run again.`
    );
  }

  console.log(`Enqueueing generation for ${tickers.length} ticker${tickers.length === 1 ? '' : 's'}, categories: ${categories.join(', ')}`);
  if (tickers.length > 1) console.log(`Sequential POSTs with ${delayMs}ms delay between calls.`);

  const outcomes: PostOutcome[] = [];

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    const idx = `[${String(i + 1).padStart(2, '0')}/${tickers.length}]`;
    const payload = buildPayload({ symbol: ticker.symbol, exchange: ticker.exchange }, categories);

    const outcome = await postOne(payload, ticker);
    outcomes.push(outcome);

    if (outcome.ok) {
      console.log(`${idx} OK   ${ticker.symbol} (${ticker.exchange}) — request ${outcome.requestId ?? '(no id)'}`);
    } else {
      console.error(`${idx} FAIL ${ticker.symbol} (${ticker.exchange}) — ${outcome.error}`);
    }

    if (i < tickers.length - 1) {
      await sleep(delayMs);
    }
  }

  const okCount = outcomes.filter((o) => o.ok).length;
  const failCount = outcomes.length - okCount;
  console.log(`\nDone — ${okCount} succeeded, ${failCount} failed.`);

  const requestIds = outcomes.filter((o) => o.requestId !== null).map((o) => o.requestId as string);
  const failedTickers = outcomes.filter((o) => !o.ok).map((o) => ({ symbol: o.ticker.symbol, exchange: o.ticker.exchange, error: o.error }));

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(
      outPath,
      JSON.stringify(
        {
          categories,
          tickers: outcomes.map((o) => ({
            ...o.ticker.source,
            symbol: o.ticker.symbol,
            exchange: o.ticker.exchange,
            requestId: o.requestId,
            ok: o.ok,
            error: o.error ?? null,
          })),
          requestIds,
          failedTickers,
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`Wrote request IDs → ${outPath}`);
  } else {
    console.log(JSON.stringify({ requestIds, failedTickers }, null, 2));
  }

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
