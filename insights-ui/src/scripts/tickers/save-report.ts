import { readFile } from 'node:fs/promises';
import { ReportType } from '@/types/ticker-typesv1';
import { AUTOMATION_SECRET, SPACE_ID, fetchJson, parseArgs, requireStringArg } from './lib';

interface SaveReportResponse {
  success: boolean;
  message: string;
}

const VALID_REPORT_TYPES: readonly ReportType[] = [
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.COMPETITION,
  ReportType.BUSINESS_AND_MOAT,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_GROWTH,
  ReportType.FAIR_VALUE,
  ReportType.MANAGEMENT_TEAM,
  ReportType.FINAL_SUMMARY,
];

function toReportType(raw: string): ReportType {
  const matched = VALID_REPORT_TYPES.find((t) => t === raw);
  if (!matched) {
    throw new Error(`Invalid --report-type "${raw}". Valid values: ${VALID_REPORT_TYPES.join(', ')}`);
  }
  return matched;
}

async function readLlmResponse(args: Record<string, string | boolean>): Promise<unknown> {
  const inPath = typeof args['in'] === 'string' ? args['in'] : undefined;
  const inline = typeof args['json'] === 'string' ? args['json'] : undefined;

  if (inPath && inline) {
    throw new Error('Pass either --in <path> OR --json <string>, not both');
  }

  if (inline) {
    try {
      return JSON.parse(inline);
    } catch (err) {
      throw new Error(`Failed to parse --json argument as JSON: ${(err as Error).message}`);
    }
  }

  if (!inPath) {
    throw new Error('Missing required input: pass --in <path-to-llm-response.json> or --json <raw-json-string>');
  }

  const raw = await readFile(inPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ${inPath} as JSON: ${(err as Error).message}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const symbol = requireStringArg(args, 'symbol').toUpperCase();
  const exchange = requireStringArg(args, 'exchange').toUpperCase();
  const reportType = toReportType(requireStringArg(args, 'report-type'));
  const llmResponse = await readLlmResponse(args);

  // save-json-report validates the payload against the schema for the given report type and
  // then writes it to the appropriate ticker analysis tables.
  const authToken = AUTOMATION_SECRET.length > 0;

  const response = await fetchJson<SaveReportResponse>(
    `/api/${SPACE_ID}/tickers-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/save-json-report`,
    {
      method: 'POST',
      body: { llmResponse, reportType },
      authToken,
    }
  );

  console.log(JSON.stringify({ symbol, exchange, reportType, ...response }, null, 2));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
