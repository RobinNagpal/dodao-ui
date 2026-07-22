import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { AutoGenerationStatus } from '@/utils/auto-generation/auto-gen-models';
import { getAutoGenerationStatus } from '@/utils/auto-generation/auto-gen-status';
import { NextRequest } from 'next/server';

/**
 * Read-only diagnostic for the nightly auto-generation job. Returns exactly why a
 * stock/ETF batch would or would not be created right now — the resolved App
 * Settings controls (with their SSM/env/default source), the run-window state, the
 * shared Claude usage gate, and a per-entity gate breakdown — WITHOUT enqueuing
 * anything. Use this instead of hitting `/cron/heartbeat` (which has side effects)
 * to inspect the gate that is blocking auto-generation.
 *
 * Gated by `withAdminOrToken` (admin JWT or `x-automation-token` / `?token=`) since
 * it exposes resolved config and Claude usage.
 */
async function getHandler(_req: NextRequest, _userContext: unknown, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoGenerationStatus> {
  const { spaceId } = await params;
  return getAutoGenerationStatus(spaceId);
}

export const GET = withAdminOrToken<AutoGenerationStatus>(getHandler);
