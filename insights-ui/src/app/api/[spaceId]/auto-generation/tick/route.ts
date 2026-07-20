import { AutoGenTickResult } from '@/utils/auto-generation/auto-gen-models';
import { runAutoGenerationTick } from '@/utils/auto-generation/auto-generation-tick';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Single cron endpoint for all automated report generation. A generic infra
 * heartbeat hits this every 5 min, 24/7 — it is just a clock. All scheduling
 * policy (which entities, the run window, the frequency, the batch size, the mode)
 * is read from App Settings inside `runAutoGenerationTick`, so it can all change at
 * runtime without editing the schedule. Outside the window / during a cooldown the
 * jobs return immediately without touching Claude.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoGenTickResult> {
  const { spaceId } = await params;
  return runAutoGenerationTick(spaceId);
}

export const GET = withErrorHandlingV2<AutoGenTickResult>(getHandler);
