import 'dotenv/config';

const CANDIDATE_CODES_API_BASE = (process.env.CANDIDATE_CODES_API_BASE ?? 'https://tariffs.flexport.com/api/public/v1').replace(/\/+$/, '');
const DEFAULT_HTS_CODE = '0511994070';
const REQUEST_TIMEOUT_MS = 15_000;

interface VerifyResult {
  ok: boolean;
  status: number;
  url: string;
  resultCount: number | null;
  error?: string;
}

function parseHtsCodeArg(argv: string[]): string {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--code') return argv[i + 1] ?? DEFAULT_HTS_CODE;
    if (a.startsWith('--code=')) return a.slice('--code='.length);
  }
  return DEFAULT_HTS_CODE;
}

function countResults(payload: unknown): number | null {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['results', 'candidates', 'candidate_codes', 'data']) {
      const value = record[key];
      if (Array.isArray(value)) return value.length;
    }
    return Object.keys(record).length > 0 ? Object.keys(record).length : 0;
  }
  return null;
}

async function verifyCandidateCodes(htsCode: string): Promise<VerifyResult> {
  const url = `${CANDIDATE_CODES_API_BASE}/candidate-codes/${encodeURIComponent(htsCode)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, url, resultCount: null, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    const payload: unknown = await res.json();
    const resultCount = countResults(payload);
    if (resultCount === null || resultCount === 0) {
      return { ok: false, status: res.status, url, resultCount, error: 'Response did not contain any candidate codes' };
    }
    return { ok: true, status: res.status, url, resultCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, url, resultCount: null, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

async function main(): Promise<void> {
  const htsCode = parseHtsCodeArg(process.argv.slice(2));
  console.log(`Verifying candidate-codes API for HTS code ${htsCode}`);

  const result = await verifyCandidateCodes(htsCode);
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    console.error(`Verification FAILED: ${result.error ?? 'unknown error'}`);
    process.exit(1);
  }
  console.log(`Verification OK — ${result.resultCount} candidate code${result.resultCount === 1 ? '' : 's'} returned.`);
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
