import { prisma } from '@/prisma';
import { PromptInvocationStatus } from '@prisma/client';

/**
 * How long a prompt invocation may sit `InProgress` before the heartbeat treats it
 * as orphaned. Real LLM calls finish in minutes; the report step-level stale guard
 * is 10 min. 30 min is comfortably beyond any legitimate in-flight call, so nothing
 * still running is ever reclaimed.
 */
const STALE_INVOCATION_MS = 30 * 60 * 1000;

export interface ReclaimStaleInvocationsResult {
  reclaimed: number;
}

/**
 * Fail invocations left `InProgress` well past any real call. An invocation is
 * created `InProgress` and only flips to `Completed`/`Failed` inside the LLM call's
 * try/catch (see `get-llm-response.ts`); if the process is killed mid-call (e.g. a
 * container redeploy rolls the server while a batch is generating), that update
 * never runs and the row is orphaned forever. Left alone these accumulate and skew
 * the `InProgress` counts. Marking them `Failed` is safe: the owning report step is
 * reclaimed independently by its own stale guard and re-run via the step retry, and
 * each retry opens a fresh invocation — this only cleans up the abandoned row.
 */
export async function reclaimStaleInvocations(spaceId: string): Promise<ReclaimStaleInvocationsResult> {
  const cutoff = new Date(Date.now() - STALE_INVOCATION_MS);
  const result = await prisma.promptInvocation.updateMany({
    where: {
      spaceId,
      status: PromptInvocationStatus.InProgress,
      updatedAt: { lt: cutoff },
    },
    data: {
      status: PromptInvocationStatus.Failed,
      error: 'Reclaimed by heartbeat: invocation stuck InProgress beyond 30m (the process was likely restarted mid-call).',
    },
  });
  return { reclaimed: result.count };
}
