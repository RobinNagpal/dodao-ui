import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1GenerationRequest } from '@prisma/client';

interface UpdateRequestStatusPayload {
  id: string;
  status: GenerationRequestStatus;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1GenerationRequest> {
  const payload = (await req.json()) as UpdateRequestStatusPayload;

  const { id, status } = payload;

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
      ...(status === GenerationRequestStatus.InProgress && {
        startedAt: new Date(),
      }),
      ...(status === GenerationRequestStatus.Completed && {
        completedAt: new Date(),
      }),
    },
  });

  return updatedRequest;
}

export const POST = withErrorHandlingV2<TickerV1GenerationRequest>(postHandler);
