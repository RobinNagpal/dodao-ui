// Load env vars first — stockAnalyzeUrlValidation reads NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL
// at module load time, so dotenv must run before that import resolves.
import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { AllExchanges, EXCHANGES, isExchange } from '@/utils/countryExchangeUtils';
import { generateExpectedStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { SPACE_ID, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, sleep } from './lib';

interface NewStockInput {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
  summary?: string;
  stockAnalyzeUrl?: string;
}

interface ValidatedStock {
  name: string;
  symbol: string;
  exchange: AllExchanges;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
  summary?: string;
  stockAnalyzeUrl: string;
  source: NewStockInput;
}

interface AddedTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  websiteUrl?: string | null;
  stockAnalyzeUrl?: string | null;
  industryKey: string;
  subIndustryKey: string;
}

interface ErrorTicker {
  input: NewStockInput;
  reason: string;
}

interface BulkNewTickersResponse {
  success: boolean;
  addedTickers: AddedTicker[];
  errorTickers: ErrorTicker[];
}

const MAX_STOCKS_PER_INVOCATION = 100;
const DEFAULT_DELAY_MS = 500;

/**
 * The stock input comes from one of two mutually-exclusive sources:
 *   --in <path>   JSON file: an array of {name, symbol, exchange, industryKey, subIndustryKey, websiteUrl, ...}
 *   --name ... --symbol ... --exchange ... (+ flags)   single-stock convenience
 */
async function resolveInputs(args: Record<string, string | boolean>): Promise<NewStockInput[]> {
  const inPath = typeof args['in'] === 'string' ? args['in'] : undefined;
  const hasInline =
    typeof args['name'] === 'string' ||
    typeof args['symbol'] === 'string' ||
    typeof args['exchange'] === 'string' ||
    typeof args['industry'] === 'string' ||
    typeof args['sub-industry'] === 'string' ||
    typeof args['website'] === 'string';

  if (inPath && hasInline) {
    throw new Error('Pass either --in <path> OR inline flags (--name/--symbol/--exchange/...), not both');
  }

  if (hasInline) {
    const inline: NewStockInput = {
      name: asString(args, 'name'),
      symbol: asString(args, 'symbol'),
      exchange: asString(args, 'exchange'),
      industryKey: asString(args, 'industry'),
      subIndustryKey: asString(args, 'sub-industry'),
      websiteUrl: asString(args, 'website'),
      summary: typeof args['summary'] === 'string' ? args['summary'] : undefined,
      stockAnalyzeUrl: typeof args['stock-analyze-url'] === 'string' ? args['stock-analyze-url'] : undefined,
    };
    return [inline];
  }

  if (!inPath) {
    throw new Error(
      'Missing required input: pass --in <path> or inline flags ' +
        '(--name --symbol --exchange --industry --sub-industry --website [--summary] [--stock-analyze-url])'
    );
  }

  const raw = await readFile(inPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const items: unknown[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.tickers) ? parsed.tickers : [];
  if (items.length === 0) {
    throw new Error(`--in file ${inPath} must contain a non-empty JSON array (or { tickers: [...] }) of stock objects`);
  }
  return items.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`--in entry at index ${idx} is not an object: ${JSON.stringify(item)}`);
    }
    const obj = item as Record<string, unknown>;
    return {
      name: stringField(obj, 'name'),
      symbol: stringField(obj, 'symbol'),
      exchange: stringField(obj, 'exchange'),
      industryKey: stringField(obj, 'industryKey'),
      subIndustryKey: stringField(obj, 'subIndustryKey'),
      websiteUrl: stringField(obj, 'websiteUrl'),
      summary: typeof obj.summary === 'string' ? obj.summary : undefined,
      stockAnalyzeUrl: typeof obj.stockAnalyzeUrl === 'string' ? obj.stockAnalyzeUrl : undefined,
    };
  });
}

function asString(args: Record<string, string | boolean>, key: string): string {
  const v = args[key];
  return typeof v === 'string' ? v : '';
}

function stringField(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === 'string' ? v : '';
}

interface ValidationFailure {
  input: NewStockInput;
  reason: string;
}

/**
 * Validates a single stock input against required fields and the predefined
 * exchange list. `stockAnalyzeUrl` is auto-generated when absent so the CLI
 * never POSTs a null value for a field the schema marks non-nullable.
 */
