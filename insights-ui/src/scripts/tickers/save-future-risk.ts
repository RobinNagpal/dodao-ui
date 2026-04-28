import { readFile } from 'node:fs/promises';
import { parseArgs, requireStringArg } from './lib';
import { saveFutureRiskResponse } from '@/utils/analysis-reports/save-report-utils';

interface FutureRiskResponse {
  summary: string;
  detailedAnalysis: string;
}

async function readLlmResponse(args: Record<string, string | boolean>): Promise<FutureRiskResponse> {
  const inPath = typeof args['in'] === 'string' ? args['in'] : undefined;
  const inline = typeof args['json'] === 'string' ? args['json'] : undefined;

  if (inPath && inline) {
    throw new Error('Pass either --in <path> OR --json <string>, not both');
  }

  if (inline) {
    try {
      return JSON.parse(inline) as FutureRiskResponse;
    } catch (err) {
      throw new Error(`Failed to parse --json argument as JSON: ${(err as Error).message}`);
    }
  }

  if (!inPath) {
    throw new Error('Missing required input: pass --in <path-to-llm-response.json> or --json <raw-json-string>');
  }

  const raw = await readFile(inPath, 'utf-8');
  try {
    return JSON.parse(raw) as FutureRiskResponse;
  } catch (err) {
    throw new Error(`Failed to parse ${inPath} as JSON: ${(err as Error).message}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const symbol = requireStringArg(args, 'symbol').toUpperCase();
  const exchange = requireStringArg(args, 'exchange').toUpperCase();
  const llmResponse = await readLlmResponse(args);

  if (!llmResponse.summary || !llmResponse.detailedAnalysis) {
    throw new Error('Response must have "summary" and "detailedAnalysis" fields');
  }

  await saveFutureRiskResponse(symbol, exchange, llmResponse);

  console.log(
    JSON.stringify(
      {
        symbol,
        exchange,
        reportType: 'future-risk',
        success: true,
        message: 'Report saved successfully',
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
