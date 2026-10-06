import { prisma } from '@/prisma';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { withAdminOnly } from '@/app/api/helpers/withLoggedInAdmin';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

interface UpdateRequestStatusPayload {
  id: string;
  status: GenerationRequestStatus;
  completed_steps?: string[];
  failed_steps?: string[];
  mark_started?: boolean;
  mark_completed?: boolean;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1GenerationRequest> {
  const payload = (await req.json()) as UpdateRequestStatusPayload;

  const { id, status, completed_steps, failed_steps, mark_started, mark_completed } = payload;

  // Validate status is a valid enum value
  if (!Object.values(GenerationRequestStatus).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Update the generation request
  const updatedRequest = await prisma.tickerV1GenerationRequest.update({
    where: {
      id,
    },
    data: {
      status,
      updatedAt: new Date(),
      ...(completed_steps !== undefined && {
        completedSteps: completed_steps,
      }),
      ...(failed_steps !== undefined && {
        failedSteps: failed_steps,
      }),
      ...(mark_started && {
        startedAt: new Date(),
      }),
      ...(mark_completed && {
        completedAt: new Date(),
      }),
    },
  });

  // No credit is settled here: paid runs settle only in the generation pipeline
  // (markAsCompleted). A request ended by hand here is picked up by the
  // heartbeat's stale-spend reconciliation, which charges or releases it from
  // the stored status.

  return updatedRequest;
}

// Admin only: it can end a generation request (which decides whether a paid run is charged). No code calls it.
export const POST = withAdminOnly<TickerV1GenerationRequest>(postHandler);
