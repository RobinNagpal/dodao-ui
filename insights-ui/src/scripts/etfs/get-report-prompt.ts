import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { API_BASE, AUTOMATION_SECRET, SPACE_ID, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, requireStringArg, sleep } from './lib';

interface EnsureMorInfoResponse {
  triggeredKinds: string[];
}

interface EtfGeneratePromptResponse {
  prompt: string;
  reportType: EtfReportType;
  promptKey: string;
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

const DEFAULT_MOR_WAIT_MS = 10_000;

function toEtfReportType(raw: string): EtfReportType {
  const matched = VALID_REPORT_TYPES.find((t) => t === raw);
  if (!matched) {
    throw new Error(`Invalid --report-type "${raw}". Valid values: ${VALID_REPORT_TYPES.join(', ')}`);
  }
  return matched;
}

async function main(): Promise<void> {
  // ensure-mor-info is token-gated; fail fast if the caller forgot to set the secret.
  requireAutomationSecret();

  const args = parseArgs(process.argv.slice(2));
  const symbol = requireStringArg(args, 'symbol').toUpperCase();
  const exchange = requireStringArg(args, 'exchange').toUpperCase();
  const reportType = toEtfReportType(requireStringArg(args, 'report-type'));
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;
  const waitMs = parsePositiveInt(args['wait-ms']) ?? DEFAULT_MOR_WAIT_MS;
  const skipMorCheck = args['skip-mor-check'] === true;

  if (!skipMorCheck) {
    const morResponse = await fetchJson<EnsureMorInfoResponse>(
      `/api/${SPACE_ID}/etfs-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/ensure-mor-info`,
      {
        method: 'POST',
        body: {},
        authToken: true,
      }
    );

    // Morningstar scrapes are fire-and-forget: the lambda callbacks upsert the tables
    // asynchronously. Sleep so the DB-backed prompt builder sees the freshly-written rows.
    if (morResponse.triggeredKinds.length > 0) {
      console.error(`MOR data missing for kinds [${morResponse.triggeredKinds.join(', ')}] — triggered scrape; sleeping ${waitMs}ms before building prompt.`);
      await sleep(waitMs);
    } else {
      console.error(`MOR data already present for ${symbol} ${exchange}.`);
    }
  }

  const response = await fetchJson<EtfGeneratePromptResponse>(
    `/api/${SPACE_ID}/etfs-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/generate-prompt`,
    {
      method: 'POST',
      body: { reportType },
      authToken: true,
    }
  );

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, response.prompt, 'utf-8');
    console.error(`Wrote prompt (${response.prompt.length} chars) → ${outPath} [${API_BASE} | ${symbol} ${exchange} ${reportType} | ${response.promptKey}]`);
  } else {
    console.error(`Generated ETF prompt for ${symbol} ${exchange} ${reportType} (${response.prompt.length} chars, key=${response.promptKey}).`);
    process.stdout.write(response.prompt);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
