import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, fetchJson, parseArgs, requireAutomationSecret, requireStringArg } from './lib';
import type { SampledEtf } from './sample-etfs';

interface EtfGenerationRequestPayload {
  etf: { symbol: string; exchange: string };
  regeneratePerformanceAndReturns: boolean;
  regenerateCostEfficiencyAndTeam: boolean;
  regenerateRiskAnalysis: boolean;
  regenerateFuturePerformanceOutlook?: boolean;
  regenerateIndexStrategy?: boolean;
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

function buildPayload(etf: { symbol: string; exchange: string }, categories: EtfReportType[]): EtfGenerationRequestPayload {
  const set = new Set(categories);
  return {
    etf,
    regeneratePerformanceAndReturns: set.has(EtfReportType.PERFORMANCE_AND_RETURNS),
    regenerateCostEfficiencyAndTeam: set.has(EtfReportType.COST_EFFICIENCY_AND_TEAM),
    regenerateRiskAnalysis: set.has(EtfReportType.RISK_ANALYSIS),
    regenerateFuturePerformanceOutlook: set.has(EtfReportType.FUTURE_PERFORMANCE_OUTLOOK),
    regenerateIndexStrategy: set.has(EtfReportType.INDEX_STRATEGY),
    regenerateFinalSummary: set.has(EtfReportType.FINAL_SUMMARY),
  };
}

function parseCategories(raw: string | undefined): EtfReportType[] {
  if (!raw) return [...EVALUATION_CATEGORIES];
  const valid = new Set<string>(Object.values(EtfReportType));
  const cats = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const c of cats) {
    if (!valid.has(c)) {
      throw new Error(`Unknown category "${c}". Valid values: ${[...valid].join(', ')}`);
    }
  }
  return cats as EtfReportType[];
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const inPath = requireStringArg(args, 'in');
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;
  const categories = parseCategories(typeof args['categories'] === 'string' ? args['categories'] : undefined);

  const raw = await readFile(inPath, 'utf-8');
  const etfs = JSON.parse(raw) as Array<Pick<SampledEtf, 'symbol' | 'exchange'>>;
  if (!Array.isArray(etfs) || etfs.length === 0) {
    throw new Error('--in file must contain a non-empty JSON array of {symbol, exchange} objects');
  }

  const payloads = etfs.map((e) => buildPayload({ symbol: e.symbol, exchange: e.exchange }, categories));
  console.log(`Enqueueing generation for ${payloads.length} ETFs, categories: ${categories.join(', ')}`);

  const results = await fetchJson<EtfGenerationRequestRow[]>(`/api/${SPACE_ID}/etfs-v1/generation-requests`, {
    method: 'POST',
    body: payloads,
    authToken: true,
  });

  const requestIds = results.map((r) => r.id);
  console.log(`Created/updated ${requestIds.length} generation requests.`);

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(
      outPath,
      JSON.stringify(
        {
          categories,
          etfs: etfs.map((e, idx) => ({ ...e, requestId: requestIds[idx] ?? null })),
          requestIds,
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`Wrote request IDs → ${outPath}`);
  } else {
    console.log(JSON.stringify({ requestIds }, null, 2));
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
