import { readFile } from 'node:fs/promises';
import { SPACE_ID, fetchJson, parseArgs, requireAutomationSecret, requireStringArg, sleep } from './lib';

interface EtfGenerationRequestRow {
  id: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';
  etf: { symbol: string; exchange: string; name: string };
  pendingSteps?: string[];
  failedSteps?: string[];
  completedSteps?: string[];
  inProgressStep?: string | null;
}

interface EtfGenerationRequestsResponse {
  inProgress: EtfGenerationRequestRow[];
  failed: EtfGenerationRequestRow[];
  notStarted: EtfGenerationRequestRow[];
  completed: EtfGenerationRequestRow[];
}

interface TriggerFileContents {
  requestIds: string[];
}

function pickFromResponse(resp: EtfGenerationRequestsResponse, targetIds: Set<string>) {
  const all = [...resp.inProgress, ...resp.failed, ...resp.notStarted, ...resp.completed];
  return all.filter((r) => targetIds.has(r.id));
}

async function main() {
  requireAutomationSecret();
  const args = parseArgs(process.argv.slice(2));
  const inPath = requireStringArg(args, 'in');
  const intervalSec = typeof args['interval-sec'] === 'string' ? Math.max(5, parseInt(args['interval-sec'], 10)) : 20;
  const timeoutMin = typeof args['timeout-min'] === 'string' ? parseInt(args['timeout-min'], 10) : 90;
  const shouldTick = args['tick'] === true;

  const contents = JSON.parse(await readFile(inPath, 'utf-8')) as TriggerFileContents;
  if (!contents.requestIds || contents.requestIds.length === 0) {
    throw new Error(`--in file ${inPath} does not contain any requestIds`);
  }
  const target = new Set(contents.requestIds);
  const deadline = Date.now() + timeoutMin * 60_000;
  console.log(`Waiting on ${target.size} generation requests (interval=${intervalSec}s, timeout=${timeoutMin}m, tick=${shouldTick})`);

  // Large page sizes so we get all requests back
  const pagination = 'inProgressTake=200&failedTake=200&notStartedTake=200&completedTake=200';
  let lastLog = '';

  while (Date.now() < deadline) {
    if (shouldTick) {
      try {
        await fetchJson(`/api/${SPACE_ID}/etfs-v1/generate-etf-v1-request`, { authToken: true });
      } catch (err) {
        console.error('Tick failed (continuing to poll):', (err as Error).message);
      }
    }

    const resp = await fetchJson<EtfGenerationRequestsResponse>(`/api/${SPACE_ID}/etfs-v1/generation-requests?${pagination}`, { authToken: true });
    const ours = pickFromResponse(resp, target);
    const byStatus = {
      NotStarted: ours.filter((r) => r.status === 'NotStarted').length,
      InProgress: ours.filter((r) => r.status === 'InProgress').length,
      Completed: ours.filter((r) => r.status === 'Completed').length,
      Failed: ours.filter((r) => r.status === 'Failed').length,
    };
    const log = `NotStarted=${byStatus.NotStarted} InProgress=${byStatus.InProgress} Completed=${byStatus.Completed} Failed=${byStatus.Failed}`;
    if (log !== lastLog) {
      console.log(`[${new Date().toISOString()}] ${log}`);
      lastLog = log;
    }

    const stillPending = byStatus.NotStarted + byStatus.InProgress;
    if (stillPending === 0 && ours.length === target.size) {
      console.log(`All ${target.size} requests settled. Failed: ${byStatus.Failed}.`);
      if (byStatus.Failed > 0) {
        const failedRequests = ours.filter((r) => r.status === 'Failed');
        for (const r of failedRequests) {
          console.log(`  FAILED ${r.etf.exchange}/${r.etf.symbol} — failedSteps: ${(r.failedSteps ?? []).join(', ') || '(unknown)'}`);
        }
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
