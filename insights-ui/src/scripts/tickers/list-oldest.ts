import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ReportType } from '@/types/ticker-typesv1';
import type { OldestStocksByReportTypeResponse } from '@/app/api/[spaceId]/tickers-v1/oldest-by-report-type/route';
import { API_BASE, AUTOMATION_SECRET, SPACE_ID, fetchJson, parseArgs, parsePositiveInt } from './lib';

const DEFAULT_REPORT_TYPE = ReportType.BUSINESS_AND_MOAT;
const DEFAULT_LIMIT = 5;

const SUPPORTED_REPORT_TYPES: readonly ReportType[] = [
  ReportType.BUSINESS_AND_MOAT,
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_GROWTH,
  ReportType.FAIR_VALUE,
];

function toReportType(raw: string): ReportType {
  const matched = SUPPORTED_REPORT_TYPES.find((t) => t === raw);
  if (!matched) {
    throw new Error(`Invalid --report-type "${raw}". Supported values: ${SUPPORTED_REPORT_TYPES.join(', ')}`);
  }
  return matched;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const reportTypeArg = args['report-type'];
  const reportType = typeof reportTypeArg === 'string' && reportTypeArg.length > 0 ? toReportType(reportTypeArg) : DEFAULT_REPORT_TYPE;
  const limit = parsePositiveInt(args['limit']) ?? DEFAULT_LIMIT;
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;

  const authToken = AUTOMATION_SECRET.length > 0;
  const query = new URLSearchParams({ reportType, limit: String(limit) }).toString();

  const response = await fetchJson<OldestStocksByReportTypeResponse>(`/api/${SPACE_ID}/tickers-v1/oldest-by-report-type?${query}`, { authToken });

  const payload = JSON.stringify(response, null, 2);
  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, payload, 'utf-8');
    console.error(`Wrote ${response.items.length} stocks → ${outPath} [${API_BASE} | ${reportType} | limit=${limit}]`);
  } else {
    console.error(`Found ${response.items.length} stocks with the oldest "${reportType}" reports (limit=${limit}).`);
    process.stdout.write(payload + '\n');
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
