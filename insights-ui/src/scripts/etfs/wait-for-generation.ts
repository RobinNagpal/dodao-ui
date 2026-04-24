import { readFile } from 'node:fs/promises';
import { SPACE_ID, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, requireStringArg, sleep } from './lib';

interface ByIdsRow {
  id: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';
  etf: { symbol: string; exchange: string; name: string };
  pendingSteps: string[];
  failedSteps: string[];
  completedSteps: string[];
  inProgressStep: string | null;
}

interface ByIdsResponse {
  requests: ByIdsRow[];
  missingIds: string[];
}

interface TriggerFileContents {
  requestIds: string[];
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const inPath = requireStringArg(args, 'in');
  const intervalSec = Math.max(5, parsePositiveInt(args['interval-sec']) ?? 20);
  const timeoutMin = parsePositiveInt(args['timeout-min']) ?? 90;
  const shouldTick = args['tick'] === true;

  const contents = JSON.parse(await readFile(inPath, 'utf-8')) as TriggerFileContents;
  if (!contents.requestIds || contents.requestIds.length === 0) {
    throw new Error(`--in file ${inPath} does not contain any requestIds`);
  }
  const target = contents.requestIds.slice();
  const deadline = Date.now() + timeoutMin * 60_000;
  console.log(`Waiting on ${target.length} generation requests (interval=${intervalSec}s, timeout=${timeoutMin}m, tick=${shouldTick})`);

  let lastLog = '';
  let missingWarned = false;

  while (Date.now() < deadline) {
    if (shouldTick) {
      try {
        await fetchJson(`/api/${SPACE_ID}/etfs-v1/generate-etf-v1-request`);
      } catch (err) {
        console.error('Tick failed (continuing to poll):', (err as Error).message);
      }
    }

    const resp = await fetchJson<ByIdsResponse>(`/api/${SPACE_ID}/etfs-v1/generation-requests/by-ids?ids=${encodeURIComponent(target.join(','))}`, {
      authToken: true,
    });

    if (!missingWarned && resp.missingIds.length > 0) {
      console.warn(`⚠️  Request IDs not found in DB: ${resp.missingIds.join(', ')} — will keep polling for the rest.`);
      missingWarned = true;
    }

    const byStatus = {
      NotStarted: resp.requests.filter((r) => r.status === 'NotStarted').length,
      InProgress: resp.requests.filter((r) => r.status === 'InProgress').length,
      Completed: resp.requests.filter((r) => r.status === 'Completed').length,
      Failed: resp.requests.filter((r) => r.status === 'Failed').length,
    };
    const log = `NotStarted=${byStatus.NotStarted} InProgress=${byStatus.InProgress} Completed=${byStatus.Completed} Failed=${byStatus.Failed} Missing=${resp.missingIds.length}`;
    if (log !== lastLog) {
      console.log(`[${new Date().toISOString()}] ${log}`);
      lastLog = log;
    }

    const stillPending = byStatus.NotStarted + byStatus.InProgress;
    if (stillPending === 0 && resp.requests.length + resp.missingIds.length === target.length) {
      console.log(`All requests settled. Found: ${resp.requests.length}, Missing: ${resp.missingIds.length}, Failed: ${byStatus.Failed}.`);
      if (byStatus.Failed > 0) {
        const failedRequests = resp.requests.filter((r) => r.status === 'Failed');
        for (const r of failedRequests) {
          console.log(`  FAILED ${r.etf.exchange}/${r.etf.symbol} — failedSteps: ${(r.failedSteps ?? []).join(', ') || '(unknown)'}`);
        }
      }
      if (resp.missingIds.length > 0) {
        process.exitCode = 1;
      }
      return;
    }

    await sleep(intervalSec * 1000);
  }

  throw new Error(`Timed out after ${timeoutMin} minutes waiting on generation requests`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
