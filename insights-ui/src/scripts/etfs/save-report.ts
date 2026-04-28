import { readFile } from 'node:fs/promises';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, fetchJson, parseArgs, requireAutomationSecret, requireStringArg } from './lib';

interface SaveReportResponse {
  success: boolean;
}

const VALID_REPORT_TYPES: readonly EtfReportType[] = [
  EtfReportType.PERFORMANCE_AND_RETURNS,
  EtfReportType.COST_EFFICIENCY_AND_TEAM,
  EtfReportType.RISK_ANALYSIS,
  EtfReportType.FUTURE_PERFORMANCE_OUTLOOK,
  EtfReportType.INDEX_STRATEGY,
  EtfReportType.COMPETITION,
  EtfReportType.FINAL_SUMMARY,
];

function toEtfReportType(raw: string): EtfReportType {
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
  requireAutomationSecret();

  const args = parseArgs(process.argv.slice(2));
  const symbol = requireStringArg(args, 'symbol').toUpperCase();
  const exchange = requireStringArg(args, 'exchange').toUpperCase();
  const reportType = toEtfReportType(requireStringArg(args, 'report-type'));
  const llmResponse = await readLlmResponse(args);

  // save-report-callback is the existing endpoint the lambda uses on the normal pipeline.
  // We call it without a generationRequestId so it only persists the response and skips
  // the lambda chain-trigger that the callback performs when part of an orchestrated run.
  const response = await fetchJson<SaveReportResponse>(
    `/api/${SPACE_ID}/etfs-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/save-report-callback`,
    {
      method: 'POST',
      body: {
        llmResponse,
        additionalData: { reportType },
      },
      authToken: true,
    }
  );

  console.log(JSON.stringify({ symbol, exchange, reportType, ...response }, null, 2));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