function validate(input: NewStockInput): ValidatedStock | ValidationFailure {
  const name = (input.name ?? '').trim();
  const symbol = (input.symbol ?? '').trim().toUpperCase();
  const exchange = (input.exchange ?? '').trim().toUpperCase();
  const industryKey = (input.industryKey ?? '').trim();
  const subIndustryKey = (input.subIndustryKey ?? '').trim();
  const websiteUrl = (input.websiteUrl ?? '').trim();
  const summary = input.summary?.trim();
  const providedStockAnalyzeUrl = input.stockAnalyzeUrl?.trim();

  const missing: string[] = [];
  if (!name) missing.push('name');
  if (!symbol) missing.push('symbol');
  if (!exchange) missing.push('exchange');
  if (!industryKey) missing.push('industryKey');
  if (!subIndustryKey) missing.push('subIndustryKey');
  if (!websiteUrl) missing.push('websiteUrl');
  if (missing.length) {
    return { input, reason: `Missing required field(s): ${missing.join(', ')}` };
  }

  if (!isExchange(exchange)) {
    return { input, reason: `Invalid exchange "${input.exchange}". Supported: ${EXCHANGES.join(', ')}` };
  }

  if (!/^https?:\/\//i.test(websiteUrl)) {
    return { input, reason: `websiteUrl must start with http:// or https:// (got "${websiteUrl}")` };
  }

  const stockAnalyzeUrl =
    providedStockAnalyzeUrl && providedStockAnalyzeUrl.length > 0 ? providedStockAnalyzeUrl : generateExpectedStockAnalyzeUrl(symbol, exchange as AllExchanges);

  return {
    name,
    symbol,
    exchange: exchange as AllExchanges,
    industryKey,
    subIndustryKey,
    websiteUrl,
    summary: summary && summary.length > 0 ? summary : undefined,
    stockAnalyzeUrl,
    source: input,
  };
}

interface PostOutcome {
  stock: ValidatedStock;
  created: AddedTicker | null;
  ok: boolean;
  error?: string;
}

async function postOne(stock: ValidatedStock): Promise<PostOutcome> {
  try {
    // The create-ticker route is not token-gated today; authToken is harmless but we
    // still pass it so if the endpoint later adopts `withAdminOrToken` the CLI keeps working.
    const resp = await fetchJson<BulkNewTickersResponse>(`/api/${SPACE_ID}/tickers-v1`, {
      method: 'POST',
      authToken: true,
      body: {
        tickers: [
          {
            name: stock.name,
            symbol: stock.symbol,
            exchange: stock.exchange,
            industryKey: stock.industryKey,
            subIndustryKey: stock.subIndustryKey,
            websiteUrl: stock.websiteUrl,
            summary: stock.summary,
            stockAnalyzeUrl: stock.stockAnalyzeUrl,
          },
        ],
      },
    });
    if (resp.addedTickers.length > 0) {
      return { stock, created: resp.addedTickers[0], ok: true };
    }
    const reason = resp.errorTickers[0]?.reason ?? 'Unknown server error';
    return { stock, created: null, ok: false, error: reason };
  } catch (err) {
    return { stock, created: null, ok: false, error: (err as Error).message };
  }
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;
  const delayMs = parsePositiveInt(args['delay-ms']) ?? DEFAULT_DELAY_MS;

  const rawInputs = await resolveInputs(args);
  if (rawInputs.length > MAX_STOCKS_PER_INVOCATION) {
    throw new Error(`Refusing to add ${rawInputs.length} stocks in one invocation — limit is ${MAX_STOCKS_PER_INVOCATION}. Split the input file.`);
  }

  const validations = rawInputs.map((input) => validate(input));
  const valid: ValidatedStock[] = [];
  const preFailures: ValidationFailure[] = [];
  for (const v of validations) {
    if ('source' in v) valid.push(v);
    else preFailures.push(v);
  }

  if (preFailures.length > 0) {
    console.warn(`Skipping ${preFailures.length} input(s) that failed pre-validation:`);
    for (const f of preFailures) {
      console.warn(`  - ${f.input.symbol || '(no symbol)'} (${f.input.exchange || '(no exchange)'}): ${f.reason}`);
    }
  }

  console.log(`Adding ${valid.length} stock${valid.length === 1 ? '' : 's'}${valid.length > 1 ? ` with ${delayMs}ms delay between calls` : ''}`);

  const outcomes: PostOutcome[] = [];

  for (let i = 0; i < valid.length; i++) {
    const stock = valid[i];
    const idx = `[${String(i + 1).padStart(2, '0')}/${valid.length}]`;
    const outcome = await postOne(stock);
    outcomes.push(outcome);
    if (outcome.ok) {
      console.log(`${idx} OK   ${stock.symbol} (${stock.exchange}) — id ${outcome.created?.id ?? '(no id)'}`);
    } else {
      console.error(`${idx} FAIL ${stock.symbol} (${stock.exchange}) — ${outcome.error}`);
    }
    if (i < valid.length - 1) await sleep(delayMs);
  }

  const okCount = outcomes.filter((o) => o.ok).length;
  const failCount = outcomes.length - okCount + preFailures.length;
  console.log(`\nDone — ${okCount} added, ${failCount} failed.`);

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(
      outPath,
      JSON.stringify(
        {
          added: outcomes.filter((o) => o.ok).map((o) => o.created),
          failed: [
            ...preFailures.map((f) => ({ symbol: f.input.symbol, exchange: f.input.exchange, reason: f.reason })),
            ...outcomes.filter((o) => !o.ok).map((o) => ({ symbol: o.stock.symbol, exchange: o.stock.exchange, reason: o.error })),
          ],
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`Wrote results → ${outPath}`);
  }

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
