import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ReportType } from '@/types/ticker-typesv1';
import { AGENT_PROMPT_PREAMBLE, API_BASE, AUTOMATION_SECRET, SPACE_ID, fetchJson, parseArgs, requireStringArg } from './lib';

interface GeneratePromptResponse {
  prompt: string;
  reportType: ReportType;
}

const VALID_REPORT_TYPES: readonly ReportType[] = [
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.COMPETITION,
  ReportType.BUSINESS_AND_MOAT,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_GROWTH,
  ReportType.FAIR_VALUE,
  ReportType.FUTURE_RISK,
  ReportType.FINAL_SUMMARY,
];

function toReportType(raw: string): ReportType {
  const matched = VALID_REPORT_TYPES.find((t) => t === raw);
  if (!matched) {
    throw new Error(`Invalid --report-type "${raw}". Valid values: ${VALID_REPORT_TYPES.join(', ')}`);
  }
  return matched;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const symbol = requireStringArg(args, 'symbol').toUpperCase();
  const exchange = requireStringArg(args, 'exchange').toUpperCase();
  const reportType = toReportType(requireStringArg(args, 'report-type'));
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;

  // generate-prompt is an open endpoint (no auth wrapper), but we still forward the
  // automation token if present so request logs attribute the call to the scripted caller.
  const authToken = AUTOMATION_SECRET.length > 0;

  const response = await fetchJson<GeneratePromptResponse>(
    `/api/${SPACE_ID}/tickers-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/generate-prompt`,
    {
      method: 'POST',
      body: { reportType },
      authToken,
    }
  );

  // Prepend the agent-facing output rules. These sit above the per-category template so
  // the LLM reads the schema-agnostic instructions (don't leak field names, self-source
  // missing metrics) before the category-specific rules kick in.
  const finalPrompt = AGENT_PROMPT_PREAMBLE + response.prompt;

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, finalPrompt, 'utf-8');
    console.error(`Wrote prompt (${finalPrompt.length} chars) → ${outPath} [${API_BASE} | ${symbol} ${exchange} ${reportType}]`);
  } else {
    // Prompt goes to stdout so it can be piped directly into the LLM call. Metadata
    // goes to stderr to avoid polluting the captured prompt.
    console.error(`Generated prompt for ${symbol} ${exchange} ${reportType} (${finalPrompt.length} chars).`);
    process.stdout.write(finalPrompt);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
